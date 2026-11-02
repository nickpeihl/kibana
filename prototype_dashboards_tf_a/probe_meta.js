// PROTOTYPE (spike A): which `.meta()` spellings survive the real OasConverter, and what happens to component
// structure when a use site overrides metadata on a shared, id'd schema.
// Usage: DISABLE_SWC_REGISTER_CACHE=1 node prototype_dashboards_tf_a/probe_meta.js
require('@kbn/setup-node-env');
const path = require('path');
const { z } = require('@kbn/zod');
const { OasConverter } = require(path.resolve(__dirname, '../src/platform/packages/shared/kbn-router-to-openapispec/src/oas_converter'));

const show = (label, schema) => {
  const c = new OasConverter();
  try {
    const s = c.convert(schema);
    console.log(`\n## ${label}\nschema: ${JSON.stringify(s)}\ncomponents: ${JSON.stringify(c.getSchemaComponents().schemas)}`);
  } catch (e) {
    console.log(`\n## ${label}\nTHROWS: ${e.message.split('\n')[0]}`);
  }
};

show('1 top-level x- key in .meta()', z.object({ a: z.string() }).meta({ 'x-tf': { variant_key: 'foo' } }));
show('2 x- key inside .meta({openapi})', z.object({ a: z.string() }).meta({ openapi: { 'x-tf': { variant_key: 'foo' } } }));
show('3 non-x key in .meta()', z.object({ a: z.string() }).meta({ tf: { variant_key: 'foo' } }));

const shared = z.object({ a: z.string() }).meta({ id: 'shared-thing', 'x-tf': { variant_key: 'default_key' } });
show('4 shared id\'d schema used twice', z.object({ p: shared, q: shared }));
// Per-location override: .meta() on the shared schema clones it; Zod's registry inherits parent meta EXCEPT `id`.
show('5 use-site override via .meta() on the shared schema', z.object({ p: shared, q: shared.meta({ 'x-tf': { variant_key: 'other_key' } }) }));
show('6 use-site override re-declaring the same id', z.object({ p: shared, q: shared.meta({ id: 'shared-thing', 'x-tf': { variant_key: 'other_key' } }) }));
show('7 use-site override with a new id', z.object({ p: shared, q: shared.meta({ id: 'shared-thing-at-q', 'x-tf': { variant_key: 'other_key' } }) }));
// Override on the *property* wrapper instead of the shared schema: .optional() is a new node with its own meta.
show('8 override on an .optional() wrapper around the shared schema', z.object({ p: shared, q: shared.optional().meta({ 'x-tf': { variant_key: 'other_key' } }) }));
// Override on the enclosing object: keyed by property path, the shared schema is untouched.
show('9 override on the parent object, keyed by property', z.object({ p: shared, q: shared }).meta({ 'x-tf': { overrides: { q: { variant_key: 'other_key' } } } }));
show('10 x- key on a z.union branch inside .meta on the union', z.union([z.object({ type: z.literal('a') }).meta({ 'x-tf': { variant_key: 'aa' } }), z.object({ type: z.literal('b') })]).meta({ 'x-tf': { recognizer: { by: 'property', name: 'type' } } }));

// Does a `$ref` with a sibling `x-` key (cases 5/8) survive @kbn/openapi-bundler's merge (and its namespacing)?
(async () => {
  const fs = require('fs');
  const os = require('os');
  const yaml = require('js-yaml');
  const { merge } = require('@kbn/openapi-bundler');
  const c = new OasConverter();
  const schema = c.convert(z.object({ p: shared, q: shared.optional().meta({ 'x-tf': { variant_key: 'other_key' } }) }));
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'probe-'));
  const doc = {
    openapi: '3.0.0', info: { title: 'probe', version: '1' },
    paths: { '/api/probe': { post: { operationId: 'probe', requestBody: { content: { 'application/json': { schema } } }, responses: { 200: { description: 'ok' } } } } },
    components: c.getSchemaComponents(),
  };
  fs.writeFileSync(path.join(dir, 'bundle.json'), JSON.stringify(doc));
  await merge({ sourceGlobs: [path.join(dir, 'bundle.json')], outputFilePath: path.join(dir, 'out.yaml'), options: { prototypeDocument: path.resolve(__dirname, '../oas_docs/kibana.info.yaml') } });
  const out = yaml.load(fs.readFileSync(path.join(dir, 'out.yaml'), 'utf8'));
  console.log('\n## 11 after merge, request body schema:', JSON.stringify(out.paths['/api/probe'].post.requestBody.content['application/json'].schema));
  console.log('components:', JSON.stringify(out.components.schemas));
})();
