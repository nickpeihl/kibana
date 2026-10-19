# Vega

Dashboard supports a dedicated by-value `vega` panel. Its stored config holds a `spec` string
(JSON or HJSON); title, time range, drilldown, panel `query`, and panel `filters` fields are
optional. The string is preserved exactly, so comments and formatting round-trip.

The panel query and filters are combined with the dashboard's query and filters. Like the
dashboard's own search, they only reach the data sources that ask for it: Elasticsearch and ES|QL
data sources with `%context%: true`, and Elasticsearch data sources with the
`%dashboard_context-*%` placeholders. A data source that sends its own `body.query` without `%context%` ignores them. Data views
referenced by panel filters are stored as saved object references, so they follow the dashboard
through export, import, and copy to space.

Add or edit a panel from Dashboard's **Add panel** menu. Editing does not run the spec's queries as
you type: **Run preview** renders the current spec on the panel, **Apply and close** commits it to the
dashboard, and any other close — Cancel or Esc — reverts, removing a new panel or restoring an
existing panel's prior spec. Clicking outside the editor does not close it, so a stray click cannot
discard unsaved edits.

`visTypeVega` registers a server embeddable schema for `type: vega`, so Dashboard's public REST API
and generated OpenAPI include `vega` and validate its config.

## Legacy Vega panel migration

The `vega.legacyPanelMigration` feature flag (off by default) converts by-value legacy Vega
visualization panels (`legacy_vis` panels with a `vega` `savedVis`) into `vega` panels when a
dashboard is read, through the public REST API and the Dashboard app. The stored dashboard is not
changed.

- Specs that parse as a JSON object become `{ format: 'json', value }`; any other spec is kept as
  text with `{ format: 'hjson', value }`.
- The visualization's query and filters become the panel `query` and `filters`.
- The panel title and description fall back to the visualization's, so the rendered title does not
  change.
- By-reference legacy Vega panels are not migrated on read, because the dashboard doesn't store
  their vis type, and stay `legacy_vis`.

With the flag on, **Edit** on a by-reference legacy Vega dashboard panel opens the Vega library
editor instead of the Visualize app (through the visualizations `editByReference` vis type hook):

- Save creates a `vega` library item and replaces the panel with a by-reference `vega` panel in the
  same place. The legacy visualization is not changed.
- The item reuses the visualization's id when it is a valid as-code id. If an item with that id
  already exists, because the visualization was converted on another dashboard, the panel links to
  it right away and its editor opens.
- Range selection drilldowns are dropped, since legacy Vega never fires them.
- Panels whose container can't replace panels, such as Canvas elements, still open in Visualize.
