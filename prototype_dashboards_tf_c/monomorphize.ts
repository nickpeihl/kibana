// PROTOTYPE (spike C). Zod-derived JSON Schema (+ tf_shape_mapping.ts) -> "TF plan" -> monomorphic JSON Schema.
//
// Input: the OAS components that Kibana's Zod->OAS converter (`@kbn/router-to-openapispec`, zod/lib.ts `convert`)
// emits for the Dashboards API. In production this would run inside the OAS capture step, where every plugin has
// registered its panel schema; the prototype reads the committed output (oas_docs/output/kibana.yaml).
//
// The same plan drives value conversion (value_conversion.ts), so schema and values cannot disagree.
import { ruleAt, type Rule } from './tf_shape_mapping.ts';

type Raw = any;
const PREFIX = '#/components/schemas/';
let COMPONENTS: Record<string, Raw> = {};
export const setComponents = (c: Record<string, Raw>) => {
  COMPONENTS = c;
};

// ---------------------------------------------------------------------------------------------------------------
// Normalization of one schema level (generic, no mapping involved).

type N =
  | { k: 'obj'; props: Record<string, Raw>; required: Set<string>; addl?: Raw; title?: string; description?: string }
  | { k: 'arr'; items: Raw; description?: string }
  | { k: 'prim'; t: 'string' | 'number' | 'boolean'; enum?: unknown[]; description?: string }
  | { k: 'union'; branches: Raw[]; title?: string; description?: string }
  | { k: 'any'; description?: string }
  | { k: 'never' };

export const deref = (raw: Raw): Raw => {
  let r = raw;
  let extra: Raw = {};
  while (r?.$ref) {
    const { $ref, ...rest } = r;
    extra = { ...rest, ...extra };
    r = COMPONENTS[$ref.slice(PREFIX.length)];
    if (!r) throw new Error(`unknown $ref ${$ref}`);
  }
  return Object.keys(extra).length ? { ...r, ...extra } : r;
};

const primType = (t: string) => (t === 'integer' ? 'number' : t) as 'string' | 'number' | 'boolean';
const stableJson = (v: unknown): string =>
  JSON.stringify(v, (_k, x) =>
    x && typeof x === 'object' && !Array.isArray(x)
      ? Object.fromEntries(Object.keys(x).sort().map((k) => [k, x[k]]))
      : x
  );

// Structural identity, ignoring documentation-only keywords.
const shapeJson = (raw: Raw): string =>
  stableJson(deref(raw), ) .replace(/"(description|title|examples|example)":("(?:[^"\\]|\\.)*"|\[[^\]]*\]),?/g, '');

