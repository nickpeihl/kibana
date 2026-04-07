/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

// Conversion functions
export { fromStoredFilter, fromStoredFilters } from './from_stored_filter';
export { toStoredFilter, toStoredFilters } from './to_stored_filter';

// Type guards for filter detection
export {
  isConditionFilter,
  isGroupFilter,
  isDSLFilter,
  isRangeConditionFilter,
  isAsCodeFilter,
} from './type_guards';

// Error class
export { FilterConversionError } from './errors';

// Types
export type { StoredFilter } from './types';
