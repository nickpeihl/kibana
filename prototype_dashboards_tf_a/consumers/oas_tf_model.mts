// PROTOTYPE (dashboards-tf spike A). Shared by both consumers: reads ONLY the generated OAS
// (out/kibana.slice.published.yaml) and compiles it, together with its `x-tf-*` extensions, into a small
// Terraform-oriented model (TNode). Schema conversion walks the model; value conversion walks it alongside a value.
//
// `x-tf-*` vocabulary (authored in Kibana's Zod via `.meta()`; types in @kbn/zod v4/terraform_meta.ts):
//   x-tf-union          on a union: discriminator, default_value, key_template, variant_keys, discriminator_placement,
//                       content, exclusivity, extra_json_variant, structural, merge, json_leaves
//   x-tf-union-override on a wrapper (array / $ref sibling): merged over the x-tf-union of the union below it
//   x-tf-variant        on a union branch: key, match {present|absent}, omit, keep_discriminator, json_leaves
//   x-tf-json-leaf      true on a property (-> `<prop>_json`), or { attribute } on a value (-> { [attribute]: json })
//   x-tf-flatten        on a property: hoist its properties into the parent
//   x-tf-omit           on a property: API-only
// Conventions (no annotation needed): a union of primitives is its primitive; a union of objects with no x-tf-union is
// a JSON leaf; `allOf[union, object]` distributes the object into every branch.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';

export const HERE = dirname(fileURLToPath(import.meta.url));
export const OAS_FILE = join(HERE, '../out/kibana.slice.published.yaml');
export const ROOT_COMPONENT = 'Kibana_HTTP_APIs_kbn-dashboard-data';
// Hand-coded special case (deviation): sections are split out of `panels[]` into a root `sections[]`.
export const SECTION_COMPONENT = 'Kibana_HTTP_APIs_kbn-dashboard-section';

type Raw = Record<string, any>;
export interface UnionMeta {
  discriminator?: string;
  default_value?: string;
  key_template?: string;
  variant_keys?: Record<string, string>;
  discriminator_placement?: 'drop' | 'outside';
  content?: string;
  exclusivity?: 'exactly_one_of' | 'conflicts_with';
  extra_json_variant?: { key: string; values: string[] };
  structural?: boolean;
  merge?: boolean;
  json_leaves?: Record<string, string>;
}

export interface Prop {
  apiName: string;
  tfName: string;
  node: TNode;
  required: boolean;
  flatten?: boolean;
}
export interface Variant {
  key: string;
  values: string[]; // discriminator values recognized as this variant
  match?: { present?: string; absent?: string };
  keepDisc: boolean;
  content: TNode;
}
export type TNode =
  | { k: 'prim'; type: 'string' | 'number' | 'bool' }
  | { k: 'json'; attribute?: string }
  | { k: 'object'; props: Prop[] }
  | { k: 'list'; items: TNode }
  | {
      k: 'keyed';
      m: UnionMeta;
      disc?: string;
      discOutside: boolean;
      outside: Prop[];
      variants: Variant[];
    };

export const loadOas = (file = OAS_FILE): Raw => yaml.load(readFileSync(file, 'utf8')) as Raw;

export class Compiler {
  readonly schemas: Record<string, Raw>;
  readonly conflicts: string[] = [];
  constructor(readonly doc: Raw) {
    this.schemas = doc.components.schemas;
  }

  /** Follow `$ref`s; `x-` siblings of a `$ref` (use-site metadata) override the target's. */
  resolve(raw: Raw): Raw {
    let node = raw;
    let siblings: Raw = {};
    const seen = new Set<string>();
    while (node && node.$ref) {
      const { $ref, ...rest } = node;
      siblings = { ...rest, ...siblings };
      if (seen.has($ref)) throw new Error(`ref cycle ${$ref}`);
      seen.add($ref);
      node = this.schemas[$ref.split('/').pop()];
      if (!node) throw new Error(`unresolved ${$ref}`);
    }
    return Object.keys(siblings).length ? { ...node, ...siblings } : node;
  }

  unionBranches(raw: Raw): Raw[] | undefined {
    return raw.anyOf ?? raw.oneOf;
  }

  /** Resolve and, unless it hides a union, merge `allOf` parts into one object schema. */
  normalize(raw: Raw): Raw {
    const s = this.resolve(raw);
    if (!s.allOf) return s;
    const parts = s.allOf.map((p: Raw) => this.normalize(p));
    const { allOf, ...own } = s;
    const unionPart = parts.find((p: Raw) => this.unionBranches(p) && !p.properties);
    if (unionPart) {
      // Convention: allOf[union, object...] -> union whose branches each get the object parts (vis by-value).
      const others = parts.filter((p: Raw) => p !== unionPart);
      const { anyOf, oneOf, ...unionOwn } = unionPart;
      return {
        ...unionOwn,
        ...own,
        anyOf: this.unionBranches(unionPart)!.map((b: Raw) => ({ allOf: [b, ...others] })),
      };
    }
    return parts.reduce((acc: Raw, p: Raw) => this.mergeObjects(acc, p, 'all'), own);
  }