export const norm = (raw0: Raw): N => {
  const raw = deref(raw0);
  if (raw.not && Object.keys(raw.not).length === 0) return { k: 'never' };
  if (raw.allOf) {
    const parts = raw.allOf.map(norm);
    const u = parts.findIndex((p: N) => p.k === 'union');
    if (u >= 0) {
      // allOf[union, rest...] -> union of allOf[branch, rest...] (distribute shared fields into every variant)
      const others = raw.allOf.filter((_: Raw, i: number) => i !== u);
      const un = parts[u] as Extract<N, { k: 'union' }>;
      return {
        k: 'union',
        branches: un.branches.map((b) => ({ allOf: [b, ...others] })),
        title: raw.title ?? un.title,
        description: raw.description,
      };
    }
    const props: Record<string, Raw> = {};
    const required = new Set<string>();
    for (const p of parts) {
      if (p.k !== 'obj') throw new Error(`allOf with non-object member (${p.k})`);
      for (const [name, s] of Object.entries(p.props)) {
        if (props[name] && shapeJson(props[name]) !== shapeJson(s))
          throw new Error(`allOf: conflicting property ${name}: ${shapeJson(props[name])} vs ${shapeJson(s)}`);
        props[name] = s;
      }
      p.required.forEach((r) => required.add(r));
    }
    return { k: 'obj', props, required, title: raw.title, description: raw.description };
  }
  const alts = raw.anyOf ?? raw.oneOf;
  if (alts) {
    const bs = alts.filter((b: Raw) => deref(b).type !== 'null');
    if (bs.length === 1) return { ...norm(bs[0]), description: raw.description } as N;
    const ns = bs.map(norm);
    // anyOf of primitives of one type (Zod z.union of literals / z.enum) -> one enum
    if (ns.every((n: N) => n.k === 'prim' && n.t === (ns[0] as any).t)) {
      const withEnum = ns.every((n: any) => n.enum);
      return {
        k: 'prim',
        t: (ns[0] as any).t,
        enum: withEnum ? [...new Set(ns.flatMap((n: any) => n.enum))] : undefined,
        description: raw.description,
      };
    }
    return { k: 'union', branches: bs, title: raw.title, description: raw.description };
  }
  let type = raw.type;
  if (Array.isArray(type)) type = type.filter((t: string) => t !== 'null')[0];
  if (raw.properties || type === 'object') {
    const addl = typeof raw.additionalProperties === 'object' ? raw.additionalProperties : undefined;
    if (!raw.properties && !addl) return { k: 'any', description: raw.description };
    return {
      k: 'obj',
      props: raw.properties ?? {},
      required: new Set(raw.required ?? []),
      addl,
      title: raw.title,
      description: raw.description,
    };
  }
  if (type === 'array') return { k: 'arr', items: raw.items ?? {}, description: raw.description };
  if (['string', 'number', 'integer', 'boolean'].includes(type))
    return {
      k: 'prim',
      t: primType(type),
      enum: raw.enum ?? (raw.const !== undefined ? [raw.const] : undefined),
      description: raw.description,
    };
  if (raw.enum) return { k: 'prim', t: 'string', enum: raw.enum, description: raw.description };
  return { k: 'any', description: raw.description };
};

// Superset merge (awscc-style) used by `merge` rules and by variant keys that group several branches.
const expandUnion = (raw: Raw): Raw[] => {
  const n = norm(raw);
  return n.k === 'union' ? n.branches.flatMap(expandUnion) : [raw];
};
const mergeProp = (list: Raw[]): Raw => {
  if (list.every((r) => stableJson(deref(r)) === stableJson(deref(list[0])))) return list[0];
  const ns = list.map(norm);
  if (ns.every((n) => n.k === 'prim' && n.t === (ns[0] as any).t)) {
    const withEnum = ns.every((n: any) => n.enum);
    return { type: (ns[0] as any).t, ...(withEnum ? { enum: [...new Set(ns.flatMap((n: any) => n.enum))] } : {}) };
  }
  if (ns.every((n) => n.k === 'obj')) return mergeRaw(list);
  if (ns.every((n) => n.k === 'arr')) return { type: 'array', items: mergeProp(ns.map((n: any) => n.items)) };
  // Mixed shapes or nested unions: leave a union; a rule at the child path must resolve it.
  return { anyOf: list.flatMap(expandUnion) };
};
export const mergeRaw = (raws: Raw[]): Raw => {
  const branches = raws.flatMap(expandUnion);
  const ns = branches.map(norm);
  if (ns.every((n) => n.k === 'arr')) return { type: 'array', items: mergeProp(ns.map((n: any) => n.items)) };
  if (!ns.every((n) => n.k === 'obj')) throw new Error(`merge: non-object branches (${ns.map((n) => n.k)})`);
  const byName = new Map<string, Raw[]>();
  for (const n of ns as Array<Extract<N, { k: 'obj' }>>)
    for (const [name, s] of Object.entries(n.props)) byName.set(name, [...(byName.get(name) ?? []), s]);
  const properties: Record<string, Raw> = {};
  for (const [name, list] of byName) properties[name] = mergeProp(list);
  const required = [...byName.keys()].filter((name) =>
    (ns as Array<Extract<N, { k: 'obj' }>>).every((n) => n.required.has(name))
  );
  return { type: 'object', properties, required, title: deref(raws[0]).title, description: deref(raws[0]).description };
};

// ---------------------------------------------------------------------------------------------------------------
// TF plan: the Terraform-shaped view of a schema location. Consumed by the schema emitter and value conversion.

