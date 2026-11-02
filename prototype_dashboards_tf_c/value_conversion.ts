// PROTOTYPE (spike C). Value conversion, API JSON <-> Terraform-shaped JSON, driven by the same TF plan that
// produced the derived schema (source schema + tf_shape_mapping.ts). It does NOT read the derived schema: the
// derived schema has no record of where a value came from in the API, so it cannot drive the rewrite alone.
//
// In Kibana this falls out as a function (`toTerraformShape` / `fromTerraformShape`), which could back an export
// API (e.g. GET /api/dashboards/{id}?shape=terraform) so the provider never needs the mapping.
import type { Plan, Field } from './monomorphize.ts';

const fail = (at: string, msg: string): never => {
  throw new Error(`${at || '<root>'}: ${msg}`);
};

export const toTf = (p: Plan, v: any, at = ''): any => {
  if (v === undefined) return undefined;
  switch (p.k) {
    case 'prim':
      if (typeof v === 'object' && v !== null) fail(at, `expected ${p.t}, got object`);
      return v;
    case 'json':
      return JSON.stringify(v);
    case 'opaque':
      return v;
    case 'arr':
      if (!Array.isArray(v)) fail(at, 'expected array');
      return v.map((x: any, i: number) => (p.wrap ? { [p.wrap]: JSON.stringify(x) } : toTf(p.items, x, `${at}[${i}]`)));
    case 'map':
      return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, toTf(p.values, x, `${at}{${k}}`)]));
    case 'obj':
      return objToTf(p.fields, v, at);
    case 'variants': {
      const { rule, disc } = p;
      const label = String(rule.recognize ? rule.recognize(v) : v?.[disc]);
      const variant = p.variants.find((x) => !x.json && x.labels.includes(label));
      if (!variant) return fail(at, `no variant key for "${label}" (dropped or unknown)`);
      const out: any = {};
      for (const h of p.hoisted) if (v[h.api] !== undefined) out[h.tf] = toTf(h.plan, v[h.api], `${at}.${h.api}`);
      let content: any;
      if (rule.content) {
        const extra = Object.keys(v).filter((k) => k !== rule.content && !p.hoisted.some((h) => h.api === k));
        if (extra.length) fail(at, `keys not in schema: ${extra}`);
        content = v[rule.content];
      } else {
        const drop = new Set([...p.hoisted.map((h) => h.api), ...(variant.omitDisc ? [disc] : [])]);
        content = Object.fromEntries(Object.entries(v).filter(([k]) => !drop.has(k)));
      }
      out[variant.key] = toTf(variant.plan, content, `${at}.${variant.key}`);
      return out;
    }
  }
};

const objToTf = (fields: Field[], v: any, at: string) => {
  if (typeof v !== 'object' || v === null || Array.isArray(v)) fail(at, 'expected object');
  const out: any = {};
  const used = new Set<string>();
  for (const f of fields) {
    const x = v[f.api];
    if (x === undefined) continue;
    used.add(f.api);
    const fat = at ? `${at}.${f.api}` : f.api;
    if (f.flatten) Object.assign(out, toTf(f.plan, x, fat));
    else if (f.split) {
      const sections = x.filter((i: any) => f.split!.recognize(i) === 'section');
      out[f.tf] = toTf(f.plan, x.filter((i: any) => f.split!.recognize(i) !== 'section'), fat);
      if (sections.length) out[f.split.into] = toTf(f.split.plan, sections, f.split.into);
    } else out[f.tf] = toTf(f.plan, x, fat);
  }
  const unknown = Object.keys(v).filter((k) => !used.has(k));
  if (unknown.length) fail(at, `keys not in schema (would be lost): ${unknown}`);
  return out;
};

export const fromTf = (p: Plan, t: any, at = ''): any => {
  if (t === undefined || t === null) return undefined;
  switch (p.k) {
    case 'prim':
    case 'opaque':
      return t;
    case 'json':
      return JSON.parse(t);
    case 'arr':
      return t.map((x: any, i: number) => (p.wrap ? JSON.parse(x[p.wrap]) : fromTf(p.items, x, `${at}[${i}]`)));
    case 'map':
      return Object.fromEntries(Object.entries(t).map(([k, x]) => [k, fromTf(p.values, x, `${at}{${k}}`)]));
    case 'obj':
      return objFromTf(p.fields, t, at).api;
    case 'variants': {
      const present = p.variants.filter((x) => t[x.key] !== undefined && t[x.key] !== null);
      if (present.length !== 1) fail(at, `expected exactly one of ${p.variants.map((x) => x.key)}, got ${present.map((x) => x.key)}`);
      const [variant] = present;
      const api: any = {};
      for (const h of p.hoisted) if (t[h.tf] !== undefined) api[h.api] = fromTf(h.plan, t[h.tf], `${at}.${h.tf}`);
      const content = fromTf(variant.plan, t[variant.key], `${at}.${variant.key}`);
      if (p.rule.content) api[p.rule.content] = content;
      else Object.assign(api, content);
      if (variant.omitDisc) {
        if (variant.labels.length !== 1) fail(at, `cannot restore ${p.disc} for ${variant.key}: labels ${variant.labels}`);
        api[p.disc] = variant.labels[0];
      }
      return api;
    }
  }
};

const objFromTf = (fields: Field[], t: any, at: string): { api: any; used: Set<string> } => {
  const api: any = {};
  const used = new Set<string>();
  for (const f of fields) {
    if (f.flatten) {
      const inner = objFromTf((f.plan as Extract<Plan, { k: 'obj' }>).fields, t, at);
      inner.used.forEach((k) => used.add(k));
      if (Object.keys(inner.api).length) api[f.api] = inner.api;
      continue;
    }
    if (f.split) {
      const panels = t[f.tf] === undefined ? undefined : fromTf(f.plan, t[f.tf], f.tf);
      const sections = t[f.split.into] === undefined ? undefined : fromTf(f.split.plan, t[f.split.into], f.split.into);
      used.add(f.tf).add(f.split.into);
      // Baseline order: all top-level panels first, then all sections.
      if (panels || sections) api[f.api] = [...(panels ?? []), ...(sections ?? [])];
      continue;
    }
    used.add(f.tf);
    if (t[f.tf] !== undefined) api[f.api] = fromTf(f.plan, t[f.tf], at ? `${at}.${f.tf}` : f.tf);
  }
  return { api, used };
};

// Terraform JSON syntax: every string is a template.
const mapStrings = (v: any, fn: (s: string) => string): any =>
  typeof v === 'string'
    ? fn(v)
    : Array.isArray(v)
      ? v.map((x) => mapStrings(x, fn))
      : v && typeof v === 'object'
        ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, mapStrings(x, fn)]))
        : v;
// (Function replacers: in a replacement *string*, `$$` means a single `$`.)
export const escapeTemplates = (v: any) =>
  mapStrings(v, (s) => s.replace(/\$\{/g, () => '$${').replace(/%\{/g, () => '%%{'));
export const unescapeTemplates = (v: any) =>
  mapStrings(v, (s) => s.replace(/\$\$\{/g, () => '${').replace(/%%\{/g, () => '%{'));

export const toTfJson = (plan: Plan, dashboard: any, name: string) => ({
  resource: { elasticstack_kibana_dashboard: { [name]: escapeTemplates(toTf(plan, dashboard)) } },
});
export const fromTfJson = (plan: Plan, tfJson: any, name: string) =>
  fromTf(plan, unescapeTemplates(tfJson.resource.elasticstack_kibana_dashboard[name]));
