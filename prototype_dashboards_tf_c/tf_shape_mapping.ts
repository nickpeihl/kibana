// PROTOTYPE (spike C). The authored Terraform-shape mapping for the Dashboards API slice.
//
// Native form for option C: a TypeScript module that lives in Kibana next to the Zod schemas. It is never
// published. Kibana runs it (monomorphize.ts) over the Zod-derived JSON Schema and publishes only the result.
// Because it never leaves Kibana, variant recognizers may be plain functions (and could import Kibana's own
// helpers such as Lens `isByRefLensConfig` or dashboard `isSection`).
//
// `at` is a pattern over the Terraform-shaped path (spike0 attribute-tree path syntax): leading `**.` = any
// (possibly empty) prefix,
// `*` = one segment. The first matching rule wins, so per-location overrides come first.
//
// Every rule below is an authored exception except where marked CONVENTION. Unmapped unions are a hard error
// in the transformer, so this list is complete for the slice.

export type Label = string;

export type Rule =
  | {
      at: string;
      kind: 'variants';
      why: string;
      /** Property whose const value labels a branch (default 'type'). Branches without one fall back to title. */
      discriminator?: string;
      /** Label branches by their schema title instead (undiscriminated unions). */
      labelBy?: 'title';
      /** Branch label -> variant key ('drop' = variant not representable; value conversion throws on it). */
      key: (label: Label) => string | 'drop';
      /** Value recognizer for unions without a usable discriminator. Returns a branch label. */
      recognize?: (value: any) => Label;
      /** Sibling properties kept at the union's level instead of inside the variant (e.g. panel type, grid). */
      hoist?: string[];
      /** The variant key holds this property of the branch instead of the whole branch (panel `config`). */
      content?: string;
      /** Variant keys that keep the discriminator inside (baseline quirk: range slider `by_esql.values_source`). */
      keepDiscriminatorIn?: string[];
      /** How the derived schema expresses exclusivity. */
      exclusivity: 'exactly_one' | 'conflicts' | 'conflicts_with_discriminator' | 'exactly_one_with_discriminator';
      /** Extra JSON-leaf variant key next to the typed ones, allowed for these labels (panel `config_json`). */
      jsonVariant?: { key: string; labels: Label[] };
      /** Variant keys emitted as unexpanded objects (outside the slice). Value conversion passes them through. */
      opaque?: (key: string) => boolean;
    }
  | { at: string; kind: 'json'; why: string; name?: string }
  | { at: string; kind: 'merge'; why: string }
  | { at: string; kind: 'flatten'; why: string; prop: string }
  | { at: string; kind: 'split_sections'; why: string; into: string; recognize: (value: any) => 'section' | 'panel' };

const SLICE_PANELS = new Set(['image_config', 'vis_config']);
const SLICE_CHARTS = new Set([
  'xy_chart_config',
  'metric_chart_config',
  // drift_sim.ts: expand extra charts to see what full support for a new chart would demand.
  ...(process.env.PROTOTYPE_EXPAND_CHARTS ?? '').split(',').filter(Boolean),
]);
const SLICE_CONTROLS = new Set(['range_slider_control_config']);

// U5: baseline chart keys that do not follow `{type}_config` (lenscommon/terraform_chart_block_key.go).
const CHART_KEY_EXCEPTIONS: Record<string, string> = {
  xy: 'xy_chart_config',
  metric: 'metric_chart_config',
  pie: 'pie_chart_config',
  data_table: 'datatable_config',
  tag_cloud: 'tagcloud_config',
};

const XY_DATA_LAYER_TYPES = ['area', 'area_percentage', 'area_stacked', 'bar', 'bar_horizontal',
  'bar_horizontal_percentage', 'bar_horizontal_stacked', 'bar_percentage', 'bar_stacked', 'line'];

