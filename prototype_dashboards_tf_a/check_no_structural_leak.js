// PROTOTYPE (spike A): proves the x-tf-* annotations do not change the API's OAS beyond adding x- keys.
// Strips every `x-tf*` key from out/kibana.slice.yaml and compares each component with the published
// oas_docs/output/kibana.yaml (same commit, no annotations). Stub panel types (harness-only) are expected to differ.
// Usage: node prototype_dashboards_tf_a/check_no_structural_leak.js
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const yaml = require('js-yaml');
const ROOT = path.resolve(__dirname, '..');
const strip = (n) =>
  Array.isArray(n)
    ? n.map(strip)
    : n && typeof n === 'object'
    ? Object.fromEntries(Object.entries(n).filter(([k]) => !k.startsWith('x-tf')).map(([k, v]) => [k, strip(v)]))
    : n;
const mine = strip(yaml.load(fs.readFileSync(path.join(__dirname, 'out/kibana.slice.yaml'), 'utf8')).components.schemas);
const pub = yaml.load(fs.readFileSync(path.join(ROOT, 'oas_docs/output/kibana.yaml'), 'utf8')).components.schemas;
const STUB_AFFECTED = /panel-type-(?!image$|vis$|markdown$)|kbn-dashboard-data$|kbn-dashboard-section$/;
let same = 0;
const differ = [];
const notPublished = [];
for (const [k, v] of Object.entries(mine)) {
  if (!pub[k]) { notPublished.push(k); continue; }
  try { assert.deepStrictEqual(v, pub[k]); same++; } catch { differ.push(k); }
}
const unexpected = differ.filter((k) => !STUB_AFFECTED.test(k));
console.log(`components: ${Object.keys(mine).length}; identical to published after stripping x-tf*: ${same}`);
console.log(`differ only because of harness stubs: ${differ.length - unexpected.length}`);
console.log(`new components not in published OAS: ${notPublished.length} ${notPublished.join(', ')}`);
console.log(`unexpected differences: ${unexpected.length} ${unexpected.join(', ')}`);
process.exit(unexpected.length || notPublished.length ? 1 : 0);
