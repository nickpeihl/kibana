// PROTOTYPE (spike C). node prototype_dashboards_tf_c/round_trip.ts [fixturesDir]
// fixture -> *.tf.json (written to out/) -> API JSON, deep-compared with the fixture (panels before sections).
// Also validates each Terraform-shaped body against the derived JSON Schema with Ajv (2020-12).
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join, basename } from 'node:path';
import { loadComponents, KIBANA_ROOT } from './load_components.ts';
import { buildRootPlan } from './monomorphize.ts';
import { toTfJson, fromTfJson } from './value_conversion.ts';

const FIXTURES =
  process.argv[2] ?? join(KIBANA_ROOT, '../../kibana/.claude/dashboards-terraform/spike0/fixtures');
const OUT = join(KIBANA_ROOT, 'prototype_dashboards_tf_c/out');
mkdirSync(OUT, { recursive: true });
loadComponents();
const plan = buildRootPlan();

const require = createRequire(join(KIBANA_ROOT, 'package.json'));
const Ajv2020 = require('ajv/dist/2020').default;
const ajv = new Ajv2020({ allErrors: true, strict: false });
const validate = ajv.compile(
  JSON.parse(readFileSync(join(KIBANA_ROOT, 'prototype_dashboards_tf_c/derived/dashboard.terraform_shaped.schema.json'), 'utf8'))
);

const isSection = (p: any) => Array.isArray(p?.panels);
const normalize = (d: any) =>
  d.panels ? { ...d, panels: [...d.panels.filter((p: any) => !isSection(p)), ...d.panels.filter(isSection)] } : d;

const diff = (a: any, b: any, at = ''): string[] => {
  if (typeof a !== typeof b || Array.isArray(a) !== Array.isArray(b) || (a === null) !== (b === null))
    return [`${at}: ${JSON.stringify(a)?.slice(0, 80)} != ${JSON.stringify(b)?.slice(0, 80)}`];
  if (Array.isArray(a)) {
    if (a.length !== b.length) return [`${at}: length ${a.length} != ${b.length}`];
    return a.flatMap((x, i) => diff(x, b[i], `${at}[${i}]`));
  }
  if (a && typeof a === 'object') {
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    return [...keys].flatMap((k) =>
      k in a && k in b ? diff(a[k], b[k], `${at}.${k}`) : [`${at}.${k}: ${k in a ? 'only in fixture' : 'only after round trip'}`]
    );
  }
  return a === b ? [] : [`${at}: ${JSON.stringify(a)} != ${JSON.stringify(b)}`];
};

let failed = 0;
for (const f of readdirSync(FIXTURES).filter((x) => x.endsWith('.json') && x !== 'index.json').sort()) {
  const name = basename(f, '.json');
  const fixture = JSON.parse(readFileSync(join(FIXTURES, f), 'utf8'));
  try {
    const tfJson = toTfJson(plan, fixture, name);
    const file = join(OUT, `${name}.tf.json`);
    writeFileSync(file, JSON.stringify(tfJson, null, 2) + '\n');
    const valid = validate(tfJson.resource.elasticstack_kibana_dashboard[name]);
    const back = fromTfJson(plan, JSON.parse(readFileSync(file, 'utf8')), name);
    const d = diff(normalize(fixture), back);
    const schemaNote = valid ? 'valid vs derived schema' : `INVALID vs derived schema: ${ajv.errorsText(validate.errors).slice(0, 300)}`;
    if (d.length || !valid) failed++;
    console.log(`${d.length ? 'FAIL' : 'pass'}  ${f}  (${schemaNote})`);
    d.slice(0, 20).forEach((l) => console.log(`        ${l}`));
  } catch (e: any) {
    failed++;
    console.log(`FAIL  ${f}  (conversion error) ${e.message}`);
  }
}

// Controls (synthetic, not fixtures): template escaping, and that loss/ambiguity fails loudly.
const fx = (f: string) => JSON.parse(readFileSync(join(FIXTURES, f), 'utf8'));
const control = (label: string, ok: boolean) => {
  if (!ok) failed++;
  console.log(`${ok ? 'pass' : 'FAIL'}  control: ${label}`);
};
const throws = (fn: () => unknown) => {
  try {
    fn();
    return false;
  } catch {
    return true;
  }
};
{
  const d = fx('image_url_src_drilldowns.json');
  d.panels[0].config.image_config.src.url = 'https://x/${var.a}/%{if}';
  const tf = toTfJson(plan, d, 'esc');
  const s = JSON.stringify(tf);
  control('escapes ${ and %{ in *.tf.json strings', s.includes('$${var.a}') && s.includes('%%{if}'));
  control('escaped strings round-trip', diff(d, fromTfJson(plan, JSON.parse(s), 'esc')).length === 0);
}
{
  const d = fx('image_file_src.json');
  d.panels[0].config.image_config.not_in_schema = 1;
  control('unknown API key -> conversion error (no silent loss)', throws(() => toTfJson(plan, d, 'x')));
}
{
  const d = fx('oas_create_simple.json');
  d.panels[3].config.layers.push({ type: 'annotations', events: [] });
  control('annotation layer (dropped variant) -> conversion error', throws(() => toTfJson(plan, d, 'x')));
}
{
  const tf = toTfJson(plan, fx('image_file_src.json'), 'x');
  const body = tf.resource.elasticstack_kibana_dashboard.x;
  body.panels[0].vis_config = { by_reference: { ref_id: 'r' } };
  control('two panel variant keys -> invalid vs derived schema', !validate(body));
  body.panels[0].type = 'vis';
  delete body.panels[0].image_config;
  control('vis_config with type=vis -> valid vs derived schema', validate(body) === true);
  body.panels[0].type = 'image';
  control('vis_config with type=image -> invalid (dependentSchemas discriminator)', !validate(body));
}
process.exit(failed ? 1 : 0);
