// PROTOTYPE (spike C). node prototype_dashboards_tf_c/build_derived_schema.ts
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { loadComponents, KIBANA_ROOT } from './load_components.ts';
import { buildDerivedSchema, assertMonomorphic, unmapped, autoJson } from './monomorphize.ts';

const meta = loadComponents();
const schema = buildDerivedSchema(meta);
const out = join(KIBANA_ROOT, 'prototype_dashboards_tf_c/derived/dashboard.terraform_shaped.schema.json');
mkdirSync(join(KIBANA_ROOT, 'prototype_dashboards_tf_c/derived'), { recursive: true });
writeFileSync(out, JSON.stringify(schema, null, 2) + '\n');
console.log(`wrote ${out}`);
console.log(`unmapped unions (${unmapped.length}):\n  ${unmapped.join('\n  ')}`);
console.log(`auto JSON leaves for free-form schemas (${autoJson.length}):\n  ${autoJson.join('\n  ')}`);
const bad = assertMonomorphic(schema);
console.log(bad.length ? `NOT monomorphic:\n  ${bad.join('\n  ')}` : 'monomorphic: no anyOf/oneOf/discriminator/x- keys');
if (unmapped.length || bad.length) process.exit(1);
