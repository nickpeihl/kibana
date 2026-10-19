/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import { isPlainObject } from 'lodash';
import { fromStoredFilters } from '@kbn/as-code-filters-transforms';
import { toAsCodeQuery } from '@kbn/as-code-shared-transforms';
import { isOfQueryType } from '@kbn/es-query';
import type { SerializedVis } from '@kbn/visualizations-plugin/common';
import type { VegaByValueState } from '../server/embeddable/schema';

const getStandaloneVegaSpec = (spec: string): VegaByValueState['spec'] => {
  try {
    const parsedSpec: unknown = JSON.parse(spec);
    if (isPlainObject(parsedSpec)) {
      return { format: 'json', value: parsedSpec as Record<string, unknown> };
    }
  } catch {
    // The legacy editor treated specs that do not parse as strict JSON as HJSON.
  }
  return { format: 'hjson', value: spec };
};

/** Converts a legacy Vega visualization's spec, query and filters to their `vega` form. */
export const fromLegacyVegaVis = (
  savedVis: SerializedVis
): Pick<VegaByValueState, 'spec' | 'query' | 'filters'> => {
  const { spec } = savedVis.params;
  if (typeof spec !== 'string') {
    throw new Error('Vega visualization is missing spec');
  }

  const { query, filter } = savedVis.data.searchSource;
  const asCodeQuery = isOfQueryType(query) ? toAsCodeQuery(query) : undefined;
  const filters = fromStoredFilters(filter);

  return {
    ...(asCodeQuery?.expression && { query: asCodeQuery }),
    ...(filters?.length && { filters }),
    spec: getStandaloneVegaSpec(spec),
  };
};