export type Plan =
  | { k: 'prim'; t: 'string' | 'number' | 'boolean'; enum?: unknown[]; description?: string }
  | { k: 'json'; description?: string; auto?: boolean }
  | { k: 'opaque' }
  | { k: 'arr'; items: Plan; wrap?: string; description?: string }
  | { k: 'map'; values: Plan; description?: string }
  | { k: 'obj'; fields: Field[]; description?: string }
  | {
      k: 'variants';
      rule: Extract<Rule, { kind: 'variants' }>;
      path: string;
      disc: string;
      hoisted: Field[];
      variants: Variant[];
      description?: string;
    };
export interface Field {
  tf: string;
  api: string;
  plan: Plan;
  required: boolean;
  flatten?: boolean;
  /** Zod `.default()` survives into JSON Schema `default`: Kibana fills it in, i.e. Terraform optional+computed. */
  default?: unknown;
  split?: { into: string; plan: Plan; recognize: (v: any) => 'section' | 'panel' };
}
export interface Variant {
  key: string;
  labels: string[];
  plan: Plan;
  omitDisc: boolean;
  json?: boolean;
}

export const unmapped: string[] = [];
export const autoJson: string[] = [];

const labelsOf = (raw: Raw, disc: string): string[] => {
  const n = norm(raw);
  if (n.k === 'union') return [...new Set(n.branches.flatMap((b) => labelsOf(b, disc)))];
  if (n.k === 'obj' && n.props[disc]) {
    const p = norm(n.props[disc]);
    if (p.k === 'prim' && p.enum) return p.enum.map(String);
  }
  return [];
};
const titleOf = (raw: Raw): string => {
  const r = deref(raw);
  return r.title ?? (raw.$ref ? raw.$ref.slice(PREFIX.length) : '<untitled>');
};

interface Opts {
  omit?: Set<string>;
  noRule?: boolean;
}

export const planOf = (raw: Raw, path: string, opts: Opts = {}): Plan => {
  const rule = opts.noRule ? undefined : ruleAt(path);
  if (rule?.kind === 'json') return { k: 'json', description: deref(raw).description };
  const n = norm(rule?.kind === 'merge' ? mergeRaw([raw]) : raw);
  switch (n.k) {
    case 'never':
      throw new Error(`never at ${path}`);
    case 'prim':
      return { k: 'prim', t: n.t, enum: n.enum, description: n.description };
    case 'any':
      autoJson.push(path);
      return { k: 'json', description: n.description, auto: true };
    case 'arr': {
      const itemPath = `${path}[]`;
      const ir = ruleAt(itemPath);
      if (ir?.kind === 'json') return { k: 'arr', items: { k: 'json' }, wrap: ir.name ?? 'config_json', description: n.description };
      return { k: 'arr', items: planOf(n.items, itemPath), description: n.description };
    }
    case 'obj': {
      if (n.addl && !Object.keys(n.props).length) return { k: 'map', values: planOf(n.addl, `${path}{}`), description: n.description };
      const flattenProp = rule?.kind === 'flatten' ? rule.prop : undefined;
      const fields: Field[] = [];
      for (const [name, s] of Object.entries(n.props)) {
        if (opts.omit?.has(name)) continue;
        const childPath = path ? `${path}.${name}` : name;
        const required = n.required.has(name);
        if (name === flattenProp) {
          fields.push({ tf: name, api: name, plan: planOf(s, path, { noRule: true }), required, flatten: true });
          continue;
        }
        const cr = ruleAt(childPath);
        if (cr?.kind === 'split_sections') {
          const items = norm(norm(s).k === 'arr' ? (norm(s) as any).items : s) as Extract<N, { k: 'union' }>;
          const sectionRaw = items.branches.find((b) => titleOf(b) === 'Section');
          const panelRaw = items.branches.find((b) => titleOf(b) !== 'Section');
          fields.push({
            tf: name,
            api: name,
            required,
            plan: { k: 'arr', items: planOf(panelRaw, `${childPath}[]`) },
            split: { into: cr.into, plan: { k: 'arr', items: planOf(sectionRaw, `${cr.into}[]`) }, recognize: cr.recognize },
          });
          continue;
        }
        const tf = cr?.kind === 'json' ? cr.name ?? `${name}_json` : name;
        const dflt = deref(s).default;
        fields.push({ tf, api: name, plan: planOf(s, childPath), required, ...(dflt !== undefined ? { default: dflt } : {}) });
      }
      return { k: 'obj', fields, description: n.description };
    }
    case 'union': {
      if (rule?.kind !== 'variants') {
        unmapped.push(`${path} (${n.branches.map(titleOf).join(' | ')})`);
        return { k: 'json', description: `UNMAPPED UNION ${n.description ?? ''}` };
      }
      return planVariants(rule, n, path);
    }
  }
};