  /** Merge two object schemas. `all` = allOf semantics (required: union); `any` = merged variants (intersection). */
  mergeObjects(a: Raw, b: Raw, mode: 'all' | 'any'): Raw {
    const props: Raw = { ...(a.properties ?? {}) };
    for (const [k, v] of Object.entries(b.properties ?? {})) {
      props[k] = props[k] && mode === 'any' ? this.mergeTwo(props[k], v as Raw, k) : props[k] ?? v;
    }
    const ra: string[] = a.required ?? [];
    const rb: string[] = b.required ?? [];
    const required =
      mode === 'all'
        ? [...new Set([...ra, ...rb])]
        : ra.filter((r) => rb.includes(r) && props[r] !== undefined);
    const xs = Object.fromEntries(
      Object.entries({ ...b, ...a }).filter(([k]) => k.startsWith('x-tf') || k === 'title')
    );
    return { ...xs, type: 'object', properties: props, required };
  }

  /** Combine the same property from two merged variants. */
  mergeTwo(a: Raw, b: Raw, name: string): Raw {
    if (JSON.stringify(a) === JSON.stringify(b)) return a;
    const na = this.normalize(a);
    const nb = this.normalize(b);
    if (JSON.stringify(na) === JSON.stringify(nb)) return a;
    const ua = this.unionBranches(na);
    const ub = this.unionBranches(nb);
    if (ua && ub && na['x-tf-union'] && !na['x-tf-union'].merge) {
      return { ...na, oneOf: undefined, anyOf: [...ua, ...ub] };
    }
    if (na.type === 'array' && nb.type === 'array') {
      return { ...na, items: this.mergeTwo(na.items, nb.items, `${name}[]`) };
    }
    if (na.properties && nb.properties) return this.mergeObjects(na, nb, 'any');
    if (this.isPrimitive(na) && this.isPrimitive(nb)) return na;
    this.conflicts.push(name);
    return { 'x-tf-json-leaf': true };
  }

  isPrimitive(s: Raw): boolean {
    const n = this.resolve(s);
    const br = this.unionBranches(n);
    if (br) return br.every((b: Raw) => this.isPrimitive(b));
    return ['string', 'number', 'integer', 'boolean'].includes(n.type) || (!!n.enum && !n.properties);
  }

  primType(s: Raw): 'string' | 'number' | 'bool' {
    const n = this.resolve(s);
    const br = this.unionBranches(n);
    if (br) {
      const ts = [...new Set(br.map((b: Raw) => this.primType(b)))];
      return ts.length === 1 ? (ts[0] as 'string' | 'number' | 'bool') : 'string';
    }
    if (n.type === 'boolean') return 'bool';
    if (n.type === 'number' || n.type === 'integer') return 'number';
    return 'string';
  }

  /** Apply `json_leaves` (`a`, `a[]`, `a[].b`) to an object schema, returning a new schema. */
  applyJsonLeaves(obj: Raw, leaves: Record<string, string> | undefined): Raw {
    if (!leaves) return obj;
    let out = obj;
    for (const [path, name] of Object.entries(leaves)) out = this.markLeaf(out, path.split('.'), name);
    return out;
  }

  private markLeaf(obj: Raw, segs: string[], name: string): Raw {
    const s = this.normalize(obj);
    const [seg, ...rest] = segs;
    const isItems = seg.endsWith('[]');
    const prop = isItems ? seg.slice(0, -2) : seg;
    if (!s.properties?.[prop]) return s; // not present in this variant
    let child: Raw;
    if (isItems) {
      const arr = this.resolve(s.properties[prop]);
      const items = rest.length
        ? this.markLeaf(arr.items, rest, name)
        : { ...arr.items, 'x-tf-json-leaf': { attribute: name } };
      child = { ...arr, items };
    } else {
      child = rest.length
        ? this.markLeaf(s.properties[prop], rest, name)
        : { ...s.properties[prop], 'x-tf-json-leaf': true, 'x-tf-json-name': name };
    }
    return { ...s, properties: { ...s.properties, [prop]: child } };
  }

  discValues(branch: Raw, disc: string): string[] {
    const p = branch.properties?.[disc];
    if (!p) return [];
    const collect = (n: Raw): string[] => {
      const r = this.resolve(n);
      const br = this.unionBranches(r);
      if (br) return br.flatMap(collect);
      return (r.enum ?? []).map(String);
    };
    return collect(p);
  }

