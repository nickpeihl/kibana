#!/usr/bin/env node
// PROTOTYPE (spike C). Schema-conversion consumer: derived Terraform-shaped JSON Schema -> attribute-tree/v1.
//
// Deliberately standalone: no imports from Kibana or from the other prototype files. It knows only standard
// JSON Schema 2020-12 keywords and maps them onto Terraform concepts. It refuses anyOf/oneOf/discriminator and
// unknown keywords, so anything polymorphic sneaking into the published schema fails loudly.
//
//   node prototype_dashboards_tf_c/schema_consumer.mjs <derived.schema.json> <out.attribute-tree.json>
import { readFileSync, writeFileSync } from 'node:fs';

const [, , inFile, outFile] = process.argv;
const doc = JSON.parse(readFileSync(inFile, 'utf8'));

const KNOWN = new Set([
  '$schema', '$id', '$defs', '$ref', 'title', 'description', 'type', 'properties', 'required', 'items', 'enum',
  'additionalProperties', 'contentMediaType', 'minProperties', 'maxProperties', 'dependentSchemas', 'allOf',
  'if', 'then', 'const', 'default',
]);
const resolve = (s) => {
  if (!s.$ref) return s;
  const name = s.$ref.replace('#/$defs/', '');
  if (!doc.$defs?.[name]) throw new Error(`unresolvable ${s.$ref}`);
  return doc.$defs[name];
};

const attributes = [];
const groups = [];

const kindOf = (s) => {
  s = resolve(s);
  for (const k of Object.keys(s)) if (!KNOWN.has(k)) throw new Error(`unsupported keyword ${k}`);
  switch (s.type) {
    case 'string':
      return s.contentMediaType === 'application/json' ? 'json-string' : 'string';
    case 'number':
    case 'integer':
      return 'number';
    case 'boolean':
      return 'bool';
    case 'array':
      return 'list';
    case 'object':
      return s.properties || typeof s.additionalProperties !== 'object' ? 'object' : 'map';
    default:
      throw new Error(`no type: ${JSON.stringify(s).slice(0, 200)}`);
  }
};

const visit = (s, path, mode) => {
  s = resolve(s);
  const kind = kindOf(s);
  const attr = { path, kind, mode };
  if (kind === 'list') attr.element = kindOf(s.items);
  if (kind === 'map') attr.element = kindOf(s.additionalProperties);
  if (path) attributes.push(attr);
  if (kind === 'list' && attr.element === 'object') visitObject(resolve(s.items), `${path}[]`);
  if (kind === 'map' && attr.element === 'object') visitObject(resolve(s.additionalProperties), `${path}{}`);
  if (kind === 'object') visitObject(s, path);
};

const visitObject = (s, path) => {
  const p = (name) => (path ? `${path}.${name}` : name);
  for (const [name, child] of Object.entries(s.properties ?? {})) {
    // Tried: `default` -> optional_computed (Kibana fills it in). It made modes worse vs the baseline (89 vs 83
    // mismatches), so `default` is documentation only here.
    const mode = (s.required ?? []).includes(name) ? 'required' : 'optional';
    visit(child, p(name), mode);
  }
  const names = Object.keys(s.properties ?? {});
  // Exactly one property present -> exactly_one_of over all of them.
  if (s.minProperties === 1 && s.maxProperties === 1) groups.push({ kind: 'exactly_one_of', members: names.map(p) });
  else if (s.maxProperties === 1) groups.push({ kind: 'conflicts_with', members: names.map(p) });
  // dependentSchemas: `{K: {properties: {other: false, disc: {enum}}}}` -> conflicts + discriminator values.
  if (s.dependentSchemas) {
    const members = Object.keys(s.dependentSchemas);
    let discPath;
    const values = {};
    for (const [k, dep] of Object.entries(s.dependentSchemas)) {
      for (const [other, sub] of Object.entries(dep.properties ?? {})) {
        if (sub === false) {
          if (!members.includes(other)) throw new Error(`${p(k)} conflicts with non-member ${other}`);
          continue;
        }
        if (sub.enum && (s.properties?.[other])) {
          discPath = p(other);
          values[p(k)] = sub.enum;
        }
      }
    }
    // RequiredIf via allOf[if disc=const then required [K]]: if every member is required by some value -> at least one.
    const requiredByIf = new Set(
      (s.allOf ?? []).flatMap((c) => (c.if && c.then?.required ? c.then.required : []))
    );
    const atLeastOne = members.every((m) => requiredByIf.has(m));
    groups.push({
      kind: atLeastOne ? 'exactly_one_of' : 'conflicts_with',
      members: members.map(p),
      ...(discPath ? { discriminator: { path: discPath, values } } : {}),
    });
  }
};

visit(doc, '', 'required');
attributes.sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
for (const g of groups) g.members.sort();
writeFileSync(
  outFile,
  JSON.stringify(
    {
      format: 'attribute-tree/v1',
      resource: 'elasticstack_kibana_dashboard',
      source: `spike C schema_consumer.mjs from ${doc.$id} (${doc.description})`,
      attributes,
      groups,
    },
    null,
    2
  ) + '\n'
);
console.log(`wrote ${outFile}: ${attributes.length} attributes, ${groups.length} groups`);
