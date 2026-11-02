// PROTOTYPE (dashboards-tf spike A). Value conversion: Dashboards API JSON <-> Terraform-shaped JSON, driven ONLY by
// the generated OAS (+ x-tf-*). `toTf` is the value conversion; `toApi` is its inverse, used by the round-trip check.
//
//   node prototype_dashboards_tf_a/consumers/value_conversion.mts [fixture.json ...]   -> out/tf/<name>.tf.json
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Compiler, HERE, ROOT_COMPONENT, SECTION_COMPONENT, loadOas } from './oas_tf_model.mts';
import type { TNode, Variant } from './oas_tf_model.mts';

type Json = any;
export const FIXTURES = join(HERE, '../../../../kibana/.claude/dashboards-terraform/spike0/fixtures');

const isSection = (item: Json) => item && typeof item === 'object' && Array.isArray(item.panels) && !('type' in item);

export const buildModel = () => {
  const c = new Compiler(loadOas());
  const root = c.compile({ $ref: `#/components/schemas/${ROOT_COMPONENT}` });
  if (root.k !== 'object') throw new Error('root is not an object');
  // Hand-coded sections split (deviation): see schema_conversion.mts.
  const panelsRaw = c.resolve(c.schemas[ROOT_COMPONENT].properties.panels);
  const [panelUnionRaw] = c.unionBranches(c.resolve(panelsRaw.items))!.filter(
    (b: Json) => b.$ref !== `#/components/schemas/${SECTION_COMPONENT}`
  );
  for (const p of root.props) if (p.apiName === 'panels') p.node = { k: 'list', items: c.compile(panelUnionRaw) };
  root.props.push({
    apiName: 'sections',
    tfName: 'sections',
    required: false,
    node: c.compile({ type: 'array', items: { $ref: `#/components/schemas/${SECTION_COMPONENT}` } }),
  });
  return root;
};

/** Things the value conversion could not represent (API-only fields, unknown keys). */
export const losses: string[] = [];

const recognize = (n: Extract<TNode, { k: 'keyed' }>, value: Json, path: string): Variant => {
  const found = n.m.structural
    ? n.variants.find(({ match }) =>
        match?.present ? match.present in value : match?.absent ? !(match.absent in value) : false
      )
    : n.variants.find((v) => v.values.includes(value[n.disc!] ?? n.m.default_value));
  if (!found) throw new Error(`${path}: no variant recognized for ${JSON.stringify(value).slice(0, 120)}`);
  return found;
};

export const toTf = (n: TNode, value: Json, path = ''): Json => {
  switch (n.k) {
    case 'prim':
      return value;
    case 'json':
      return n.attribute ? { [n.attribute]: JSON.stringify(value) } : JSON.stringify(value);
    case 'list':
      return (value as Json[]).map((v, i) => toTf(n.items, v, `${path}[${i}]`));
    case 'object': {
      const out: Json = {};
      for (const [k, v] of Object.entries(value)) {
        const prop = n.props.find((p) => p.apiName === k);
        if (!prop) {
          losses.push(`${path}.${k}`);
          continue;
        }
        if (prop.flatten) Object.assign(out, toTf(prop.node, v, `${path}.${k}`));
        else out[prop.tfName] = toTf(prop.node, v, `${path}.${k}`);
      }
      return out;
    }
    case 'keyed': {
      const variant = recognize(n, value, path);
      const out: Json = {};
      const content: Json = { ...value };
      for (const prop of n.outside) {
        if (prop.apiName in value) out[prop.tfName] = toTf(prop.node, value[prop.apiName], `${path}.${prop.apiName}`);
        delete content[prop.apiName];
      }
      if (n.disc) {
        if (n.discOutside) out[n.disc] = value[n.disc];
        if (!variant.keepDisc) delete content[n.disc];
      }
      const body = n.m.content ? value[n.m.content] : content;
      out[variant.key] = toTf(variant.content, body, `${path}.${variant.key}`);
      return out;
    }
  }
};

