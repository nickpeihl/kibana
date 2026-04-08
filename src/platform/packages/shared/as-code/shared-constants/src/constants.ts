/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

/**
 * As Code Filter operator constants
 * These operators are used in SimpleFilterCondition to specify how to match field values
 */
export const ASCODE_FILTER_OPERATOR = {
  IS: 'is',
  IS_ONE_OF: 'is_one_of',
  EXISTS: 'exists',
  RANGE: 'range',
} as const;

export const ASCODE_GROUPED_CONDITION_TYPE = {
  AND: 'and',
  OR: 'or',
} as const;

export const ASCODE_FILTER_TYPE = {
  CONDITION: 'condition',
  GROUP: 'group',
  DSL: 'dsl',
  SPATIAL: 'spatial',
} as const;

/** `type` discriminator for as-code classic-tab `data_source`: saved Kibana data view id. */
export const AS_CODE_DATA_VIEW_REFERENCE_TYPE = 'data_view_reference' as const;

/** `type` discriminator for as-code classic-tab `data_source`: inline DataViewSpec-shaped fields. */
export const AS_CODE_DATA_VIEW_SPEC_TYPE = 'data_view_spec' as const;

/**
 * Runtime field constants used by the as-code data view runtime field schema and transforms.
 *
 * Note: These values should remain aligned with the runtime field types supported by data views.
 */
export const RUNTIME_FIELD_COMPOSITE_TYPE = 'composite' as const;

export const PRIMITIVE_RUNTIME_FIELD_TYPES = [
  'keyword',
  'long',
  'double',
  'date',
  'ip',
  'boolean',
  'geo_point',
] as const;
