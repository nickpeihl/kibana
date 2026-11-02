// PROTOTYPE (dashboards-tf spike A). Schema conversion: generated OAS (+ x-tf-*) -> attribute-tree/v1.
// Reads ONLY out/kibana.slice.published.yaml. Writes out/attribute-tree.json.
//
//   node prototype_dashboards_tf_a/consumers/schema_conversion.mts
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { Compiler, HERE, OAS_FILE, ROOT_COMPONENT, SECTION_COMPONENT, loadOas } from './oas_tf_model.mts';
import type { Prop, TNode } from './oas_tf_model.mts';

interface Attr {
  path: string;
  kind: string;
  element?: string;
  mode: string;
}
interface Group {
  kind: string;
  members: string[];
  discriminator?: { path: string; values: Record<string, string[]> };
}

const attrs: Attr[] = [];
const groups: Group[] = [];

const kindOf = (n: TNode): { kind: string; element?: string } => {
  switch (n.k) {
    case 'prim':
      return { kind: n.type };
    case 'json':
      return n.attribute ? { kind: 'object' } : { kind: 'json-string' };
    case 'list': {
      const e = kindOf(n.items);
      return { kind: 'list', element: e.kind === 'json-string' ? 'json-string' : e.kind };
    }
    default:
      return { kind: 'object' };
  }
};

/** Emit the children of an object-like node at `base`. */
const fields = (n: TNode, base: string): void => {
  const p = (name: string) => (base ? `${base}.${name}` : name);
  if (n.k === 'json' && n.attribute) {
    attrs.push({ path: p(n.attribute), kind: 'json-string', mode: 'required' });
  } else if (n.k === 'object') {
    for (const prop of n.props) emitProp(prop, base);
  } else if (n.k === 'list') {
    fields(n.items, `${base}[]`);
  } else if (n.k === 'keyed') {
    for (const prop of n.outside) emitProp(prop, base);
    if (n.discOutside && n.disc) attrs.push({ path: p(n.disc), kind: 'string', mode: 'required' });
    const members: string[] = [];
    const values: Record<string, string[]> = {};
    for (const v of n.variants) {
      const vk = kindOf(v.content).kind === 'json-string' ? 'json-string' : 'object';
      attrs.push({ path: p(v.key), kind: vk, mode: 'optional' });
      fields(v.content, p(v.key));
      members.push(p(v.key));
      values[p(v.key)] = v.values;
    }
    if (n.m.extra_json_variant) {
      const k = p(n.m.extra_json_variant.key);
      attrs.push({ path: k, kind: 'json-string', mode: 'optional' });
      members.push(k);
      values[k] = n.m.extra_json_variant.values;
    }
    groups.push({
      kind: n.m.exclusivity ?? 'exactly_one_of',
      members,
      ...(n.discOutside && n.disc ? { discriminator: { path: p(n.disc), values } } : {}),
    });
  }
};

const emitProp = (prop: Prop, base: string): void => {
  if (prop.flatten) return fields(prop.node, base);
  const path = base ? `${base}.${prop.tfName}` : prop.tfName;
  // Mode: OAS `required` -> required, else optional. (Tried "server default -> optional_computed": 83 mode
  // mismatches instead of 75; the baseline's computed-ness is per-attribute hand tuning, not derivable from the OAS.)
  const mode = prop.required ? 'required' : 'optional';
  attrs.push({ path, ...kindOf(prop.node), mode });
  fields(prop.node, path);
};

// ---- main
const doc = loadOas();
const c = new Compiler(doc);
const root = c.compile({ $ref: `#/components/schemas/${ROOT_COMPONENT}` });
if (root.k !== 'object') throw new Error('root is not an object');

// Hand-coded special case (deviation, not in the mapping): `panels` items are anyOf[panel union, section]; the
// baseline keeps only panels in `panels[]` and moves sections to a root `sections[]`.
const panelsRaw = c.resolve(c.schemas[ROOT_COMPONENT].properties.panels);
const [panelUnionRaw] = c.unionBranches(c.resolve(panelsRaw.items))!.filter(
  (b: Record<string, unknown>) => b.$ref !== `#/components/schemas/${SECTION_COMPONENT}`
);
const panelUnion = c.compile(panelUnionRaw);
for (const prop of root.props) {
  if (prop.apiName === 'panels') prop.node = { k: 'list', items: panelUnion };
}
root.props.push({
  apiName: 'sections',
  tfName: 'sections',
  required: false,
  node: c.compile({ type: 'array', items: { $ref: `#/components/schemas/${SECTION_COMPONENT}` } }),
});
fields(root, '');

// Provider plumbing (hand-coded in the provider, not derived from the API): resource identity.
attrs.push({ path: 'id', kind: 'string', mode: 'computed' });
attrs.push({ path: 'dashboard_id', kind: 'string', mode: 'optional_computed' });
attrs.push({ path: 'space_id', kind: 'string', mode: 'optional_computed' });

// Slice filter (identical to spike0's): expand only image/vis panel keys, xy/metric chart keys, range slider pinned.
const EXPAND = [
  /^(sections\[\]\.)?panels\[\]\.(image_config|vis_config)(\.|$)/,
  /^pinned_panels\[\]\.range_slider_control_config(\.|$)/,
];
const PRUNE_UNDER = [
  /^(sections\[\]\.)?panels\[\]\.[a-z_]+_config\./,
  /^pinned_panels\[\]\.[a-z_]+_config\./,
  /^(sections\[\]\.)?panels\[\]\.vis_config\.by_value\.(?!xy_chart_config|metric_chart_config)[a-z_]+_config\./,
];
const keep = (path: string) => {
  if (/\.vis_config\.by_value\.[a-z_]+_config\./.test(path) && PRUNE_UNDER[2].test(path)) return false;
  if (EXPAND.some((r) => r.test(path))) return true;
  return !PRUNE_UNDER.slice(0, 2).some((r) => r.test(path));
};
// Unfiltered tree, used by round_trip.mts to check value-conversion output against the schema.
writeFileSync(
  join(HERE, '../out/attribute-tree.full.json'),
  JSON.stringify({ format: 'attribute-tree/v1', resource: 'elasticstack_kibana_dashboard', source: 'unfiltered', attributes: attrs, groups }, null, 2)
);
const kept = attrs.filter((a) => keep(a.path));
const keptPaths = new Set(kept.map((a) => a.path));
const keptGroups = groups.filter((g) => g.members.every((m) => keptPaths.has(m)));

kept.sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
for (const g of keptGroups) g.members.sort();
keptGroups.sort((a, b) => (a.members[0] < b.members[0] ? -1 : a.members[0] > b.members[0] ? 1 : a.kind < b.kind ? -1 : 1));

const out = join(HERE, '../out/attribute-tree.json');
writeFileSync(
  out,
  JSON.stringify(
    {
      format: 'attribute-tree/v1',
      resource: 'elasticstack_kibana_dashboard',
      source: `spike A: ${OAS_FILE.split('/').slice(-2).join('/')} (x-tf-* from Kibana Zod .meta()), consumers/schema_conversion.mts`,
      attributes: kept,
      groups: keptGroups,
    },
    null,
    2
  )
);
console.log(`wrote ${out}: ${kept.length} attributes, ${keptGroups.length} groups`);
if (c.conflicts.length) console.log(`merge conflicts turned into JSON leaves: ${[...new Set(c.conflicts)].join(', ')}`);
