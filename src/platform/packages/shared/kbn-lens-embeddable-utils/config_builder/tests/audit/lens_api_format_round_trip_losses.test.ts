/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import type {
  HeatmapVisualizationState,
  LensPartitionVisualizationState,
  XYVisualizationState,
} from '@kbn/lens-common';

import { LensConfigBuilder } from '../../config_builder';
import { lensApiConfigSchema } from '../../schema';
import type { HeatmapConfig, PieConfig, XYConfig } from '../../schema';
import type { LensAttributes } from '../../types';
import {
  createHeatmapWithDormantLegendTruncation,
  createHiddenAxisTitleXYAttributes,
  createHiddenLegendTitleXYAttributes,
  createHorizontalListLegendXYAttributes,
  createLegacyUnstackedXYAttributes,
  createPartitionWithDormantLegendTruncation,
  createXYWithEmptyReferenceLine,
  createXYWithStringTermsLimit,
  DORMANT_MAX_LINES,
  HIDDEN_AXIS_TITLE,
  HIDDEN_LEGEND_TITLE,
} from './loss_repro_fixtures';

const builder = new LensConfigBuilder(undefined, true);

const toXYConfig = (attributes: LensAttributes): XYConfig => {
  const config = builder.toAPIFormat(attributes);
  if (config.type !== 'xy') {
    throw new Error(`Expected an XY config, received ${config.type}`);
  }
  return config;
};

const getXYVisualization = (attributes: LensAttributes): XYVisualizationState =>
  attributes.state.visualization as XYVisualizationState;

const setLeftAxisTitleVisibility = (attributes: LensAttributes, visible: boolean) => {
  const visualization = getXYVisualization(attributes);
  visualization.axisTitlesVisibilitySettings = {
    x: visualization.axisTitlesVisibilitySettings?.x ?? true,
    yLeft: visible,
    yRight: visualization.axisTitlesVisibilitySettings?.yRight ?? true,
  };
};

