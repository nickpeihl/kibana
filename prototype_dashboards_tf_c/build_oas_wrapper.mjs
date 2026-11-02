// PROTOTYPE (spike C). Wraps the derived JSON Schema in an OAS 3.1 document (what Kibana would publish next to
// kibana.yaml), so off-the-shelf OpenAPI generators can read it. $defs move to components.schemas.
import { readFileSync, writeFileSync } from 'node:fs';
// --strip-if-then: drop the only composition keyword we emit (allOf[if/then] = RequiredIf on pinned_panels),
// because tfplugingen-openapi skips the whole resource on any allOf.
const [, , inFile, outFile, flag] = process.argv;
const strip = (x) =>
  Array.isArray(x) ? x.map(strip) : x && typeof x === 'object'
    ? Object.fromEntries(Object.entries(x).filter(([k]) => k !== 'allOf').map(([k, v]) => [k, strip(v)]))
    : x;
const s0 = JSON.parse(readFileSync(inFile, 'utf8'));
const s = flag === '--strip-if-then' ? strip(s0) : s0;
const { $schema, $id, $defs, ...root } = s;
const rewrite = (x) =>
  JSON.parse(JSON.stringify(x).replaceAll('"#/$defs/', '"#/components/schemas/TerraformDashboard_'));
const components = { TerraformDashboard: rewrite(root) };
for (const [k, v] of Object.entries($defs ?? {})) components[`TerraformDashboard_${k}`] = rewrite(v);
const body = { content: { 'application/json': { schema: { $ref: '#/components/schemas/TerraformDashboard' } } } };
const oas = {
  openapi: '3.1.0',
  info: { title: 'Kibana Dashboards API, Terraform-shaped projection (PROTOTYPE spike C)', version: '0.0.0-prototype' },
  paths: {
    '/api/dashboards': { post: { operationId: 'createDashboard', requestBody: body, responses: { 200: { description: 'ok', ...body } } } },
    '/api/dashboards/{id}': {
      get: {
        operationId: 'getDashboard',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'ok', ...body } },
      },
    },
  },
  components: { schemas: components },
};
writeFileSync(outFile, JSON.stringify(oas, null, 2) + '\n');
console.log(`wrote ${outFile}`);