  compile(raw: Raw, override?: Partial<UnionMeta>, stack: string[] = []): TNode {
    const refName = raw.$ref?.split('/').pop();
    if (refName && stack.includes(refName)) return { k: 'json' };
    const nextStack = refName ? [...stack, refName] : stack;
    const s = this.normalize(raw);
    const leaf = s['x-tf-json-leaf'];
    if (leaf) return { k: 'json', attribute: typeof leaf === 'object' ? leaf.attribute : undefined };

    const branches = this.unionBranches(s);
    if (branches) {
      if (branches.every((b: Raw) => this.isPrimitive(b))) return { k: 'prim', type: this.primType(s) };
      const m: UnionMeta | undefined = s['x-tf-union'] && { ...s['x-tf-union'], ...override };
      if (!m) return { k: 'json' }; // convention: unmapped union of objects -> JSON leaf
      if (m.merge) {
        const merged = branches
          .map((b: Raw) => this.normalize(b))
          .reduce((acc: Raw, b: Raw) => this.mergeObjects(acc, b, 'any'));
        return this.compile(this.applyJsonLeaves(merged, m.json_leaves), undefined, nextStack);
      }
      return this.compileKeyed(branches, m, nextStack);
    }
    if (s.type === 'array') {
      return { k: 'list', items: this.compile(s.items, s['x-tf-union-override'], nextStack) };
    }
    if (s.properties) {
      const props: Prop[] = [];
      for (const [name, pr] of Object.entries(s.properties as Record<string, Raw>)) {
        const p = this.resolve(pr);
        if (p['x-tf-omit']) continue;
        const node = this.compile(pr, p['x-tf-union-override'], nextStack);
        const isPropLeaf = node.k === 'json' && !node.attribute;
        props.push({
          apiName: name,
          tfName: isPropLeaf ? p['x-tf-json-name'] ?? `${name}_json` : name,
          node,
          required: (s.required ?? []).includes(name),
          flatten: !!p['x-tf-flatten'],
        });
      }
      return { k: 'object', props };
    }
    if (s.type === 'object') return { k: 'json' }; // free-form object
    return { k: 'prim', type: this.primType(s) };
  }

  compileKeyed(branches: Raw[], m: UnionMeta, stack: string[]): TNode {
    const disc = m.structural ? undefined : m.discriminator;
    const discOutside = m.discriminator_placement === 'outside';
    const byKey = new Map<string, { raws: Raw[]; values: string[]; match?: Raw; keepDisc: boolean; leaves: Raw }>();
    let outsideRaw: Raw | undefined;
    for (const b of branches) {
      const nb = this.normalize(b);
      const v = nb['x-tf-variant'] ?? {};
      if (v.omit) continue;
      const values = disc ? this.discValues(nb, disc) : [];
      const key: string =
        v.key ?? m.variant_keys?.[values[0]] ?? (m.key_template ?? '{value}').replace('{value}', values[0]);
      if (!key || key.includes('undefined')) throw new Error(`no variant key for branch ${nb.title}`);
      const keepDisc = !!v.keep_discriminator;
      const { [disc ?? '']: _d, ...restProps } = nb.properties ?? {};
      let content: Raw;
      if (m.content) {
        content = nb.properties[m.content];
        const { [m.content]: _c, ...outsideProps } = restProps;
        outsideRaw ??= { type: 'object', properties: outsideProps, required: nb.required ?? [] };
      } else {
        content = { ...nb, properties: keepDisc ? nb.properties : restProps };
      }
      const entry = byKey.get(key) ?? { raws: [], values: [], keepDisc, leaves: {}, match: v.match };
      entry.raws.push(content);
      entry.values.push(...values);
      Object.assign(entry.leaves, v.json_leaves ?? {});
      byKey.set(key, entry);
    }
    const variants: Variant[] = [...byKey.entries()].map(([key, e]) => {
      let raw = e.raws[0];
      if (e.raws.length > 1) {
        raw = e.raws.map((r) => this.normalize(r)).reduce((a, b) => this.mergeObjects(a, b, 'any'));
      }
      if (Object.keys(e.leaves).length) raw = this.applyJsonLeaves(raw, e.leaves);
      return { key, values: e.values, match: e.match, keepDisc: e.keepDisc, content: this.compile(raw, undefined, stack) };
    });
    const outsideNode = outsideRaw ? this.compile(outsideRaw, undefined, stack) : undefined;
    return {
      k: 'keyed',
      m,
      disc,
      discOutside,
      outside: outsideNode?.k === 'object' ? outsideNode.props : [],
      variants,
    };
  }
}
