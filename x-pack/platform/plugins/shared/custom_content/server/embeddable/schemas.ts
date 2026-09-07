/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { z } from '@kbn/zod/v4';
import type { AggregateQuery, Filter, Query } from '@kbn/es-query';
import { serializedTitlesSchema } from '@kbn/presentation-publishing-schemas';
import { customContentStateSchema } from '@kbn/custom-content-common';

export const customContentEmbeddableSchema = z.object({
  ...customContentStateSchema.shape,
  ...serializedTitlesSchema.shape,
  // Panel-level filters set via the Settings flyout. Stored opaquely; validated on the client.
  filters: z.custom<Filter[]>().optional(),
  query: z.custom<Query | AggregateQuery>().optional(),
});

export type CustomContentEmbeddableState = z.output<typeof customContentEmbeddableSchema>;
