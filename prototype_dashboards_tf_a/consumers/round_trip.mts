// PROTOTYPE (dashboards-tf spike A). Round trip: fixture (API JSON) -> Terraform-shaped JSON -> API JSON, deep-equal to
// the fixture after normalizing panels-before-sections. Also checks that every attribute path value conversion emits
// exists, with a matching kind, in the schema-conversion output (out/attribute-tree.full.json, i.e. before the slice
// filter), and runs one synthetic case for the `${` / `%{` escapes.
//
//   node prototype_dashboards_tf_a/consumers/round_trip.mts
import { readFileSync, readdirSync } from 'node:fs';
import { isDeepStrictEqual } from 'node:util';
import { join } from 'node:path';
import { HERE } from './oas_tf_model.mts';
import { FIXTURES, apiToTfJson, buildModel, losses, tfJsonToApi } from './value_conversion.mts';

const isSection = (i: any) => i && typeof i === 'object' && Array.isArray(i.panels) && !('type' in i);
const normalize = (api: any) =>
  api.panels
    ? { ...api, panels: [...api.panels.filter((p: any) => !isSection(p)), ...api.panels.filter(isSection)] }
    : api;

const diff = (a: any, b: any, path = ''): string[] => {
  if (isDeepStrictEqual(a, b)) return [];
  if (a && b && typeof a === 'object' && typeof b === 'object' && Array.isArray(a) === Array.isArray(b)) {
    const keys = [...new Set([...Object.keys(a), ...Object.keys(b)])];
    return keys.flatMap((k) => diff(a[k], b[k], `${path}${Array.isArray(a) ? `[${k}]` : `.${k}`}`));
  }
  return [`${path || '<root>'}: fixture ${JSON.stringify(a)?.slice(0, 100)} != round-trip ${JSON.stringify(b)?.slice(0, 100)}`];
};

const tree = JSON.parse(readFileSync(join(HERE, '../out/attribute-tree.full.json'), 'utf8'));
const kinds = new Map<string, string>(tree.attributes.map((a: any) => [a.path, a.kind]));
const schemaProblems = (v: any, path: string, out: string[] = []): string[] => {
  for (const [k, x] of Object.entries(v)) {
    const p = path ? `${path}.${k}` : k;
    const kind = kinds.get(p);
    if (!kind) out.push(`not in attribute tree: ${p}`);
    else if (typeof x === 'string' && !['string', 'json-string'].includes(kind)) out.push(`${p}: string value, tree says ${kind}`);
    if (Array.isArray(x)) x.forEach((e) => e && typeof e === 'object' && schemaProblems(e, `${p}[]`, out));
    else if (x && typeof x === 'object') schemaProblems(x, p, out);
  }
  return out;
};

const root = buildModel();
let failed = 0;
const cases: Array<[string, any]> = readdirSync(FIXTURES)
  .filter((x) => x.endsWith('.json') && x !== 'index.json')
  .sort()
  .map((f) => [f, JSON.parse(readFileSync(join(FIXTURES, f), 'utf8'))]);
// Synthetic: Terraform template sequences in a plain string and inside a JSON leaf.
const esc = JSON.parse(readFileSync(join(FIXTURES, 'root_filters.json'), 'utf8'));
esc.title = 'cost ${var.x} and %{if y}';
esc.filters[0].condition = { ...esc.filters[0].condition, value: '${not.a.ref}' };
cases.push(['synthetic_escapes (root_filters.json + ${ / %{)', esc]);
for (const [f, api] of cases) {
  losses.length = 0;
  let problems: string[];
  try {
    const tf = JSON.parse(JSON.stringify(apiToTfJson(root, api, 'x')));
    const body = tf.resource.elasticstack_kibana_dashboard.x;
    problems = [...diff(normalize(api), tfJsonToApi(root, tf)), ...schemaProblems(body, '')];
    if (f.startsWith('synthetic') && !(body.title.includes('$${var.x}') && body.title.includes('%%{if'))) {
      problems.push(`escapes not applied: ${body.title}`);
    }
  } catch (e) {
    problems = [`threw: ${(e as Error).message}`];
  }
  const ok = problems.length === 0;
  if (!ok) failed++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${f}${losses.length ? `  (value conversion dropped: ${losses.join(', ')})` : ''}`);
  for (const p of problems) console.log(`      ${p}`);
}
console.log(failed ? `\n${failed} fixture(s) failed.` : '\nAll fixtures round-trip.');
process.exit(failed ? 1 : 0);
