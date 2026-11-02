// PROTOTYPE (spike C). Simulates Kibana-side API changes on the Zod-derived components and reports what the
// transformer does with them (no mapping edits). node prototype_dashboards_tf_c/drift_sim.ts
import { execFileSync } from 'node:child_process';
import { writeFileSync, readFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadComponents, KIBANA_ROOT } from './load_components.ts';
import { buildDerivedSchema, unmapped, setComponents, assertMonomorphic } from './monomorphize.ts';

const P = 'Kibana_HTTP_APIs_';
const clone = (x: any) => JSON.parse(JSON.stringify(x));
const replaceEnum = (x: any, from: string, to: string) => JSON.parse(JSON.stringify(x).replaceAll(`"${from}"`, `"${to}"`));

const SCENARIOS: Record<string, (c: any) => void> = {
  baseline: () => {},
  'new chart type (13th): bar_gauge, ES|QL + DSL like gauge': (c) => {
    c[`${P}visBarGaugeNoESQL`] = replaceEnum(clone(c[`${P}visGaugeNoESQL`]), 'gauge', 'bar_gauge');
    c[`${P}visBarGaugeESQL`] = replaceEnum(clone(c[`${P}visGaugeESQL`]), 'gauge', 'bar_gauge');
    c[`${P}visBarGaugeChart`] = {
      title: 'Bar gauge',
      anyOf: [{ $ref: `#/components/schemas/${P}visBarGaugeNoESQL` }, { $ref: `#/components/schemas/${P}visBarGaugeESQL` }],
    };
    c[`${P}visApiConfig`].anyOf.push({ $ref: `#/components/schemas/${P}visBarGaugeChart` });
  },
  'new panel type (25th): foo, shaped like markdown': (c) => {
    c[`${P}kbn-dashboard-panel-type-foo`] = replaceEnum(clone(c[`${P}kbn-dashboard-panel-type-markdown`]), 'markdown', 'foo');
    const ref = `#/components/schemas/${P}kbn-dashboard-panel-type-foo`;
    const panelUnion = c[`${P}kbn-dashboard-data`].properties.panels.items.anyOf[0];
    panelUnion.oneOf.push({ $ref: ref });
    panelUnion.discriminator.mapping.foo = ref;
    const sec = c[`${P}kbn-dashboard-section`].properties.panels.items;
    sec.oneOf.push({ $ref: ref });
    sec.discriminator.mapping.foo = ref;
  },
  'new plain field: image_config.caption (string)': (c) => {
    c[`${P}kbn-dashboard-panel-type-image`].properties.config.properties.image_config.properties.caption = { type: 'string' };
  },
  'new union: image_config.caption = string | {text, style}': (c) => {
    c[`${P}kbn-dashboard-panel-type-image`].properties.config.properties.image_config.properties.caption = {
      anyOf: [{ type: 'string' }, { type: 'object', properties: { text: { type: 'string' }, style: { type: 'string' } } }],
    };
  },
  'renamed discriminator value: url_drilldown -> url': (c) => {
    const img = c[`${P}kbn-dashboard-panel-type-image`];
    c[`${P}kbn-dashboard-panel-type-image`] = replaceEnum(img, 'url_drilldown', 'url');
  },
};

const consumer = join(fileURLToPath(new URL('.', import.meta.url)), 'schema_consumer.mjs');
const pathsOf = (schema: any) => {
  const dir = mkdtempSync(join(tmpdir(), 'spikec-'));
  writeFileSync(join(dir, 's.json'), JSON.stringify(schema));
  execFileSync('node', [consumer, join(dir, 's.json'), join(dir, 't.json')]);
  const t = JSON.parse(readFileSync(join(dir, 't.json'), 'utf8'));
  return new Set<string>(t.attributes.map((a: any) => `${a.path} (${a.kind})`));
};

const meta = loadComponents();
const yaml = (await import('node:module')).createRequire(join(KIBANA_ROOT, 'package.json'))('js-yaml');
const base = yaml.load(readFileSync(join(KIBANA_ROOT, 'oas_docs/output/kibana.yaml'), 'utf8')).components.schemas;

let basePaths: Set<string> | undefined;
for (const [name, mutate] of Object.entries(SCENARIOS)) {
  const c = clone(base);
  mutate(c);
  setComponents(c);
  unmapped.length = 0;
  let schema: any;
  try {
    schema = buildDerivedSchema(meta);
  } catch (e: any) {
    console.log(`\n## ${name}\n  transformer error: ${e.message}`);
    continue;
  }
  const paths = pathsOf(schema);
  if (!basePaths) basePaths = paths;
  console.log(`\n## ${name}`);
  console.log(`  unmapped unions (build would fail): ${unmapped.length ? unmapped.join('; ') : 'none'}`);
  console.log(`  monomorphic: ${assertMonomorphic(schema).length === 0}`);
  const added = [...paths].filter((p) => !basePaths!.has(p) && !p.startsWith('sections'));
  const removed = [...basePaths].filter((p) => !paths.has(p) && !p.startsWith('sections'));
  console.log(`  attributes added (panels[] side): ${added.length ? '\n    + ' + added.join('\n    + ') : 'none'}`);
  console.log(`  attributes removed (panels[] side): ${removed.length ? '\n    - ' + removed.join('\n    - ') : 'none'}`);
}