describe('Lens API format audit repros', () => {
  describe('legacy state to API to legacy state', () => {
    it('loses a custom XY axis title while that title is hidden', () => {
      const original = createHiddenAxisTitleXYAttributes();
      const apiConfig = toXYConfig(original);
      const roundTripped = builder.fromAPIFormat(apiConfig);

      expect(apiConfig.axis?.y?.title).toEqual({ visible: false });
      expect(getXYVisualization(original).yTitle).toBe(HIDDEN_AXIS_TITLE);
      expect(getXYVisualization(roundTripped).yTitle).toBeUndefined();

      setLeftAxisTitleVisibility(original, true);
      setLeftAxisTitleVisibility(roundTripped, true);

      expect(toXYConfig(original).axis?.y?.title?.text).toBe(HIDDEN_AXIS_TITLE);
      expect(toXYConfig(roundTripped).axis?.y?.title?.text).toBeUndefined();
    });

    it('loses a custom XY series header while that header is hidden', () => {
      const original = createHiddenLegendTitleXYAttributes();
      const apiConfig = toXYConfig(original);
      const roundTripped = builder.fromAPIFormat(apiConfig);

      expect(apiConfig.legend?.series_header).toEqual({ visible: false });
      expect(getXYVisualization(original).legend.title).toBe(HIDDEN_LEGEND_TITLE);
      expect(getXYVisualization(roundTripped).legend.title).toBeUndefined();

      getXYVisualization(original).legend.isTitleVisible = true;
      getXYVisualization(roundTripped).legend.isTitleVisible = true;

      expect(toXYConfig(original).legend?.series_header?.text).toBe(HIDDEN_LEGEND_TITLE);
      expect(toXYConfig(roundTripped).legend?.series_header?.text).toBeUndefined();
    });

    it('loses XY truncation preferences while a horizontal legend uses list layout', () => {
      const original = createHorizontalListLegendXYAttributes();
      const apiConfig = toXYConfig(original);
      const roundTripped = builder.fromAPIFormat(apiConfig);
      const originalLegend = getXYVisualization(original).legend;
      const roundTrippedLegend = getXYVisualization(roundTripped).legend;

      expect(apiConfig.legend?.layout).toEqual({ type: 'list' });
      expect(originalLegend).toMatchObject({
        maxLines: DORMANT_MAX_LINES,
        shouldTruncate: false,
      });
      expect(roundTrippedLegend.maxLines).toBeUndefined();
      expect(roundTrippedLegend.shouldTruncate).toBeUndefined();

      delete originalLegend.layout;
      delete roundTrippedLegend.layout;

      expect(toXYConfig(original).legend?.layout).toMatchObject({
        truncate: { enabled: false, max_lines: DORMANT_MAX_LINES },
        type: 'grid',
      });
      expect(toXYConfig(roundTripped).legend?.layout).toMatchObject({
        truncate: { max_lines: 1 },
        type: 'grid',
      });
    });

    it('loses a heatmap max-lines preference while truncation is disabled', () => {
      const original = createHeatmapWithDormantLegendTruncation();
      const apiConfig = builder.toAPIFormat(original) as HeatmapConfig;
      const roundTripped = builder.fromAPIFormat(apiConfig);
      const originalVisualization = original.state.visualization as HeatmapVisualizationState;
      const roundTrippedVisualization = roundTripped.state
        .visualization as HeatmapVisualizationState;

      expect(apiConfig.legend?.truncate_after_lines).toBeUndefined();
      expect(roundTrippedVisualization.legend.maxLines).toBeUndefined();

      originalVisualization.legend.shouldTruncate = true;
      roundTrippedVisualization.legend.shouldTruncate = true;

      expect((builder.toAPIFormat(original) as HeatmapConfig).legend?.truncate_after_lines).toBe(
        DORMANT_MAX_LINES
      );
      expect(
        (builder.toAPIFormat(roundTripped) as HeatmapConfig).legend?.truncate_after_lines
      ).toBe(1);
    });

    it('loses a partition max-lines preference while truncation is disabled', () => {
      const original = createPartitionWithDormantLegendTruncation();
      const apiConfig = builder.toAPIFormat(original) as PieConfig;
      const roundTripped = builder.fromAPIFormat(apiConfig);
      const originalVisualization = original.state.visualization as LensPartitionVisualizationState;
      const roundTrippedVisualization = roundTripped.state
        .visualization as LensPartitionVisualizationState;

      expect(apiConfig.legend?.truncate_after_lines).toBeUndefined();
      expect(roundTrippedVisualization.layers[0].legendMaxLines).toBeUndefined();

      originalVisualization.layers[0].truncateLegend = true;
      roundTrippedVisualization.layers[0].truncateLegend = true;

      expect((builder.toAPIFormat(original) as PieConfig).legend?.truncate_after_lines).toBe(
        DORMANT_MAX_LINES
      );
      expect((builder.toAPIFormat(roundTripped) as PieConfig).legend?.truncate_after_lines).toBe(1);
    });
  });

  describe('API to legacy state to API', () => {
    it('loses hidden XY axis title text allowed by the API schema', () => {
      const source = createHiddenAxisTitleXYAttributes();
      setLeftAxisTitleVisibility(source, true);
      const apiConfig = toXYConfig(source);
      if (!apiConfig.axis?.y?.title) {
        throw new Error('Expected a Y-axis title');
      }
      apiConfig.axis.y.title.visible = false;

      expect(lensApiConfigSchema.safeParse(apiConfig).success).toBe(true);
      const roundTripped = builder.toAPIFormat(builder.fromAPIFormat(apiConfig)) as XYConfig;

      expect(roundTripped.axis?.y?.title).toEqual({ visible: false });
      expect(roundTripped.axis?.y?.title?.text).toBeUndefined();
    });

    it('loses hidden XY series header text allowed by the API schema', () => {
      const source = createHiddenLegendTitleXYAttributes();
      getXYVisualization(source).legend.isTitleVisible = true;
      const apiConfig = toXYConfig(source);
      if (!apiConfig.legend?.series_header) {
        throw new Error('Expected a series header');
      }
      apiConfig.legend.series_header.visible = false;

      expect(lensApiConfigSchema.safeParse(apiConfig).success).toBe(true);
      const roundTripped = builder.toAPIFormat(builder.fromAPIFormat(apiConfig)) as XYConfig;

      expect(roundTripped.legend?.series_header).toEqual({ visible: false });
      expect(roundTripped.legend?.series_header?.text).toBeUndefined();
    });
  });

  describe('legacy states that produce schema-invalid API configs', () => {
    it('emits no layer type for the shipped legacy area_unstacked series type', () => {
      const apiConfig = toXYConfig(createLegacyUnstackedXYAttributes());

      expect(apiConfig.layers[0].type).toBeUndefined();
      expect(lensApiConfigSchema.safeParse(apiConfig).success).toBe(false);
    });

    it('emits an empty thresholds array for an empty reference-line editor layer', () => {
      const apiConfig = toXYConfig(createXYWithEmptyReferenceLine());
      const referenceLayer = apiConfig.layers.find((layer) => layer.type === 'reference_lines');

      expect(referenceLayer?.thresholds).toEqual([]);
      expect(lensApiConfigSchema.safeParse(apiConfig).success).toBe(false);
    });

    it('passes a shipped string terms size through to the numeric API limit', () => {
      const apiConfig = toXYConfig(createXYWithStringTermsLimit());
      const dataLayer = apiConfig.layers[0];
      if (!('breakdown_by' in dataLayer)) {
        throw new Error('Expected an XY data layer with a breakdown');
      }
      const breakdown = dataLayer.breakdown_by;
      if (!breakdown || !('limit' in breakdown)) {
        throw new Error('Expected a top-values breakdown');
      }

      expect(breakdown.limit).toBe('50');
      expect(lensApiConfigSchema.safeParse(apiConfig).success).toBe(false);
    });
  });
});
