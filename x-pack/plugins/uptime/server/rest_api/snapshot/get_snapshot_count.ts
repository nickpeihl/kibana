/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { schema } from '@kbn/config-schema';
import { UMServerLibs } from '../../lib/lib';
import { UMRestApiRouteFactory } from '../types';
import { API_URLS } from '../../../../../legacy/plugins/uptime/common/constants/rest_api';

export const createGetSnapshotCount: UMRestApiRouteFactory = (libs: UMServerLibs) => ({
  method: 'GET',
  path: API_URLS.SNAPSHOT_COUNT,
  validate: {
    query: schema.object({
      dateRangeStart: schema.string(),
      dateRangeEnd: schema.string(),
      filters: schema.maybe(schema.string()),
      statusFilter: schema.maybe(schema.string()),
    }),
  },
  options: {
    tags: ['access:uptime'],
  },
  handler: async ({ callES }, _context, request, response): Promise<any> => {
    const { dateRangeStart, dateRangeEnd, filters, statusFilter } = request.query;
    const result = await libs.requests.getSnapshotCount({
      callES,
      dateRangeStart,
      dateRangeEnd,
      filters,
      statusFilter,
    });
    return response.ok({
      body: {
        ...result,
      },
    });
  },
});