export const toApi = (n: TNode, tf: Json): Json => {
  switch (n.k) {
    case 'prim':
      return tf;
    case 'json':
      return JSON.parse(n.attribute ? tf[n.attribute] : tf);
    case 'list':
      return (tf as Json[]).map((v) => toApi(n.items, v));
    case 'object': {
      const out: Json = {};
      for (const prop of n.props) {
        if (prop.flatten) {
          const sub = toApi(prop.node, tf);
          if (Object.keys(sub).length) out[prop.apiName] = sub;
        } else if (tf[prop.tfName] !== undefined) {
          out[prop.apiName] = toApi(prop.node, tf[prop.tfName]);
        }
      }
      return out;
    }
    case 'keyed': {
      const out: Json = {};
      for (const prop of n.outside) if (tf[prop.tfName] !== undefined) out[prop.apiName] = toApi(prop.node, tf[prop.tfName]);
      if (n.disc && n.discOutside) out[n.disc] = tf[n.disc];
      const extra = n.m.extra_json_variant;
      if (extra && tf[extra.key] !== undefined) {
        const parsed = JSON.parse(tf[extra.key]);
        if (n.m.content) out[n.m.content] = parsed;
        else Object.assign(out, parsed);
        return out;
      }
      const variant = n.variants.find((v) => tf[v.key] !== undefined);
      if (!variant) throw new Error(`no variant key set among ${n.variants.map((v) => v.key).join(', ')}`);
      const body = toApi(variant.content, tf[variant.key]);
      if (n.m.content) out[n.m.content] = body;
      else Object.assign(out, body);
      if (n.disc && !n.discOutside && !variant.keepDisc) {
        if (variant.values.length !== 1) throw new Error(`${variant.key}: ambiguous discriminator ${variant.values}`);
        out[n.disc] = variant.values[0];
      }
      return out;
    }
  }
};

/** Terraform template escapes, applied to every string (JSON leaves included). */
const mapStrings = (v: Json, f: (s: string) => string): Json =>
  typeof v === 'string'
    ? f(v)
    : Array.isArray(v)
    ? v.map((x) => mapStrings(x, f))
    : v && typeof v === 'object'
    ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, mapStrings(x, f)]))
    : v;
// Function replacers: in a string replacement, `$$` means a literal `$`, which would silently undo the escape.
export const escapeTf = (v: Json) =>
  mapStrings(v, (s) => s.replace(/\$\{/g, () => '$${').replace(/%\{/g, () => '%%{'));
export const unescapeTf = (v: Json) =>
  mapStrings(v, (s) => s.replace(/\$\$\{/g, () => '${').replace(/%%\{/g, () => '%{'));

export const apiToTfJson = (root: TNode, api: Json, name: string): Json => {
  const { panels = [], ...rest } = api;
  const split = { ...rest } as Json;
  const plain = panels.filter((p: Json) => !isSection(p));
  const sections = panels.filter(isSection);
  if (plain.length) split.panels = plain;
  if (sections.length) split.sections = sections;
  return { resource: { elasticstack_kibana_dashboard: { [name]: escapeTf(toTf(root, split)) } } };
};

export const tfJsonToApi = (root: TNode, tfJson: Json): Json => {
  const [body] = Object.values(tfJson.resource.elasticstack_kibana_dashboard) as Json[];
  const { sections = [], panels = [], ...rest } = toApi(root, unescapeTf(body));
  const out = { ...rest } as Json;
  if (panels.length || sections.length) out.panels = [...panels, ...sections];
  return out;
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = buildModel();
  const files = process.argv.slice(2).length
    ? process.argv.slice(2)
    : readdirSync(FIXTURES)
        .filter((f) => f.endsWith('.json') && f !== 'index.json')
        .map((f) => join(FIXTURES, f));
  const outDir = join(HERE, '../out/tf');
  mkdirSync(outDir, { recursive: true });
  for (const f of files) {
    const name = basename(f, '.json');
    losses.length = 0;
    const tf = apiToTfJson(root, JSON.parse(readFileSync(f, 'utf8')), name);
    writeFileSync(join(outDir, `${name}.tf.json`), JSON.stringify(tf, null, 2));
    console.log(`wrote out/tf/${name}.tf.json${losses.length ? `  (dropped: ${losses.join(', ')})` : ''}`);
  }
}
