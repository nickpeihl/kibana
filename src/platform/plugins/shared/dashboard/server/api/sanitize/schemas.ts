/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import { z } from '@kbn/zod';
import { getDashboardStateSchema } from '../dashboard_state_schemas';
import { warningsSchema } from '../warnings_schema';

const relatedItemSchema = z
  .object({
    type: z.string().meta({ description: 'Saved object type of the related item.' }),
    id: z.string().meta({ description: 'Saved object id of the related item.' }),
  })
  .strict();

export function getSanitizeResponseBodySchema() {
  return z
    .object({
      data: getDashboardStateSchema(false),
      warnings: warningsSchema.optional(),
      related_items: z
        .array(relatedItemSchema)
        .max(100)
        .optional()
        .meta({
          description:
            'Related saved objects discovered during sanitization that are not inlined in the export JSON.',
        }),
    })
    .strict();
}
