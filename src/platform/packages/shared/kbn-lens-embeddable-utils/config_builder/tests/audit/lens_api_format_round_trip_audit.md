# Lens API format round-trip audit

- Audit date: 2026-08-30
- Source revision: `85e3992a3870b6282d510d9aaba534a27b533448`

## Outcome

There is no finite, useful count of all Lens setting permutations. The public API schema contains free-form strings and numbers, variable-length arrays, and recursively composed operations. Even after field names and custom expression text are replaced with sentinels, the recursive and array-shaped configuration space remains unbounded. A Cartesian-product test is therefore not feasible.

The practical test unit is a bounded semantic equivalence class: chart type, datasource mode, layer role, operation family, and one setting transition at a time. The existing corpus and unit tests cover many such classes, but they do not currently establish non-lossy editor and renderer behavior.

This audit found:

- 39 shipped XY panels whose legacy state converts to a schema-invalid API config.
- Hidden custom XY axis and series-header text that is lost in both conversion directions. Nine shipped panels contain the hidden-axis form.
- Dormant legend truncation preferences that are lost while their control is inactive. The corpus contains 4 heatmaps and 19 partition charts with this state; the equivalent XY list-layout state is editor-reachable but absent from the corpus.
- No conversion of chart attributes for by-reference panels. They remain an opaque saved-object reference and serve as a transport control.

The audit intentionally records minimized, green repro tests rather than changing conversion behavior.

## What was walked

Lens does not have one declarative editor AST. The effective model is spread across:

1. Persisted visualization and datasource types in `@kbn/lens-common`.
2. The Zod API schemas in `config_builder/schema`.
3. State/API converters in `config_builder/transforms`.
4. Conditional editor controls in each visualization toolbar.
5. Renderer expression builders such as XY `toExpression`.
6. Dashboard transform-in/transform-out routing controlled by `lens.apiFormat`.

The Zod root has 12 chart branches and 383 definitions. A one-time JSON Schema walk followed references, stopped each recursive edge after one visit, and deduplicated property paths across union branches. The counts below are structural inventory counts, not counts of valid configurations.

| API chart | Property paths | Optional paths | Enum sites | Boolean sites | Union sites | Free scalar sites | Array sites |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `metric` | 253 | 126 | 32 | 35 | 58 | 119 | 11 |
| `legacy_metric` | 103 | 57 | 9 | 15 | 29 | 52 | 5 |
| `xy` | 389 | 199 | 29 | 58 | 95 | 163 | 25 |
| `gauge` | 188 | 93 | 21 | 26 | 46 | 98 | 5 |
| `heatmap` | 243 | 123 | 23 | 39 | 55 | 113 | 15 |
| `tag_cloud` | 196 | 87 | 16 | 26 | 47 | 102 | 14 |
| `region_map` | 139 | 66 | 11 | 22 | 32 | 73 | 9 |
| `data_table` | 312 | 139 | 27 | 39 | 83 | 154 | 30 |
| `pie` | 208 | 101 | 16 | 28 | 54 | 103 | 16 |
| `mosaic` | 278 | 124 | 21 | 35 | 70 | 141 | 26 |
| `treemap` | 206 | 99 | 16 | 28 | 52 | 103 | 16 |
| `waffle` | 204 | 97 | 16 | 26 | 52 | 103 | 17 |

Every chart branch also reaches three map-shaped sites and at least one recursive operation edge. “Free scalar” means a string or number without an enum/constant restriction. Field names, labels, queries, and formulas are among those sites, but replacing their contents with sentinels does not make the overall structure enumerable.

## Scope and parity rule

In scope:

- All 12 API chart types.
- Legacy state to API to legacy state.
- API to legacy state to API.
- The flattened dashboard wire path used when `lens.apiFormat` is enabled.
- Editor state that can affect a later edit, even when it is inactive in the current render.
- Renderer expression arguments after canonicalizing generated layer and column IDs.

Out of scope:

- The identity of field names, data-view IDs, generated IDs, labels, and custom expression text.
- Exhaustive numeric/string values.
- Fixes for the findings.

Allowed differences are limited to generated identities, reference extraction/injection, legacy aliases, and defaults or dead fields proven to have the same editor and renderer behavior. A value is not considered safely ignorable merely because it is hidden by the current editor control. If re-enabling the control changes the renderer result after a round trip, it is a loss.

## Corpus coverage

The tracked integration corpus contains 10,063 panels. A sentinel fingerprint replaces IDs, field identities, and expression contents while retaining operation families, non-empty/empty distinctions, settings, and layer structure.

| API chart after partition-shape split | Panels | Sentinel fingerprints |
| --- | ---: | ---: |
| `data_table` | 1,910 | 1,762 |
| `gauge` | 60 | 48 |
| `heatmap` | 34 | 31 |
| `legacy_metric` | 470 | 377 |
| `metric` | 2,012 | 1,832 |
| `mosaic` | 5 | 5 |
| `pie` | 1,584 | 1,480 |
| `region_map` | 28 | 27 |
| `tag_cloud` | 12 | 11 |
| `treemap` | 148 | 85 |
| `xy` | 3,800 | 3,497 |
| `waffle` | 0 | 0 |

Fingerprint counts measure observed structural diversity; they are not a parity proof. The corpus has no waffle example and very few tag cloud, heatmap, region map, mosaic, and gauge examples.

The committed integration test currently reports 9,927 passing cases and 136 todos. Its stable set excludes all 60 gauges and all 28 region maps, and its title-based skip list excludes another 48 cases. Running the current validator over every corpus entry produced 10,024 passes and 39 failures:

