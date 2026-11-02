// PROTOTYPE (spike C). HashiCorp Provider Code Specification (tfplugingen-openapi output) -> attribute-tree/v1,
// to diff what an off-the-shelf generator makes of the derived schema. No groups: it has none to give.
import { readFileSync, writeFileSync } from 'node:fs';
const [, , inFile, outFile] = process.argv;
const pcs = JSON.parse(readFileSync(inFile, 'utf8'));
const MODE = { required: 'required', optional: 'optional', computed: 'computed', computed_optional: 'optional_computed' };
const PRIM = { string: 'string', int64: 'number', float64: 'number', number: 'number', bool: 'bool' };
const attributes = [];
const walk = (attrs, prefix) => {
  for (const a of attrs) {
    const [type, def] = Object.entries(a).find(([k]) => k !== 'name');
    const path = prefix ? `${prefix}.${a.name}` : a.name;
    const mode = MODE[def.computed_optional_required];
    if (PRIM[type]) attributes.push({ path, kind: PRIM[type], mode });
    else if (type === 'single_nested') { attributes.push({ path, kind: 'object', mode }); walk(def.attributes ?? [], path); }
    else if (type === 'list_nested' || type === 'set_nested') {
      attributes.push({ path, kind: type.split('_')[0], element: 'object', mode });
      walk(def.nested_object.attributes ?? [], `${path}[]`);
    } else if (type === 'map_nested') {
      attributes.push({ path, kind: 'map', element: 'object', mode }); walk(def.nested_object.attributes ?? [], `${path}{}`);
    } else if (type === 'list' || type === 'set' || type === 'map') {
      const [et] = Object.keys(def.element_type);
      attributes.push({ path, kind: type, element: PRIM[et] ?? et, mode });
    } else throw new Error(`unhandled ${type} at ${path}`);
  }
};
walk(pcs.resources[0].schema.attributes, '');
writeFileSync(outFile, JSON.stringify({ format: 'attribute-tree/v1', resource: 'elasticstack_kibana_dashboard',
  source: 'tfplugingen-openapi over the spike C derived OAS', attributes, groups: [] }, null, 2) + '\n');
console.log(`wrote ${outFile}: ${attributes.length} attributes`);
