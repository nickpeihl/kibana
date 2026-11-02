/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

// PROTOTYPE (dashboards-tf spike A). Typed Terraform variant-mapping metadata for `.meta()`.
// Nothing in the OAS converter needs changing: z.toJSONSchema() already copies every `.meta()` key into the JSON
// schema, and @kbn/router-to-openapispec, @kbn/openapi-bundler, the bump overlays and `redocly bundle` keep `x-` keys.
// This file only adds type checking (without it `.meta()` accepts any key as `unknown`).

/** Maps one union to Terraform variant keys. */
export interface TfUnionMeta {
  /** Property whose literal value identifies the variant (with or without an OAS discriminator). */
  discriminator?: string;
  /** Value to assume when the discriminator property is absent (Zod preprocess defaults). */
  default_value?: string;
  /** Variant key naming convention; `{value}` is the discriminator value. Default `{value}`. */
  key_template?: string;
  /** Exceptions to `key_template`, by discriminator value. */
  variant_keys?: Record<string, string>;
  /** `drop` (default): the discriminator is not a Terraform attribute. `outside`: kept beside the variant keys. */
  discriminator_placement?: 'drop' | 'outside';
  /** The variant body is this property of the branch; the branch's other properties stay beside the variant keys. */
  content?: string;
  /** Mutual-exclusion validator emitted over the variant keys. Default `exactly_one_of`. */
  exclusivity?: 'exactly_one_of' | 'conflicts_with';
  /** An extra JSON-string variant key allowed for the listed discriminator values. */
  extra_json_variant?: { key: string; values: string[] };
  /** No discriminator: each branch carries `x-tf-variant.match`; first match wins. */
  structural?: boolean;
  /** No variant keys: all branches are merged into one object. */
  merge?: boolean;
  /** Property paths (`a`, `a[]`, `a[].b`) of the merged object that become JSON-string attributes. */
  json_leaves?: Record<string, string>;
}

/** Per-branch settings of a union. */
export interface TfVariantMeta {
  key?: string;
  match?: { present: string } | { absent: string };
  omit?: true;
  keep_discriminator?: true;
  json_leaves?: Record<string, string>;
}

declare module 'zod/v4/core' {
  interface GlobalMeta {
    'x-tf-union'?: TfUnionMeta;
    /** Use-site override, merged over the `x-tf-union` of the union this array/optional wraps. */
    'x-tf-union-override'?: Partial<TfUnionMeta>;
    'x-tf-variant'?: TfVariantMeta;
    /** `true`: property `p` becomes JSON-string `p_json`. `{ attribute }`: the value becomes `{ [attribute]: json }`. */
    'x-tf-json-leaf'?: true | { attribute: string };
    /** Hoist this object's properties into the parent Terraform object. */
    'x-tf-flatten'?: true;
    /** API-only; not a Terraform attribute. */
    'x-tf-omit'?: true;
  }
}
