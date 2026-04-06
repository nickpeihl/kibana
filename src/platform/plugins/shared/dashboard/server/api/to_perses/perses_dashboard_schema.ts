/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import { schema } from '@kbn/config-schema';

const displaySchema = schema.object({
  name: schema.maybe(schema.string()),
  description: schema.maybe(schema.string()),
});

const gridLayoutDisplaySchema = schema.object({
  title: schema.string(),
  collapse: schema.object({
    open: schema.boolean(),
  }),
});

const gridItemSchema = schema.object({
  x: schema.number(),
  y: schema.number(),
  width: schema.number(),
  height: schema.number(),
  content: schema.object({
    $ref: schema.string(),
  }),
});

const gridLayoutSchema = schema.object({
  kind: schema.literal('Grid'),
  spec: schema.object({
    display: schema.maybe(gridLayoutDisplaySchema),
    items: schema.arrayOf(gridItemSchema, { defaultValue: [] }),
  }),
});

const elasticsearchDatasourceSelectorSchema = schema.object({
  kind: schema.literal('ElasticsearchDatasource'),
  name: schema.maybe(schema.string()),
});

const elasticsearchEsqlQueryPluginSchema = schema.object({
  kind: schema.literal('ElasticsearchESQLQuery'),
  spec: schema.object({
    query: schema.string(),
    datasource: schema.maybe(elasticsearchDatasourceSelectorSchema),
  }),
});

const timeSeriesQuerySchema = schema.object({
  kind: schema.literal('TimeSeriesQuery'),
  spec: schema.object({
    plugin: elasticsearchEsqlQueryPluginSchema,
  }),
});

const panelPluginSchema = schema.oneOf([
  schema.object({
    kind: schema.literal('Markdown'),
    spec: schema.object({
      text: schema.string(),
    }),
  }),
  schema.object({
    kind: schema.literal('TimeSeriesChart'),
    spec: schema.object({}),
  }),
  schema.object({
    kind: schema.literal('Table'),
    spec: schema.object({}),
  }),
  schema.object({
    kind: schema.literal('StatChart'),
    spec: schema.object({
      calculation: schema.literal('last'),
    }),
  }),
  schema.object({
    kind: schema.literal('GaugeChart'),
    spec: schema.object({
      calculation: schema.literal('last'),
    }),
  }),
]);

const panelSchema = schema.object({
  kind: schema.literal('Panel'),
  spec: schema.object({
    display: displaySchema,
    plugin: panelPluginSchema,
    queries: schema.maybe(schema.arrayOf(timeSeriesQuerySchema)),
  }),
});

const elasticsearchDatasourceSchema = schema.object({
  default: schema.maybe(schema.boolean()),
  display: schema.maybe(displaySchema),
  plugin: schema.object({
    kind: schema.literal('ElasticsearchDatasource'),
    spec: schema.object({
      directUrl: schema.uri({ scheme: ['http', 'https'] }),
    }),
  }),
});

export const persesDashboardSchema = schema.object({
  kind: schema.literal('Dashboard'),
  metadata: schema.object({
    name: schema.string(),
    project: schema.string(),
  }),
  spec: schema.object({
    display: schema.maybe(displaySchema),
    duration: schema.maybe(schema.string()),
    refreshInterval: schema.maybe(schema.string()),
    datasources: schema.maybe(schema.recordOf(schema.string(), elasticsearchDatasourceSchema)),
    panels: schema.recordOf(schema.string(), panelSchema),
    layouts: schema.arrayOf(gridLayoutSchema),
  }),
});
