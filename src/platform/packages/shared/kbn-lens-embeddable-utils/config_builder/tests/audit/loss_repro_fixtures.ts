/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import { LegendLayout } from '@kbn/chart-expressions-common';
import type {
  DateHistogramIndexPatternColumn,
  HeatmapVisualizationState,
  LensPartitionVisualizationState,
  TermsIndexPatternColumn,
  XYVisualizationState,
} from '@kbn/lens-common';

import type { LensAttributes } from '../../types';
import { simple as simpleHeatmap } from '../heatmap/dsl.mocks';
import { pieLegacyBasicState } from '../partition/lens_state_config.mock';

export const HIDDEN_AXIS_TITLE = 'Hidden custom axis title';
export const HIDDEN_LEGEND_TITLE = 'Hidden custom series title';
export const DORMANT_MAX_LINES = 4;

const DATA_LAYER_ID = 'data_layer';
const X_COLUMN_ID = 'x';
const Y_COLUMN_ID = 'y';
const BREAKDOWN_COLUMN_ID = 'breakdown';
const EMPTY_REFERENCE_LAYER_ID = 'empty_reference_layer';

export const createMinimalXYAttributes = (): LensAttributes => ({
  visualizationType: 'lnsXY',
  title: 'Lens API format audit',
  state: {
    datasourceStates: {
      formBased: {
        layers: {
          [DATA_LAYER_ID]: {
            columnOrder: [X_COLUMN_ID, Y_COLUMN_ID],
            columns: {
              [X_COLUMN_ID]: {
                isBucketed: true,
                dataType: 'date',
                label: '@timestamp',
                operationType: 'date_histogram',
                sourceField: '@timestamp',
                params: { interval: 'auto' },
              } as DateHistogramIndexPatternColumn,
              [Y_COLUMN_ID]: {
                isBucketed: false,
                dataType: 'number',
                operationType: 'count',
                sourceField: '___records___',
                label: 'Count of records',
              },
            },
          },
        },
      },
    },
    visualization: {
      layers: [
        {
          accessors: [Y_COLUMN_ID],
          isHistogram: true,
          layerId: DATA_LAYER_ID,
          layerType: 'data',
          seriesType: 'line',
          xAccessor: X_COLUMN_ID,
          yConfig: [{ axisMode: 'left', forAccessor: Y_COLUMN_ID }],
        },
      ],
      legend: {
        isVisible: true,
        position: 'right',
      },
      preferredSeriesType: 'line',
    },
    filters: [],
    query: {
      query: '',
      language: 'kuery',
    },
  },
  references: [
    {
      id: 'logs-*',
      name: `indexpattern-datasource-layer-${DATA_LAYER_ID}`,
      type: 'index-pattern',
    },
  ],
});

const getXYVisualization = (attributes: LensAttributes): XYVisualizationState =>
  attributes.state.visualization as XYVisualizationState;

export const createHiddenAxisTitleXYAttributes = (): LensAttributes => {
  const attributes = createMinimalXYAttributes();
  const visualization = getXYVisualization(attributes);
  visualization.axisTitlesVisibilitySettings = { x: true, yLeft: false, yRight: true };
  visualization.yTitle = HIDDEN_AXIS_TITLE;
  return attributes;
};

export const createHiddenLegendTitleXYAttributes = (): LensAttributes => {
  const attributes = createMinimalXYAttributes();
  const visualization = getXYVisualization(attributes);
  visualization.legend = {
    ...visualization.legend,
    isTitleVisible: false,
    title: HIDDEN_LEGEND_TITLE,
  };
  return attributes;
};

export const createHorizontalListLegendXYAttributes = (): LensAttributes => {
  const attributes = createMinimalXYAttributes();
  const visualization = getXYVisualization(attributes);
  visualization.legend = {
    ...visualization.legend,
    layout: LegendLayout.List,
    maxLines: DORMANT_MAX_LINES,
    position: 'bottom',
    shouldTruncate: false,
  };
  return attributes;
};

export const createHeatmapWithDormantLegendTruncation = (): LensAttributes => {
  const attributes = structuredClone(simpleHeatmap);
  const visualization = attributes.state.visualization as HeatmapVisualizationState;
  visualization.legend = {
    ...visualization.legend,
    maxLines: DORMANT_MAX_LINES,
    shouldTruncate: false,
  };
  return attributes;
};

export const createPartitionWithDormantLegendTruncation = (): LensAttributes => {
  const attributes = structuredClone(pieLegacyBasicState);
  const visualization = attributes.state.visualization as LensPartitionVisualizationState;
  visualization.layers[0].legendMaxLines = DORMANT_MAX_LINES;
  visualization.layers[0].truncateLegend = false;
  return attributes;
};

export const createLegacyUnstackedXYAttributes = (): LensAttributes => {
  const attributes = createMinimalXYAttributes();
  const visualization = getXYVisualization(attributes);

  // This value exists in shipped saved objects but is outside the current persisted-state type.
  Object.assign(visualization.layers[0], { seriesType: 'area_unstacked' });
  return attributes;
};

export const createXYWithEmptyReferenceLine = (): LensAttributes => {
  const attributes = createMinimalXYAttributes();
  const formBased = attributes.state.datasourceStates.formBased;
  if (!formBased) {
    throw new Error('Expected a form-based datasource');
  }

  formBased.layers[EMPTY_REFERENCE_LAYER_ID] = {
    columnOrder: [],
    columns: {},
  };
  getXYVisualization(attributes).layers.push({
    accessors: [],
    layerId: EMPTY_REFERENCE_LAYER_ID,
    layerType: 'referenceLine',
    yConfig: [],
  });
  attributes.references.push({
    id: 'logs-*',
    name: `indexpattern-datasource-layer-${EMPTY_REFERENCE_LAYER_ID}`,
    type: 'index-pattern',
  });
  return attributes;
};

export const createXYWithStringTermsLimit = (): LensAttributes => {
  const attributes = createMinimalXYAttributes();
  const formBased = attributes.state.datasourceStates.formBased;
  if (!formBased) {
    throw new Error('Expected a form-based datasource');
  }

  const layer = formBased.layers[DATA_LAYER_ID];
  const breakdownColumn: TermsIndexPatternColumn = {
    dataType: 'string',
    isBucketed: true,
    label: 'Top values',
    operationType: 'terms',
    params: {
      missingBucket: false,
      orderBy: { columnId: Y_COLUMN_ID, type: 'column' },
      orderDirection: 'desc',
      otherBucket: false,
      size: 50,
    },
    sourceField: 'service.name',
  };

  // This string value is present in a shipped integration panel but is outside the current type.
  Object.assign(breakdownColumn.params, { size: '50' });
  layer.columns[BREAKDOWN_COLUMN_ID] = breakdownColumn;
  layer.columnOrder.splice(1, 0, BREAKDOWN_COLUMN_ID);

  const dataLayer = getXYVisualization(attributes).layers[0];
  if (dataLayer.layerType !== 'data') {
    throw new Error('Expected an XY data layer');
  }
  dataLayer.splitAccessors = [BREAKDOWN_COLUMN_ID];
  return attributes;
};