const planVariants = (r: Extract<Rule, { kind: 'variants' }>, n: Extract<N, { k: 'union' }>, path: string): Plan => {
  const disc = r.discriminator ?? 'type';
  const groups = new Map<string, { labels: string[]; raws: Raw[] }>();
  const kept: Raw[] = [];
  for (const b of n.branches) {
    let labels = r.labelBy === 'title' ? [titleOf(b)] : labelsOf(b, disc);
    if (!labels.length) labels = [titleOf(b)];
    const keys = new Set(labels.map((l) => r.key(l)));
    if (keys.size !== 1 || [...keys][0] === undefined)
      throw new Error(`${path}: labels ${labels} map to keys ${[...keys]}`);
    const key = [...keys][0];
    if (key === 'drop') continue;
    kept.push(b);
    const g = groups.get(key) ?? { labels: [], raws: [] };
    g.labels.push(...labels);
    g.raws.push(b);
    groups.set(key, g);
  }
  const hoist = r.hoist ?? [];
  const variants: Variant[] = [];
  for (const [key, g] of groups) {
    const omitDisc = r.labelBy !== 'title' && !(r.keepDiscriminatorIn ?? []).includes(key);
    const contentRaws = r.content ? g.raws.map((b) => (norm(b) as any).props[r.content!]) : g.raws;
    const contentRaw = contentRaws.length === 1 ? contentRaws[0] : mergeRaw(contentRaws);
    const omit = new Set<string>(r.content ? [] : [...hoist, ...(omitDisc ? [disc] : [])]);
    const plan: Plan = r.opaque?.(key) ? { k: 'opaque' } : planOf(contentRaw, `${path}.${key}`, { omit });
    variants.push({ key, labels: g.labels, plan, omitDisc: omitDisc && !r.content && !hoist.includes(disc) });
  }
  if (r.jsonVariant) variants.push({ key: r.jsonVariant.key, labels: r.jsonVariant.labels, plan: { k: 'json' }, omitDisc: false, json: true });
  const hoisted: Field[] = hoist.map((h) => {
    const objs = kept.map((b) => norm(b) as Extract<N, { k: 'obj' }>);
    const raws = objs.map((o) => o.props[h]).filter(Boolean);
    return {
      tf: h,
      api: h,
      plan: planOf(mergeProp(raws), `${path}.${h}`),
      required: objs.every((o) => o.required.has(h)),
    };
  });
  return { k: 'variants', rule: r, path, disc, hoisted, variants, description: n.description };
};

// ---------------------------------------------------------------------------------------------------------------
// Emit the derived, monomorphic JSON Schema (2020-12). Only standard keywords; no x- keys, no anyOf/oneOf.

const JSON_LEAF = (description?: string) => ({
  type: 'string',
  contentMediaType: 'application/json',
  ...(description ? { description } : {}),
});

