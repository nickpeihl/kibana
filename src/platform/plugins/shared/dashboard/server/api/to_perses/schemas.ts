/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import { schema } from '@kbn/config-schema';
import { persesDashboardSchema } from './perses_dashboard_schema';
import { persesWarningsSchema } from './warnings_schema';

export const toPersesRequestQuerySchema = schema.object({
  project: schema.string(),
  elasticsearch_url: schema.maybe(schema.uri({ scheme: ['http', 'https'] })),
});

export const toPersesResponseBodySchema = schema.object({
  data: persesDashboardSchema,
  warnings: schema.maybe(persesWarningsSchema),
});
