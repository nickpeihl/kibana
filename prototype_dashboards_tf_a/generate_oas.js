// PROTOTYPE (spike A). Produces the Dashboards API OAS the same way the published one is produced, minus booting
// Kibana: the real Zod schema (getDashboardDataSchema + real embeddable/drilldown registrations) -> the real
// OasConverter from @kbn/router-to-openapispec (what process_versioned_router does for a request body) -> a
// minimal OAS document -> the real @kbn/openapi-bundler `merge` (what oas_docs/scripts/merge_ess_oas.js does).
// Output: out/bundle.json (pre-merge, like oas_docs/bundle.json), out/kibana.slice.yaml (post-merge) and
// out/kibana.slice.published.yaml (after the dashboards + bump-slim overlays and `redocly bundle`, like the published
// oas_docs/output/kibana.yaml). Consumers read ONLY out/kibana.slice.published.yaml.
//
// Usage (from the worktree root): DISABLE_SWC_REGISTER_CACHE=1 node prototype_dashboards_tf_a/generate_oas.js
require('@kbn/setup-node-env');
const fs = require('fs');
const path = require('path');
const { z } = require('@kbn/zod');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(__dirname, 'out');
const r = (p) => require(path.join(ROOT, p));

const { getDrilldownRegistry } = r('src/platform/plugins/shared/embeddable/server/drilldowns/registry');
const { getEmbeddableServerRegistry } = r(
  'src/platform/plugins/shared/embeddable/server/embeddable_transforms/registry'
);
const { getDashboardDataSchema } = require('@kbn/as-code-dashboard-schema');
const { OasConverter } = r('src/platform/packages/shared/kbn-router-to-openapispec/src/oas_converter');

const drilldowns = getDrilldownRegistry();
const embeddables = getEmbeddableServerRegistry(drilldowns);
const setup = {
  registerDrilldown: drilldowns.registerDrilldown,
  registerEmbeddableServerDefinition: embeddables.registerEmbeddableServerDefinition,
};

// Real drilldown registrations (server plugin setup code), as in spike0/tools/validate_fixtures.js.
r('src/platform/plugins/shared/dashboard/server/dashboard_drilldown/register_dashboard_drilldown').registerDashboardDrilldown(setup);
new (r('x-pack/platform/plugins/private/drilldowns/url_drilldown/server/plugin').UrlDrilldownPlugin)().setup({}, { embeddable: setup });
r('x-pack/platform/plugins/shared/lens/server/drilldowns/register_discover_drilldown').registerDiscoverDrilldown(setup);

// Real embeddables for the slice.
new (r('src/platform/plugins/private/image_embeddable/server/plugin').ImageEmbeddablePlugin)().setup({}, { embeddable: setup });
setup.registerEmbeddableServerDefinition('markdown', {
  title: 'Markdown',
  getSchema: () => r('src/platform/plugins/shared/dashboard_markdown/server/embeddable/schemas').markdownEmbeddableSchema,
});
setup.registerEmbeddableServerDefinition('vis', {
  title: 'Visualization',
  getSchema: (gds) => r('x-pack/platform/plugins/shared/lens/server/transforms').getLensPanelSchema(gds),
});

// Harness limitation, not part of the mapping: the other 21 panel types live in plugins we don't load here.
// The golden tree does not expand them, so a stub schema per type is enough to make their variant keys appear.
const STUB_TYPES = [
  'aiops_change_point_chart', 'aiops_log_rate_analysis', 'aiops_pattern_analysis', 'apm_service_map',
  'custom_content', 'discover_session', 'esql_control', 'field_stats_table', 'links', 'ml_anomaly_charts',
  'ml_anomaly_swimlane', 'ml_single_metric_viewer', 'options_list_control', 'range_slider_control', 'slo_alerts',
  'slo_burn_rate', 'slo_error_budget', 'slo_overview', 'synthetics_monitors', 'synthetics_stats_overview',
  'time_slider_control',
];
for (const type of STUB_TYPES) {
  setup.registerEmbeddableServerDefinition(type, {
    title: `zz stub ${type}`,
    getSchema: () => z.object({ prototype_stub: z.string().optional() }).strict(),
  });
}

const bodySchema = getDashboardDataSchema(embeddables.getAllEmbeddableSchemas(), { isDashboardAppRequest: false });
const converter = new OasConverter({ serverless: false });
const requestSchema = converter.convert(bodySchema);

const doc = {
  openapi: '3.0.0',
  info: { title: 'Kibana HTTP APIs (prototype slice)', version: '0.0.0' },
  servers: [{ url: 'http://localhost:5601' }],
  paths: {
    '/api/dashboards': {
      post: {
        operationId: 'create-dashboard',
        summary: 'Create a dashboard',
        tags: ['Dashboards'],
        requestBody: { content: { 'application/json': { schema: requestSchema } } },
        responses: { 201: { description: 'created' } },
      },
    },
  },
  components: converter.getSchemaComponents(),
};

fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, 'bundle.json'), JSON.stringify(doc, null, 2));
console.log(`wrote out/bundle.json (${Object.keys(doc.components.schemas).length} components)`);

(async () => {
  const { merge } = require('@kbn/openapi-bundler');
  await merge({
    sourceGlobs: [path.join(OUT, 'bundle.json')],
    outputFilePath: path.join(OUT, 'kibana.slice.yaml'),
    options: { prototypeDocument: path.join(ROOT, 'oas_docs/kibana.info.yaml') },
  });
  console.log('wrote out/kibana.slice.yaml');

  // The rest of `make api-docs` for the stateful bundle that touches Dashboards: the dashboards overlay, the
  // bump-slim overlay (strips the Dashboards operations from kibana.yaml) and `redocly bundle`.
  const { execFileSync } = require('child_process');
  const bin = (b) => path.join(ROOT, 'node_modules/.bin', b);
  const overlay = (from, ov, to) =>
    fs.writeFileSync(path.join(OUT, to), execFileSync(bin('bump'), ['overlay', path.join(OUT, from), path.join(ROOT, 'oas_docs/overlays', ov)], { stdio: ['ignore', 'pipe', 'ignore'] }));
  overlay('kibana.slice.yaml', 'dashboards.overlays.yaml', 'tmp1.yaml');
  overlay('tmp1.yaml', 'kibana.overlays.bump_slim.yaml', 'tmp2.yaml');
  execFileSync(bin('redocly'), ['bundle', path.join(OUT, 'tmp2.yaml'), '--ext', 'yaml', '-o', path.join(OUT, 'kibana.slice.published.yaml')], { stdio: 'ignore' });
  fs.rmSync(path.join(OUT, 'tmp1.yaml'));
  fs.rmSync(path.join(OUT, 'tmp2.yaml'));
  const count = (f) => (fs.readFileSync(path.join(OUT, f), 'utf8').match(/x-tf/g) || []).length;
  console.log(`wrote out/kibana.slice.published.yaml; x-tf* keys: bundle.json ${count('bundle.json')}, merged ${count('kibana.slice.yaml')}, published ${count('kibana.slice.published.yaml')}`);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
