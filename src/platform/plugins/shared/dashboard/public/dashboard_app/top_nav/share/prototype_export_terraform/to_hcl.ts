/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

// PROTOTYPE (dashboards-tf flyout). Minimal tf.json -> HCL printer. The dashboard resource uses nested
// attributes only (no blocks), so every object prints as `name = { ... }`. Input strings are already
// Terraform-template-escaped (`$${`, `%%{`) by the converter.

type Json = any;

const IDENT = /^[A-Za-z_][A-Za-z0-9_-]*$/;
const quote = (s: string) =>
  `"${s.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t')}"`;
const isSimple = (x: Json) =>
  typeof x !== 'object' || x === null || (Array.isArray(x) ? x.every((y) => typeof y !== 'object' || y === null) : !Object.keys(x).length);
const key = (k: string) => (IDENT.test(k) ? k : quote(k));

/** A string attribute holding a JSON object/array: printed as `jsonencode(...)` like the provider's docs. */
const asJsonLeaf = (s: string): Json | undefined => {
  if (!/^[[{]/.test(s)) return undefined;
  try {
    const v = JSON.parse(s);
    return v && typeof v === 'object' ? v : undefined;
  } catch {
    return undefined;
  }
};

const value = (v: Json, indent: string, jsonencode: boolean, inJson = false): string => {
  const next = indent + '  ';
  if (v === null) return 'null';
  if (typeof v === 'string') {
    const leaf = !inJson && jsonencode ? asJsonLeaf(v) : undefined;
    return leaf ? `jsonencode(${value(leaf, indent, jsonencode, true)})` : quote(v);
  }
  if (typeof v !== 'object') return String(v);
  if (Array.isArray(v)) {
    if (!v.length) return '[]';
    if (v.every((x) => typeof x !== 'object' || x === null)) return `[${v.map((x) => value(x, indent, jsonencode, inJson)).join(', ')}]`;
    return `[\n${v.map((x) => `${next}${value(x, next, jsonencode, inJson)}`).join(',\n')},\n${indent}]`;
  }
  const entries = Object.entries(v);
  if (!entries.length) return '{}';
  const width = Math.max(...entries.filter(([, x]) => isSimple(x)).map(([k]) => key(k).length), 0);
  return `{\n${entries
    .map(([k, x]) => {
      const simple = isSimple(x);
      return `${next}${simple ? key(k).padEnd(width) : key(k)} = ${value(x, next, jsonencode, inJson)}`;
    })
    .join('\n')}\n${indent}}`;
};

export const resourceToHcl = (type: string, name: string, body: Json, jsonencode = true) =>
  `resource "${type}" "${name}" ${value(body, '', jsonencode)}\n`;

export const tfJsonToHcl = (tfJson: Json, jsonencode = true) =>
  Object.entries(tfJson.resource ?? {})
    .flatMap(([type, byName]) =>
      Object.entries(byName as Json).map(([name, body]) => resourceToHcl(type, name, body, jsonencode))
    )
    .join('\n');