export const emit = (p: Plan): Raw => {
  const d = (x: { description?: string }) => (x.description ? { description: x.description } : {});
  switch (p.k) {
    case 'prim':
      return { type: p.t, ...(p.enum ? { enum: p.enum } : {}), ...d(p) };
    case 'json':
      return JSON_LEAF(p.description);
    case 'opaque':
      return { type: 'object', description: 'PROTOTYPE: outside the spike slice, not expanded.' };
    case 'arr':
      return {
        type: 'array',
        items: p.wrap
          ? { type: 'object', properties: { [p.wrap]: JSON_LEAF() }, required: [p.wrap], additionalProperties: false }
          : emit(p.items),
        ...d(p),
      };
    case 'map':
      return { type: 'object', additionalProperties: emit(p.values), ...d(p) };
    case 'obj': {
      const properties: Raw = {};
      const required: string[] = [];
      const addField = (f: Field) => {
        if (f.flatten) {
          const inner = emit(f.plan);
          Object.assign(properties, inner.properties);
          if (f.required) required.push(...(inner.required ?? []));
          return;
        }
        properties[f.tf] = emit(f.plan);
        if (f.default !== undefined && f.plan.k !== 'json') properties[f.tf].default = f.default;
        if (f.required) required.push(f.tf);
        if (f.split) properties[f.split.into] = emit(f.split.plan);
      };
      p.fields.forEach(addField);
      return { type: 'object', properties, ...(required.length ? { required } : {}), additionalProperties: false, ...d(p) };
    }
    case 'variants': {
      const properties: Raw = {};
      const required: string[] = [];
      for (const h of p.hoisted) {
        properties[h.tf] = emit(h.plan);
        if (h.required) required.push(h.tf);
      }
      for (const v of p.variants) properties[v.key] = emit(v.plan);
      const keys = p.variants.map((v) => v.key);
      const out: Raw = { type: 'object', properties, ...(required.length ? { required } : {}), additionalProperties: false, ...d(p) };
      const ex = p.rule.exclusivity;
      if (ex === 'exactly_one') {
        // Wrapper holds only variant keys: exactly one present.
        out.minProperties = 1;
        out.maxProperties = 1;
      } else {
        // dependentSchemas: if key K is present, the other keys are absent (false) and, when the discriminator
        // stays a sibling, it takes one of K's values.
        out.dependentSchemas = Object.fromEntries(
          p.variants.map((v) => [
            v.key,
            {
              properties: {
                ...(ex !== 'conflicts' ? { [p.disc]: { enum: v.labels } } : {}),
                ...Object.fromEntries(keys.filter((k) => k !== v.key).map((k) => [k, false])),
              },
            },
          ])
        );
        if (ex === 'exactly_one_with_discriminator') {
          // ...and every discriminator value requires its key (RequiredIf). if/then, not anyOf.
          out.allOf = p.variants.flatMap((v) =>
            v.labels.map((l) => ({ if: { properties: { [p.disc]: { const: l } }, required: [p.disc] }, then: { required: [v.key] } }))
          );
        }
      }
      return out;
    }
  }
};

export const buildRootPlan = () =>
  planOf({ $ref: `${PREFIX}Kibana_HTTP_APIs_kbn-dashboard-data` }, '');

export const buildDerivedSchema = (meta: { source: string }) => {
  const root = emit(buildRootPlan());
  // Share the panel definition between panels[] and sections[].panels[] when identical.
  const defs: Raw = {};
  const a = root.properties.panels.items;
  const b = root.properties.sections.items.properties.panels.items;
  if (stableJson(a) === stableJson(b)) {
    defs.panel = a;
    root.properties.panels.items = { $ref: '#/$defs/panel' };
    root.properties.sections.items.properties.panels.items = { $ref: '#/$defs/panel' };
  }
  return {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    $id: 'https://www.elastic.co/kibana/prototype/dashboards-terraform-shaped.schema.json',
    title: 'Dashboard (Terraform-shaped, PROTOTYPE spike C)',
    description: `Monomorphic projection of the Dashboards API create body. ${meta.source}`,
    ...root,
    $defs: defs,
  };
};

export const assertMonomorphic = (schema: Raw) => {
  const bad: string[] = [];
  const walk = (x: Raw, at: string) => {
    if (!x || typeof x !== 'object') return;
    for (const [k, v] of Object.entries(x)) {
      if (k.startsWith('x-') || k === 'anyOf' || k === 'oneOf' || k === 'discriminator') bad.push(`${at}/${k}`);
      walk(v, `${at}/${k}`);
    }
  };
  walk(schema, '#');
  return bad;
};
