// PROTOTYPE (dashboards-tf spike A). Drift check: what a CI step (Kibana's OAS check, or the provider's Kibana-bump PR)
// would run over the generated OAS. Lists every union of objects reachable from the dashboard root and how the
// mapping resolves it, and fails when a mapped union has a branch it cannot key. `--self-test` injects three Kibana
// schema changes that come without a metadata change and shows which ones are caught.
//
//   node prototype_dashboards_tf_a/consumers/lint_mapping.mts [--self-test]
import { Compiler, ROOT_COMPONENT, loadOas } from './oas_tf_model.mts';

type Raw = Record<string, any>;

const lint = (doc: Raw): { mapped: number; byConvention: string[]; errors: string[] } => {
  const c = new Compiler(doc);
  const byConvention: string[] = [];
  const errors: string[] = [];
  let mapped = 0;
  const seen = new Set<string>();
  const walk = (raw: Raw, path: string, inLeaf: boolean): void => {
    const ref = raw?.$ref;
    if (ref) {
      if (seen.has(`${ref}|${inLeaf}`)) return;
      seen.add(`${ref}|${inLeaf}`);
    }
    let s: Raw;
    try {
      s = c.normalize(raw);
    } catch (e) {
      errors.push(`${path}: ${(e as Error).message}`);
      return;
    }
    const leaf = inLeaf || !!s['x-tf-json-leaf'];
    const branches = c.unionBranches(s);
    if (branches && !leaf && !branches.every((b: Raw) => c.isPrimitive(b))) {
      if (s['x-tf-union']) {
        mapped++;
        try {
          c.compile(raw);
        } catch (e) {
          errors.push(`${path}: ${(e as Error).message}`);
        }
      } else {
        byConvention.push(path);
      }
    }
    for (const b of branches ?? []) walk(b, `${path}|`, leaf);
    for (const [k, v] of Object.entries((s.properties ?? {}) as Raw)) walk(v, `${path}.${k}`, leaf);
    if (s.items) walk(s.items, `${path}[]`, leaf);
  };
  walk({ $ref: `#/components/schemas/${ROOT_COMPONENT}` }, '', false);
  return { mapped, byConvention: [...new Set(byConvention)], errors };
};

const report = (label: string, doc: Raw) => {
  const r = lint(doc);
  console.log(`\n## ${label}`);
  console.log(`mapped unions (x-tf-union): ${r.mapped}`);
  console.log(`unmapped unions of objects -> JSON leaf by convention: ${r.byConvention.length}`);
  console.log(`errors: ${r.errors.length}`);
  for (const e of r.errors) console.log(`  ERROR ${e}`);
  return r;
};

const base = loadOas();
const r0 = report('generated OAS', base);
if (!process.argv.includes('--self-test')) {
  for (const p of r0.byConvention) console.log(`  convention JSON leaf: ${p}`);
  process.exit(r0.errors.length ? 1 : 0);
}

const S = (d: Raw) => d.components.schemas;
const clone = () => JSON.parse(JSON.stringify(base));
const k = (n: string) => `Kibana_HTTP_APIs_${n}`;

// 1. Lens adds a third structural branch to the vis config union (e.g. a "by-template" config) and forgets x-tf-variant.
const d1 = clone();
const vis = S(d1)[k('kbn-dashboard-panel-type-vis')].properties.config;
vis.anyOf.push({ type: 'object', title: 'By template', properties: { template_id: { type: 'string' } }, required: ['template_id'] });
report('1. new by-template branch on the vis union, no x-tf-variant', d1);

// 2. Lens adds a 13th chart type: the key_template covers it with no metadata change.
const d2 = clone();
S(d2)[k('visFunnelChart')] = { type: 'object', title: 'Funnel', properties: { type: { type: 'string', enum: ['funnel'] }, steps: { type: 'array', items: { type: 'string' } } }, required: ['type'] };
S(d2)[k('visApiConfig')].anyOf.push({ $ref: `#/components/schemas/${k('visFunnelChart')}` });
const r2 = report('2. new chart type `funnel`, no metadata', d2);
const c2 = new Compiler(d2);
const chart = c2.compile({ $ref: `#/components/schemas/${k('visApiConfig')}` });
if (chart.k === 'keyed') console.log(`  chart variant keys now: ${chart.variants.map((v) => v.key).join(', ')}`);
void r2;

// 3. A new union of objects appears inside the xy chart without annotation: silently becomes a JSON leaf.
const d3 = clone();
S(d3)[k('visXyChartNoESQL')].properties.highlight = {
  anyOf: [
    { type: 'object', properties: { kind: { type: 'string', enum: ['band'] }, from: { type: 'number' } } },
    { type: 'object', properties: { kind: { type: 'string', enum: ['line'] }, at: { type: 'number' } } },
  ],
};
const r3 = report('3. new unannotated union `highlight` in xy (no error; only the convention list grows)', d3);
console.log(`  new convention entries: ${r3.byConvention.filter((p) => !r0.byConvention.includes(p)).join(', ')}`);