export const RULES: Rule[] = [
  // ---- U1 panel vs section: hand-coded special case (listed as a deviation, not a variant mapping).
  {
    at: 'panels',
    kind: 'split_sections',
    why: 'U1: baseline moves sections to root `sections[]`',
    into: 'sections',
    // Kibana's own recognizer (`isSection`): the item has a `panels` array.
    recognize: (v) => (Array.isArray(v?.panels) ? 'section' : 'panel'),
  },

  // ---- U2 panel type. CONVENTION `{type}_config`; config_json is an authored extra variant.
  {
    at: '**.panels[]',
    kind: 'variants',
    why: 'U2 CONVENTION {type}_config; +config_json extra variant',
    key: (t) => `${t}_config`,
    hoist: ['type', 'grid', 'id'],
    content: 'config',
    exclusivity: 'conflicts_with_discriminator',
    jsonVariant: { key: 'config_json', labels: ['vis', 'markdown'] },
    opaque: (k) => !SLICE_PANELS.has(k),
  },
  // Image panel: API `config.image_config.*` sits directly under `image_config.*`.
  { at: '**.panels[].image_config', kind: 'flatten', why: 'flatten: image panel drops a level', prop: 'image_config' },
  // U3 image src: key = discriminator value, no `_config` suffix.
  {
    at: '**.image_config.src',
    kind: 'variants',
    why: 'U3: key = type value (file/url), not {type}_config',
    key: (t) => t,
    exclusivity: 'exactly_one',
  },
  // U13 by-reference drilldowns: per-location override (dashboard/discover/url instead of the type value).
  {
    at: '**.by_reference.drilldowns[]',
    kind: 'variants',
    why: 'U13 per-location override: by_reference uses short names',
    key: (t) => t.replace(/_drilldown$/, ''),
    exclusivity: 'exactly_one',
  },
  // U12/U13 drilldowns elsewhere: key = discriminator value.
  {
    at: '**.drilldowns[]',
    kind: 'variants',
    why: 'U12/U13: key = type value, not {type}_config',
    key: (t) => t,
    exclusivity: 'exactly_one',
  },
  // U4 by value vs by reference: undiscriminated; branches only differ by title + required ref_id.
  {
    at: '**.panels[].vis_config',
    kind: 'variants',
    why: 'U4: undiscriminated, authored keys + recognizer',
    labelBy: 'title',
    key: (title) => ({ 'By value': 'by_value', 'By reference': 'by_reference' } as Record<string, string>)[title],
    recognize: (v) => (typeof v?.ref_id === 'string' ? 'By reference' : 'By value'),
    exclusivity: 'exactly_one',
  },
  // U5 chart type.
  {
    at: '**.vis_config.by_value',
    kind: 'variants',
    why: 'U5: {type}_config with 5 authored exceptions',
    key: (t) => CHART_KEY_EXCEPTIONS[t] ?? `${t}_config`,
    exclusivity: 'exactly_one',
    opaque: (k) => !SLICE_CHARTS.has(k),
  },
  // U6/U7 ES|QL vs not: no variant key in the baseline; merge both shapes, differing parts become JSON leaves.
  // One rule for every chart (xy = U6, metric = U7, and any future chart).
  { at: '**.by_value.*', kind: 'merge', why: 'U6/U7: merge ES|QL + DSL chart shapes' },
  // U8 xy layer kind. Annotation layers are unsupported in the baseline.
  {
    at: '**.xy_chart_config.layers[]',
    kind: 'variants',
    why: 'U8: authored keys by layer type; annotations dropped; type kept as sibling',
    key: (t) =>
      XY_DATA_LAYER_TYPES.includes(t) ? 'data_layer' : t === 'reference_lines' ? 'reference_line_layer' : 'drop',
    hoist: ['type'],
    exclusivity: 'conflicts',
  },
  // JSON leaves inside charts (baseline keeps these as *_json strings).
  { at: '**.data_source', kind: 'json', why: 'JSON leaf data_source_json (charts and layers)' },
  { at: '**.references', kind: 'json', why: 'JSON leaf references_json (charts and by_reference)' },
  { at: '**.data_layer.x', kind: 'json', why: 'JSON leaf x_json' },
  { at: '**.data_layer.y[]', kind: 'json', why: 'JSON leaf y[].config_json', name: 'config_json' },
  { at: '**.breakdown_by', kind: 'json', why: 'JSON leaf breakdown_by_json' },
  { at: '**.reference_line_layer.thresholds[]', kind: 'merge', why: 'merge threshold operation variants' },
  { at: '**.thresholds[].color', kind: 'json', why: 'JSON leaf color_json' },
  { at: '**.thresholds[].format', kind: 'json', why: 'JSON leaf format_json (not in baseline; forced by strict mode)' },
  { at: '**.axis.*.domain', kind: 'json', why: 'JSON leaf domain_json' },
  { at: '**.xy_chart_config.legend', kind: 'merge', why: 'legend placement union merged (baseline merges too)' },
  { at: '**.xy_chart_config.legend.layout', kind: 'merge', why: 'legend layout grid|list merged (forced by strict mode)' },
  { at: '**.metric_chart_config.metrics[]', kind: 'json', why: 'JSON leaf metrics[].config_json', name: 'config_json' },
  // U11 filters (root and chart level): every variant is a JSON leaf.
  { at: '**.filters[]', kind: 'json', why: 'U11 JSON leaf filters[].filter_json', name: 'filter_json' },

  // ---- U9 pinned control type. CONVENTION `{type}_config`.
  {
    at: 'pinned_panels[]',
    kind: 'variants',
    why: 'U9 CONVENTION {type}_config',
    key: (t) => `${t}_config`,
    hoist: ['type', 'width', 'grow', 'id'],
    content: 'config',
    exclusivity: 'exactly_one_with_discriminator',
    opaque: (k) => !SLICE_CONTROLS.has(k),
  },
  // U10 range slider source: authored keys, default recognizer value, discriminator kept in by_esql.
  {
    at: 'pinned_panels[].range_slider_control_config',
    kind: 'variants',
    why: 'U10: by_field/by_esql, default field, values_source kept in by_esql',
    discriminator: 'values_source',
    key: (v) => ({ esql: 'by_esql', field: 'by_field' } as Record<string, string>)[v],
    recognize: (v) => v?.values_source ?? 'field',
    keepDiscriminatorIn: ['by_esql'],
    exclusivity: 'exactly_one',
  },
];

const toRegex = (pattern: string): RegExp => {
  const esc = pattern
    .replace(/^\*\*\./, '\u0000')
    .split('**')
    .map((part) =>
      part
        .split('*')
        .map((s) => s.replace(/[.[\]{}()+?^$|\\]/g, '\\$&'))
        .join('[^.]+')
    )
    .join('.*')
    .replace('\u0000', '(?:.*\\.)?');
  return new RegExp(`^${esc}$`);
};
const compiled = RULES.map((r) => ({ r, re: toRegex(r.at) }));

export const ruleAt = (path: string): Rule | undefined => compiled.find(({ re }) => re.test(path))?.r;
