/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import { z } from '@kbn/zod';
import { asCodeFilterSchema } from '@kbn/as-code-filters-schema';

// Inlined from @kbn/as-code-shared-schemas to avoid a circular project-reference through @kbn/core.
const panelQuerySchema = z
  .object({
    expression: z.string(),
    language: z.enum(['kql', 'lucene']),
  })
  .strict();

export const serializedPanelFiltersSchema = z
  .object({
    filters: z.array(asCodeFilterSchema).optional().meta({
      description: 'Panel-level filters applied in addition to any dashboard-level filters.',
    }),
    query: panelQuerySchema
      .optional()
      .meta({ description: 'Panel-level query applied in addition to any dashboard-level query.' }),
  })
  .strict();
