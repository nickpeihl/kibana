/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { LensConfigBuilder } from '@kbn/lens-embeddable-utils';
import { lensApiStateSchema } from '@kbn/lens-embeddable-utils';
import type { LensSerializedAPIConfig } from '@kbn/lens-common-2';

import type { EmbeddableSetup } from '@kbn/embeddable-plugin/server';
import type { LensApiSchemaType } from '@kbn/lens-embeddable-utils';
import { isByRefLensConfig } from '../common/transforms/utils';
import { LENS_DASHBOARD_APP_TYPE } from '../common/constants';
import { getTransformIn } from '../common/transforms/transform_in';
import { getTransformOut } from '../common/transforms/transform_out';
import type { LensTransforms } from '../common/transforms/types';
import { getLensPanelSchema } from './transforms';

// Keep this in x-pack Lens plugin: it's Lens-specific export logic.
function extractEsqlQueries(attributes: LensApiSchemaType): string[] {
  const queries: string[] = [];

  if (attributes.type === 'xy') {
    for (const layer of attributes.layers) {
      if (!('dataset' in layer)) continue;
      const dataset = layer.dataset;
      if (!dataset || dataset.type !== 'esql') continue;
      const query = dataset.query;
      if (typeof query === 'string' && query) {
        queries.push(query);
      }
    }
  } else if ('dataset' in attributes && attributes.dataset?.type === 'esql') {
    const query = attributes.dataset.query;
    if (typeof query === 'string' && query) {
      queries.push(query);
    }
  }

  return Array.from(new Set(queries));
}

function getPersesPanelPlugin(attributes: LensApiSchemaType) {
  switch (attributes.type) {
    case 'xy':
      return { kind: 'TimeSeriesChart', spec: {} };
    case 'data_table':
      return { kind: 'Table', spec: {} };
    case 'metric':
    case 'legacy_metric':
      return { kind: 'StatChart', spec: { calculation: 'last' } };
    case 'gauge':
      return { kind: 'GaugeChart', spec: { calculation: 'last' } };
    default:
      return;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function registerLensEmbeddableTransformsForDashboardApp(
  embeddableSetup: EmbeddableSetup,
  builder: LensConfigBuilder
) {
  embeddableSetup.registerTransforms(LENS_DASHBOARD_APP_TYPE, {
    getTransforms: (drilldownTransforms) =>
      ({
        transformIn: getTransformIn(builder, drilldownTransforms.transformIn, true),
        transformOut: getTransformOut(builder, drilldownTransforms.transformOut, true),
        toPerses: (state: unknown, options?: { datasourceName?: string }) => {
          if (!isRecord(state)) {
            return { error: 'Lens panel config is invalid and was dropped.' };
          }

          if (typeof state.ref_id === 'string') {
            return { error: 'Lens panel is by-reference and was dropped.' };
          }

          if (!('attributes' in state)) {
            return { error: 'Lens panel is missing attributes and was dropped.' };
          }

          let attributes: LensApiSchemaType;
          try {
            attributes = lensApiStateSchema.validate(state.attributes);
          } catch {
            return { error: 'Lens panel attributes are invalid and were dropped.' };
          }

          const queries = extractEsqlQueries(attributes);
          if (queries.length === 0) {
            return { error: 'Lens panel is not ES|QL and was dropped.' };
          }

          const plugin = getPersesPanelPlugin(attributes);
          if (!plugin) {
            return {
              error: `Lens chart type "${attributes.type}" is not supported and was dropped.`,
            };
          }

          const display = {
            ...(typeof state.title === 'string' && state.title.length
              ? { name: state.title }
              : undefined),
            ...(typeof state.description === 'string' && state.description.length
              ? { description: state.description }
              : undefined),
          };

          const datasource =
            options?.datasourceName != null
              ? { kind: 'ElasticsearchDatasource', name: options.datasourceName }
              : undefined;

          return {
            panel: {
              kind: 'Panel',
              spec: {
                display,
                plugin,
                queries: queries.map((query) => ({
                  kind: 'TimeSeriesQuery',
                  spec: {
                    plugin: {
                      kind: 'ElasticsearchESQLQuery',
                      spec: {
                        query,
                        ...(datasource ? { datasource } : undefined),
                      },
                    },
                  },
                })),
              },
            },
          };
        },
      } satisfies LensTransforms),
    getSchema: (getDrilldownsSchema) => {
      return builder.isEnabled ? getLensPanelSchema(getDrilldownsSchema) : undefined;
    },
    throwOnUnmappedPanel: (config: LensSerializedAPIConfig) => {
      if (isByRefLensConfig(config)) return;

      const chartType = builder.getType(config.attributes);

      if (builder.isEnabled && !builder.isSupported(chartType)) {
        throw new Error(`Lens "${chartType}" chart type is not supported`);
      }
    },
  });
}