- All 28 region maps pass the strict normalized state comparison.
- All 60 gauges pass schema conversion, but gauge is not in the strict state-comparison set.
- Nine title-skipped cases now pass: four heatmaps and five unrelated panels also named `Memory Usage`.
- The remaining 39 failures are the schema-invalid XY findings below.

Before these audit repros, all config-builder tests reported 11,441 passes, 138 todos, and 130 snapshots. Converter-file coverage was 94.04% statements, 87.57% branches, 99.40% functions, and 94.35% lines. The corpus test alone covered 82.33% statements, 73.54% branches, 89.70% functions, and 82.65% lines. Coverage is useful for locating missing branches, but normalizers and permissive comparisons mean it cannot establish semantic parity.

## Findings

### F1: shipped XY states can produce schema-invalid API configs

- Severity: rollout blocker for affected panels
- Direction: legacy state to API

The 39 failures divide into three distinct cases:

| Legacy state | Corpus count | API result |
| --- | ---: | --- |
| `area_unstacked` series | 17 | The state-to-API lookup has no mapping, so the layer `type` is `undefined`. |
| `bar_unstacked` series | 20 | The state-to-API lookup has no mapping, so the layer `type` is `undefined`. |
| Empty reference-line editor layer | 1 | Emits `thresholds: []`, while the API requires at least one threshold. |
| String terms size (`"50"`) | 1 | Emits a string `limit`, while the API requires a number. |

These are not canonicalization differences: the resulting document fails `lensApiConfigSchema`. The minimized repros correspond to the three output shapes; the two legacy series values share one converter defect.

### F2: hidden XY title text is discarded

- Severity: editor-state and later-renderer loss
- Directions: both

The API schema permits `{ text, visible: false }` for both axis titles and the series header. The converters instead omit `text` whenever visibility is false. On the return conversion, the title becomes `undefined`.

Current pixels are equivalent while the title is hidden. They stop being equivalent after the user enables the title: the original state renders the custom text, while the round-tripped state renders an empty/default title. The renderer AST repro verifies this transition.

Corpus observations:

- 9 XY panels have a hidden left-axis title with non-empty custom text.
- 0 panels have a hidden series header with non-empty custom text.

The series-header case is nevertheless editor-reachable and is accepted by the public API schema.

### F3: inactive legend truncation preferences are discarded

- Severity: editor-state and later-renderer loss
- Direction: legacy state to API to legacy state

Three editor states retain a max-lines preference while truncation is inactive, but the API representation cannot carry that dormant value:

| Visualization/state | Corpus count | Lost state |
| --- | ---: | --- |
| XY top/bottom list layout | 0 | `shouldTruncate` and `maxLines` |
| Heatmap with truncation disabled | 4 | `maxLines` |
| Pie/partition with truncation disabled | 19 | `legendMaxLines` |

The inactive render is equivalent. After the user switches the XY legend back to grid layout or re-enables truncation on heatmap/partition, the original state uses the remembered value while the round-tripped state uses the default of one line. The XY renderer AST repro confirms the changed `maxLines` argument.

## Existing validator blind spots

The state validator performs strict equality only after chart normalizers rewrite the original state. Several normalizers explicitly remove the values in F2/F3, so those tests encode the loss as an accepted difference:

- XY removes axis title text when visibility is false and truncation state for list legends.
- Heatmap removes `maxLines` when truncation is false.
- Partition removes `legendMaxLines` when truncation is false.

The common normalizer also ignores broad datasource paths such as operation `params`, `scale`, ES|QL column metadata, formula reference arrays, and color-mapping `touched` markers. Most sampled differences are reconstructed representations, runtime-only metadata, or defaults, but an ignore at that granularity can conceal a newly unmapped user setting. Those paths remain residual risk rather than certified parity.

The API-origin validator uses `toMatchObject`, allowing extra defaults on output. That is appropriate for canonicalization, but it needs targeted fixtures for optional combinations; otherwise schema-valid values such as hidden title text are never exercised.

## Executable evidence

The tracked evidence is intentionally green while asserting the precise current loss:

- `config_builder/tests/audit/loss_repro_fixtures.ts` contains minimized/sentinel fixtures.
- `config_builder/tests/audit/lens_api_format_round_trip_losses.test.ts` covers both directions, dormant editor transitions, and schema-invalid legacy outputs.
- `x-pack/platform/plugins/shared/lens/common/transforms/transform_out.test.ts` exercises the dashboard `lens.apiFormat` wire path and the by-reference control.
- `x-pack/platform/plugins/shared/lens/public/visualizations/xy/to_expression.test.ts` compares renderer AST arguments after the affected editor settings are re-enabled.

Validation after adding the evidence:

- Config-builder suite: 69 suites, 11,451 passing tests, 138 existing todos, and 130 passing snapshots.
- Scoped type checks: `kbn-lens-embeddable-utils` and the Lens plugin both pass.
- `scripts/check.js --scope=local`: two affected Jest configs and 22,398 tests pass; lint and both affected TypeScript projects pass.

## Recommended follow-up

1. Treat F1 as a feature-flag rollout gate and convert each repro from “asserts invalid” to “asserts valid” with the eventual fix.
2. Preserve hidden title text because the API schema already represents it.
3. Decide whether dormant truncation preferences belong in the public API. If they do, extend the schemas; if they do not, make the editor intentionally reset them and document that behavior.
4. Enable strict gauge state comparison, add waffle corpus fixtures, and move gauge/region map into the active integration set.
5. Key corpus skips by package plus panel identity rather than title alone, then remove the nine stale todos.
6. Replace broad normalizer ignores with per-operation semantic projections and reason-coded allowed differences.
7. Use pairwise or covering-array generation over the structural decision points, with fixed sentinel values and bounded layer/operation depth. Compare normalized renderer ASTs in addition to persisted objects.
