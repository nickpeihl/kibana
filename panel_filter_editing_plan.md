# Implementation Plan: Panel-Level Filter Editing for Vega and Custom Content

## Issue Reference
[#137206 — [Dashboard Usability] Edit for panel-level filters](https://github.com/elastic/kibana/issues/137206)

## Background

PR #136655 introduced a read-only modal showing panel-level filters. The issue asks to make those
filters editable inline instead of requiring navigation to the visualization's native editor.

The user's goal is to implement this for **Vega embeddable** and **Custom Content embeddable** as
consumers, extending beyond the existing Lens-only path. The user chose:

- **Vega**: Add persistent `filters` and `query` to `VegaByValueState` (survive page reload)
- **Custom Content**: Fix the `filters$` separation (panel-level vs. effective merged filters)
- **Inline edit location**: Settings flyout only (`FiltersDetails` in `CustomizePanelEditor`)
  — `FiltersNotificationPopover` stays read-only with navigate-away button

---

## Current State (confirmed by code audit)

| Embeddable | Has `filters$`/`query$` on API | `setFilters` | Settings flyout shows filters |
|---|---|---|---|
| Lens | ✅ read-only from attributes | ✗ | ✅ (navigates away to edit) |
| Vega (standalone by-value) | ✗ | ✗ | ✗ |
| Custom Content | ✗ (internal only, mixed effective+panel) | ✗ | ✗ |
| Discover | ✅ writable | ✅ (`canEditUnifiedSearch: false`) | ✅ |
| APM Service Map | ✅ read-only | ✗ | ✅ (navigates away) |

**Key existing APIs** (all in `@kbn/presentation-publishing`):

```ts
// Read-only: shows filters in Settings flyout badge
PublishesUnifiedSearch = PublishesTimeRange & PublishesFilters & {
  query$: PublishingSubject<Query | AggregateQuery | undefined>;
  canEditUnifiedSearch?: () => boolean;
}

// Writable: enables inline editing
PublishesWritableUnifiedSearch = PublishesUnifiedSearch & PublishesWritableTimeRange & {
  setFilters: (filters: Filter[] | undefined) => void;
  setQuery: (query: Query | undefined) => void;
}
```

The `FiltersDetails` component in `customize_panel_editor.tsx` already accepts
`Partial<PublishesWritableUnifiedSearch>` via its `api: CustomizePanelActionApi` prop — the type
plumbing is already correct. The gap is:
1. No embeddable except Discover currently implements `setFilters`/`setQuery`
2. `FiltersDetails` never uses writable mode; it always shows `<FilterItems readOnly={true} />`
   and redirects to `executeEditPanelAction`

---

## Architecture Decision: Shared `initializePanelFiltersManager`

Rather than duplicating BehaviorSubject + comparator boilerplate across embeddables, extract a
shared initializer into the `presentation_publishing` package.

### New file
`src/platform/packages/shared/presentation/presentation_publishing/filters/initialize_panel_filters_manager.ts`

```ts
export interface PanelFiltersManagerState {
  filters?: Filter[];
  query?: Query;
}

export interface PanelFiltersManagerConfig {
  api: PublishesWritableUnifiedSearch['setFilters'] extends infer F
    ? Pick<PublishesWritableUnifiedSearch, 'filters$' | 'query$' | 'setFilters' | 'setQuery'>
    : never;
  anyStateChange$: Observable<void>;
  comparators: StateComparators<PanelFiltersManagerState>;
  getLatestState: () => PanelFiltersManagerState;
  reinitializeState: (state?: Partial<PanelFiltersManagerState>) => void;
}

export function initializePanelFiltersManager(
  initialState: Partial<PanelFiltersManagerState>
): PanelFiltersManagerConfig {
  const filters$ = new BehaviorSubject<Filter[] | undefined>(initialState.filters);
  const query$ = new BehaviorSubject<Query | undefined>(initialState.query);

  return {
    api: {
      filters$,
      query$,
      setFilters: (filters) => filters$.next(filters),
      setQuery: (query) => query$.next(query),
    },
    anyStateChange$: merge(
      filters$.pipe(skip(1), map(() => undefined)),
      query$.pipe(skip(1), map(() => undefined))
    ),
    comparators: {
      filters: 'deepEquality',
      query: 'deepEquality',
    },
    getLatestState: () => ({
      filters: filters$.getValue(),
      query: query$.getValue(),
    }),
    reinitializeState: (state) => {
      filters$.next(state?.filters);
      query$.next(state?.query);
    },
  };
}
```

Export from the package index alongside `initializeTimeRangeManager`.

---

## Phase 1: Update `FiltersDetails` to support inline editing

**File:** `src/platform/plugins/shared/embeddable/public/ui_actions/customize_panel_action/filters_details.tsx`

### Change

Check `apiPublishesWritableUnifiedSearch(api)` at render time. When true:
- Render `<FilterItems readOnly={false} onChange={...} />` instead of `readOnly={true}`
- Call `api.setFilters(newFilters)` on change
- Remove the navigate-away "Edit filters" button
- Keep the navigate-away "Edit query" button (query editing still requires the native editor)

When false (current behavior):
- Keep `<FilterItems readOnly={true} />`
- Keep the navigate-away "Edit" buttons

The `save()` function in `CustomizePanelEditor` does not need changes: `FiltersDetails` will call
`api.setFilters()` directly on change (live update, not on Save). This is consistent with how
Discover's `setFilters` behaves.

```tsx
// Inside FiltersDetails
const isWritable = apiPublishesWritableUnifiedSearch(api);

// Filters row
<FilterItems
  filters={filters}
  indexPatterns={dataViews}
  readOnly={!isWritable}
  onChange={isWritable ? (newFilters) => api.setFilters(newFilters) : undefined}
/>

// Edit button (only when not inline-editable)
{showEditButton && !isWritable && (
  <EuiButtonEmpty onClick={() => executeEditPanelAction(api)}>Edit</EuiButtonEmpty>
)}
```

> **Note on `FilterItems` props**: Verify that `@kbn/unified-search-plugin/public`'s `FilterItems`
> accepts an `onChange` prop and functions in non-readOnly mode. If it does not, use
> `FilterBar` or the `FiltersBuilder` component instead.

---

## Phase 2: Add `setFilters`/`setQuery` to Lens

**File:** `x-pack/platform/plugins/shared/lens/public/react_embeddable/initializers/initialize_search_context.ts`

### Why

Lens already has `filters$` and `query$` (panel-level from `attributes.state.filters`/`query`),
but no `setFilters`/`setQuery`. Without these, the Settings flyout cannot enable inline editing
for Lens even after Phase 1.

### Change

Add `setFilters` and `setQuery` to the returned API and update the type:

```ts
return {
  api: {
    filters$,
    query$,
    // new:
    setFilters: (newFilters) => {
      filters$.next(newFilters);
      internalApi.updateAttributes({
        ...internalApi.attributes$.getValue(),
        state: {
          ...internalApi.attributes$.getValue().state,
          filters: newFilters ?? [],
        },
      });
    },
    setQuery: (newQuery) => {
      query$.next(newQuery);
      internalApi.updateAttributes({
        ...internalApi.attributes$.getValue(),
        state: {
          ...internalApi.attributes$.getValue().state,
          query: newQuery,
        },
      });
    },
    isCompatibleWithUnifiedSearch: () => true,
    ...timeRangeManager.api,
  },
  anyStateChange$: merge(
    timeRangeManager.anyStateChange$,
    // new: filters and query are part of serialized attributes so anyStateChange$ already
    // covers them via the attributes subscription — confirm before adding here
  ),
  ...
};
```

Update `SearchContextConfig.api` type in the same file to include `setFilters` and `setQuery`.
Update `LensApi` in `src/platform/packages/shared/kbn-lens-common-2/index.ts` to include
`PublishesWritableUnifiedSearch` (or the partial subset: `setFilters` + `setQuery`).

> **Risk**: Lens's `anyStateChange$` propagates to the dashboard's unsaved-changes indicator.
> Confirm that updating `internalApi.attributes$` via `setFilters` is picked up by the existing
> dirty-state machinery so the dashboard correctly prompts "unsaved changes" after filter edits.

---

## Phase 3: Update Vega embeddable

**File:** `src/platform/plugins/private/vis_types/vega/public/embeddable/vega_embeddable.tsx`

### State changes

```ts
export type VegaByValueState = SerializedTitles &
  SerializedTimeRange &
  SerializedDrilldowns & {
    spec: string;
    // new:
    filters?: Filter[];
    query?: Query;
  };
```

### Embeddable changes

```ts
const panelFiltersManager = initializePanelFiltersManager({
  filters: initialState.filters,
  query: initialState.query,
});

// Update serializeState:
serializeState: () => ({
  ...titleManager.getLatestState(),
  ...timeRangeManager.getLatestState(),
  ...drilldownsManager.getLatestState(),
  spec: spec$.getValue(),
  ...panelFiltersManager.getLatestState(), // new
}),

// Update anyStateChange$:
anyStateChange$: merge(
  titleManager.anyStateChange$,
  timeRangeManager.anyStateChange$,
  drilldownsManager.anyStateChange$,
  panelFiltersManager.anyStateChange$, // new
  spec$.pipe(skip(1), map(() => undefined))
),

// Update getComparators:
getComparators: () => ({
  ...titleComparators,
  ...timeRangeComparators,
  ...drilldownsManager.comparators,
  ...panelFiltersManager.comparators, // new
  spec: 'referenceEquality',
}),

// Update applySerializedState:
applySerializedState: (nextState) => {
  titleManager.reinitializeState(nextState);
  timeRangeManager.reinitializeState(nextState);
  drilldownsManager.reinitializeState(nextState);
  panelFiltersManager.reinitializeState(nextState); // new
  spec$.next(nextState.spec);
},

// Spread into finalizeApi:
const api = finalizeApi({
  ...titleManager.api,
  ...timeRangeManager.api,
  ...drilldownsManager.api,
  ...panelFiltersManager.api, // new — brings filters$, query$, setFilters, setQuery
  ...stateApi,
  ...
});
```

### Type change

```ts
export type VegaEmbeddableApi = DefaultEmbeddableApi<VegaByValueState> &
  HasDrilldowns &
  HasEditCapabilities &
  HasInspectorAdapters &
  HasSupportedTriggers &
  PublishesBlockingError &
  PublishesDataLoading &
  PublishesWritableDescription &
  PublishesWritableTitle &
  PublishesEsqlUsage &
  PublishesProjectRoutingOverrides &
  PublishesDataViews &
  PublishesRendered &
  // new:
  Pick<PublishesWritableUnifiedSearch, 'filters$' | 'query$' | 'setFilters' | 'setQuery'>;
```

> **`fetch$` and Vega data fetching**: Vega uses `fetch$(api)` to get the merged context.
> Verify whether `fetch$` picks up the embeddable's own `filters$` and `query$` and merges them
> into `ctx.filters`/`ctx.query`. If it does, no changes to the data loading pipeline are needed.
> If not, the Vega data-loading subscription needs to merge `panelFiltersManager.api.filters$`
> with `ctx.filters` manually before passing to Elasticsearch.

> **`canEditUnifiedSearch`**: Vega should NOT set this (leave undefined). The default behavior
> in `FiltersNotificationPopover` (defaults to `true`) means the navigate-away "Edit" button
> remains in the badge popover as a fallback (opens the Vega spec editor flyout). The Settings
> flyout gets the inline filter editor via Phase 1. This is the desired split.

---

## Phase 4: Update Custom Content embeddable

**File:** `x-pack/platform/plugins/shared/custom_content/public/custom_content_embeddable.tsx`

### Problem

Currently `filters$` and `query$` are internal BehaviorSubjects that receive the **merged
effective filters** from `fetch$` context. They are not on the public `CustomContentApi` type.
Because `fetch$` merges dashboard-level filters into them, exposing them as-is would cause
`FiltersNotificationAction` to show a badge on any Custom Content panel receiving dashboard-level
filters — incorrectly implying the panel has its own panel-level filters.

### Fix: separate panel-level from effective context

Rename the existing internal subjects used for rendering:

```ts
// internal only — receives merged effective filters for rendering
const effectiveFilters$ = new BehaviorSubject<Filter[] | undefined>(undefined);
const effectiveQuery$ = new BehaviorSubject<Query | AggregateQuery | undefined>(undefined);
```

Add new subjects for panel-level state via `initializePanelFiltersManager`:

```ts
const panelFiltersManager = initializePanelFiltersManager({
  filters: initialState.panelFilters,   // from serialized state
  query: initialState.panelQuery,       // from serialized state (optional)
});
```

Update `fetch$` subscription to feed the effective subjects:

```ts
const fetchSubscription = fetch$(api).subscribe((ctx) => {
  effectiveFilters$.next(ctx.filters);
  effectiveQuery$.next(ctx.query);
  // pass effectiveFilters$/effectiveQuery$ to rendering, not panelFiltersManager.api.filters$
  ...
});
```

Update `CustomContentComponent` to receive `effectiveFilters`/`effectiveQuery` for rendering.

Update serialized state type:

```ts
// In @kbn/custom-content-common or CustomContentEmbeddableState:
export interface CustomContentEmbeddableState {
  esql_query?: ...; // existing
  template?: string;
  panelFilters?: Filter[];
  panelQuery?: Query;
}
```

Update `serializeState`:

```ts
const serializeState = (): CustomContentEmbeddableState => ({
  ...titleManager.getLatestState(),
  esql_query: toEsqlQueryState(esqlQuery$.getValue()),
  template: template$.getValue(),
  panelFilters: panelFiltersManager.getLatestState().filters,
  panelQuery: panelFiltersManager.getLatestState().query,
});
```

Update `CustomContentApi`:

```ts
export type CustomContentApi = DefaultEmbeddableApi<CustomContentEmbeddableState> &
  HasTypeDisplayName &
  HasEditCapabilities &
  PublishesDataViews &
  PublishesDataLoading &
  PublishesEsqlUsage &
  // new:
  Pick<PublishesWritableUnifiedSearch, 'filters$' | 'query$' | 'setFilters' | 'setQuery'>;
```

Expose `panelFiltersManager.api` through `finalizeApi`.

> **`canEditUnifiedSearch`**: Set `canEditUnifiedSearch: () => false` on Custom Content. The
> Custom Content editor flyout (ES|QL + template) is reached via `ACTION_EDIT_PANEL` and is
> the wrong place to edit panel-level KQL filters. The navigate-away button in
> `FiltersNotificationPopover` should not appear for Custom Content. The Settings flyout will
> use the inline editor from Phase 1.

> **`timeRange$`**: `PublishesUnifiedSearch` requires `timeRange$`. Custom Content needs to
> expose the parent's time range (or its own if it has one) so `apiPublishesUnifiedSearch(api)`
> returns true and the Settings flyout renders the filters section. Check whether
> `apiPublishesTimeRange(customContentApi)` already returns true via the parent's propagation,
> or whether we need to expose an explicit `timeRange$`.

---

## Phase 5: `FiltersNotificationAction` compatibility check

The badge action (`FiltersNotificationAction`) uses `apiPublishesPartialUnifiedSearch(api)`. With
the changes above, Vega and Custom Content panels will now pass this check when they have panel-
level filters set. This is the correct behavior.

However, confirm that the compatibility change subject fires correctly when panel-level filters
change on Vega and Custom Content (the `getCompatibilityChangesSubject` in the action merges
`embeddable.query$` and `embeddable.filters$`). No change needed if the new subjects are wired
correctly.

---

## File Change Summary

| File | Change |
|---|---|
| `presentation_publishing/.../filters/initialize_panel_filters_manager.ts` | New file |
| `presentation_publishing/index.ts` | Export new initializer |
| `embeddable/.../customize_panel_action/filters_details.tsx` | Inline editing when writable |
| `lens/.../initializers/initialize_search_context.ts` | Add `setFilters`, `setQuery` |
| `kbn-lens-common-2/index.ts` | Update `LensApi` type |
| `vega/.../vega_embeddable.tsx` | Panel filter state + writable API |
| `custom_content/.../custom_content_embeddable.tsx` | Separate panel vs effective filters |
| `custom_content/../types.ts` (or server index) | Add `panelFilters`, `panelQuery` to state |

---

## Open Questions (resolve before starting Phase 3/4)

1. **`fetch$` + Vega panel filters**: Does `fetch$(api)` automatically merge an embeddable's own
   `filters$`/`query$` into the context it provides back to that same embeddable? Grep for the
   `fetch$` implementation in `presentation_publishing` to confirm, then test manually.

2. **`FilterItems` writable mode**: Confirm `FilterItems` from `@kbn/unified-search-plugin/public`
   accepts `onChange` and renders an interactive filter builder when `readOnly={false}`. If not,
   find the right component (likely `FiltersBuilder` or `FilterBar`).

3. **`timeRange$` for Custom Content**: Does `apiPublishesUnifiedSearch(customContentApi)` return
   true after adding `filters$` and `query$`, or does it also need `timeRange$` to be on the API?
   Check the guard function — it requires all three.

4. **Lens `anyStateChange$` with filter edits**: After calling `api.setFilters()` on a Lens
   panel, verify the dashboard's unsaved-changes indicator activates. The dirty-state mechanism
   tracks attribute changes; confirm `setFilters` triggers that correctly.

5. **APM Service Map**: APM already implements `canEditUnifiedSearch: () => true` but relies on
   `executeEditPanelAction`. After Phase 1, APM would get the inline filter editor automatically
   if its `api` passes `apiPublishesWritableUnifiedSearch`. Since APM does not implement
   `setFilters`, this change is backward-compatible — APM panels keep the navigate-away button.

---

## Testing Checkpoints

- Settings flyout for a Vega panel with saved panel filters shows inline editable filters
- Editing filters in the Vega Settings flyout triggers a re-fetch and the visualization updates
- Saving the dashboard after editing Vega panel filters persists the change (reload test)
- Custom Content panel with saved panel filters shows inline editable filters in Settings flyout
- Custom Content panel receiving dashboard-level filters does NOT show the filter notification badge
  (badge only appears when the panel has its own panel-level filters set)
- Lens Settings flyout shows inline editable filters (no navigate-away button when `setFilters` available)
- Lens dirty-state indicator appears after editing panel filters inline
- APM Service Map behavior unchanged (still navigates away to edit)
- Discover behavior unchanged (`canEditUnifiedSearch: false`, no inline editor shown)
