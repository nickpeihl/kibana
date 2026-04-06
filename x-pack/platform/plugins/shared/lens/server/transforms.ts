/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import {
  lensApiStateSchema,
  type LensApiSchemaType,
  type LensConfigBuilder,
} from '@kbn/lens-embeddable-utils';
import type { LensSerializedAPIConfig } from '@kbn/lens-common-2';

import { schema } from '@kbn/config-schema';
import type { EmbeddableSetup, GetDrilldownsSchemaFnType } from '@kbn/embeddable-plugin/server';
import {
  serializedTimeRangeSchema,
  serializedTitlesSchema,
} from '@kbn/presentation-publishing-schemas';
import { referencesSchema } from '@kbn/content-management-utils';
import {
  ON_CLICK_VALUE,
  ON_SELECT_RANGE,
  ON_CLICK_ROW,
  ON_APPLY_FILTER,
  ON_OPEN_PANEL_MENU,
} from '@kbn/ui-actions-plugin/common/trigger_ids';
import { BY_REF_SCHEMA_META, BY_VALUE_SCHEMA_META } from '@kbn/presentation-publishing-schemas';
import { isByRefLensConfig } from '../common/transforms/utils';
import { LENS_EMBEDDABLE_TYPE } from '../common/constants';
import { getTransformIn } from '../common/transforms/transform_in';
import { getTransformOut } from '../common/transforms/transform_out';
import type { LensTransforms } from '../common/transforms/types';

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

/**
 * Triggers that Lens visualizations support, derived from visualization definitions:
 * - ON_CLICK_VALUE: VIS_EVENT_TO_TRIGGER.filter (all visualizations)
 * - ON_SELECT_RANGE: VIS_EVENT_TO_TRIGGER.brush (xy, heatmap)
 * - ON_CLICK_ROW: VIS_EVENT_TO_TRIGGER.tableRowContextMenuClick (datatable)
 * - ON_APPLY_FILTER: VIS_EVENT_TO_TRIGGER.applyFilter (all visualizations)
 * - ON_OPEN_PANEL_MENU: VIS_EVENT_TO_TRIGGER.openPanelMenu (all visualizations)
 */
const LENS_SUPPORTED_DRILLDOWN_TRIGGERS = [
  ON_CLICK_VALUE,
  ON_SELECT_RANGE,
  ON_CLICK_ROW,
  ON_APPLY_FILTER,
  ON_OPEN_PANEL_MENU,
];

export function registerLensEmbeddableTransforms(
  embeddableSetup: EmbeddableSetup,
  builder: LensConfigBuilder
) {
  embeddableSetup.registerTransforms(LENS_EMBEDDABLE_TYPE, {
    getTransforms: (drilldownTransforms) =>
      ({
        transformIn: getTransformIn(builder, drilldownTransforms.transformIn, false),
        transformOut: getTransformOut(builder, drilldownTransforms.transformOut, false),
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
      return getLensPanelSchema(getDrilldownsSchema);
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

const getSharedPanelSchema = (getDrilldownsSchema: GetDrilldownsSchemaFnType) => ({
  references: schema.maybe(referencesSchema),
  ...serializedTimeRangeSchema.getPropSchemas(),
  ...serializedTitlesSchema.getPropSchemas(),
  ...getDrilldownsSchema(LENS_SUPPORTED_DRILLDOWN_TRIGGERS).getPropSchemas(),
});

const getLensByValuePanelSchema = (getDrilldownsSchema: GetDrilldownsSchemaFnType) =>
  schema.object(
    {
      attributes: lensApiStateSchema,
      ...getSharedPanelSchema(getDrilldownsSchema),
    },
    {
      meta: BY_VALUE_SCHEMA_META,
    }
  );

const getLensByRefPanelSchema = (getDrilldownsSchema: GetDrilldownsSchemaFnType) =>
  schema.object(
    {
      ref_id: schema.string(),
      ...getSharedPanelSchema(getDrilldownsSchema),
    },
    {
      meta: BY_REF_SCHEMA_META,
    }
  );

export const getLensPanelSchema = (getDrilldownsSchema: GetDrilldownsSchemaFnType) =>
  schema.oneOf(
    [getLensByValuePanelSchema(getDrilldownsSchema), getLensByRefPanelSchema(getDrilldownsSchema)],
    {
      meta: {
        description: 'Lens embeddable schema',
      },
    }
  );
