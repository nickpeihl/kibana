/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import type { LegacyPanelMigration } from '@kbn/visualizations-plugin/server';
import { fromLegacyVegaVis } from '../../common/from_legacy_vega_vis';
import type { VegaByValueState } from '../embeddable/schema';

/** Converts a by-value legacy Vega visualization panel to a standalone `vega` panel. */
export const migrateLegacyVegaPanel = ({
  savedVis,
  panelConfig,
}: Parameters<LegacyPanelMigration['migrate']>[0]): VegaByValueState => ({
  ...panelConfig,
  title: panelConfig.title ?? savedVis.title,
  description: panelConfig.description ?? savedVis.description,
  ...fromLegacyVegaVis(savedVis),
});
