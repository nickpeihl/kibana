/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import type { TypeOf } from '@kbn/config-schema';
import type { DashboardPanel, DashboardSection, DashboardState } from '../types';
import type { persesDashboardSchema } from './perses_dashboard_schema';
import type { persesWarningsSchema } from './warnings_schema';

export type PersesDashboard = TypeOf<typeof persesDashboardSchema>;
export type PersesWarning = TypeOf<typeof persesWarningsSchema>[number];
type PersesPanel = PersesDashboard['spec']['panels'][string];
type PersesLayoutItem = PersesDashboard['spec']['layouts'][number]['spec']['items'][number];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function tryGetKibanaPanelTitle(kibanaPanel: DashboardPanel): string | undefined {
  const config = kibanaPanel.config as unknown;
  if (!isRecord(config)) return;

  const directTitle = typeof config.title === 'string' ? config.title.trim() : '';
  if (directTitle) return directTitle;

  const attributes = config.attributes;
  if (isRecord(attributes)) {
    const attributesTitle = typeof attributes.title === 'string' ? attributes.title.trim() : '';
    if (attributesTitle) return attributesTitle;
  }

  return;
}

function ensurePanelHasDisplayName(
  panel: PersesPanel,
  params: { kibanaPanel: DashboardPanel; panelKey: string }
) {
  const existingName =
    typeof panel.spec.display?.name === 'string' ? panel.spec.display.name.trim() : undefined;
  if (existingName) return;

  const kibanaTitle = tryGetKibanaPanelTitle(params.kibanaPanel);
  const name = kibanaTitle ?? params.panelKey;

  panel.spec.display = {
    ...(panel.spec.display ?? {}),
    name,
  };
}

export interface ToPersesDashboardParams {
  kibanaDashboardState: DashboardState;
  project: string;
  resolvedElasticsearchUrl?: string;
  toPersesEmbeddable?: (
    type: string,
    state: unknown,
    options?: {
      datasourceName?: string;
    }
  ) => { panel: unknown } | { error: string };
}

export interface ToPersesDashboardResult {
  data: PersesDashboard;
  warnings?: PersesWarning[];
}

function slugifyDashboardName(title: string): string {
  const slug = title
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-_]/g, '')
    .replace(/-+/g, '-')
    .replace(/^[-_]+|[-_]+$/g, '');

  return slug.length ? slug : 'dashboard';
}

function msToDuration(ms: number): string {
  if (ms % 3600000 === 0) return `${ms / 3600000}h`;
  if (ms % 60000 === 0) return `${ms / 60000}m`;
  if (ms % 1000 === 0) return `${ms / 1000}s`;
  return `${ms}ms`;
}

function tryGetRelativeDuration(timeRange: DashboardState['time_range']): string | undefined {
  const from = timeRange?.from;
  const to = timeRange?.to;
  if (typeof from !== 'string' || typeof to !== 'string') return;
  if (to !== 'now') return;

  const match = from.match(/^now-(\d+)(ms|s|m|h|d|w)$/);
  if (!match) return;

  return `${match[1]}${match[2]}`;
}

function createDroppedPanelWarning(
  panelType: string,
  panelConfig: unknown,
  message: string
): PersesWarning {
  return {
    type: 'dropped_panel',
    panel_type: panelType,
    panel_config: panelConfig as object,
    message,
  };
}

function createQueriesOmittedWarning(message: string): PersesWarning {
  return {
    type: 'queries_omitted',
    message,
  };
}

function isDashboardSection(
  panelOrSection: DashboardPanel | DashboardSection
): panelOrSection is DashboardSection {
  return 'panels' in panelOrSection && Array.isArray(panelOrSection.panels);
}

function createPanelRef(panelKey: string): string {
  return `#/spec/panels/${panelKey}`;
}

export function toPersesDashboard({
  kibanaDashboardState,
  project,
  resolvedElasticsearchUrl,
  toPersesEmbeddable,
}: ToPersesDashboardParams): ToPersesDashboardResult {
  const warnings: PersesWarning[] = [];
  const queriesOmittedMessages: string[] = [];

  const { title, description } = kibanaDashboardState;

  if (kibanaDashboardState.query || (kibanaDashboardState.filters?.length ?? 0) > 0) {
    queriesOmittedMessages.push('Kibana dashboard-level query and/or filters were omitted.');
  }
  if ((kibanaDashboardState.pinned_panels?.length ?? 0) > 0) {
    queriesOmittedMessages.push('Kibana pinned panels were omitted.');
  }

  const duration = tryGetRelativeDuration(kibanaDashboardState.time_range);
  if (kibanaDashboardState.time_range && duration === undefined) {
    queriesOmittedMessages.push(
      'Kibana time range could not be converted to a Perses duration and was omitted.'
    );
  }

  const refreshInterval =
    kibanaDashboardState.refresh_interval?.pause === false &&
    typeof kibanaDashboardState.refresh_interval.value === 'number'
      ? msToDuration(kibanaDashboardState.refresh_interval.value)
      : undefined;

  if (!resolvedElasticsearchUrl) {
    queriesOmittedMessages.push(
      'Elasticsearch datasource details were omitted because no elasticsearch_url was provided and core.elasticsearch.publicBaseUrl was not configured.'
    );
  }

  for (const message of queriesOmittedMessages) {
    warnings.push(createQueriesOmittedWarning(message));
  }

  const panels: PersesDashboard['spec']['panels'] = {};
  const layouts: PersesDashboard['spec']['layouts'] = [];
  let panelCounter = 0;

  const addPanel = (panel: PersesPanel): string => {
    panelCounter += 1;
    const key = `panel_${panelCounter}`;
    panels[key] = panel;
    return key;
  };

  const hasDatasource =
    typeof resolvedElasticsearchUrl === 'string' && resolvedElasticsearchUrl.length > 0;
  const datasources = hasDatasource
    ? {
        elasticsearch: {
          default: true,
          plugin: {
            kind: 'ElasticsearchDatasource' as const,
            spec: {
              directUrl: resolvedElasticsearchUrl,
            },
          },
        },
      }
    : undefined;

  const createPanelFromKibanaPanel = (
    kibanaPanel: DashboardPanel
  ): { panelKey: string; panel: PersesPanel } | undefined => {
    const { type, config } = kibanaPanel;

    if (!toPersesEmbeddable) {
      warnings.push(
        createDroppedPanelWarning(
          type,
          config,
          `Panel type "${type}" is not supported and was dropped.`
        )
      );
      return;
    }

    const result = toPersesEmbeddable(type, config, {
      datasourceName: hasDatasource ? 'elasticsearch' : undefined,
    });

    if ('error' in result) {
      warnings.push(createDroppedPanelWarning(type, config, result.error));
      return;
    }

    const panel = result.panel as PersesPanel;
    const panelKey = addPanel(panel);
    ensurePanelHasDisplayName(panel, { kibanaPanel, panelKey });
    return { panelKey, panel };
  };

  const addGridItem = (
    items: PersesLayoutItem[],
    grid: DashboardPanel['grid'],
    panelKey: string
  ) => {
    items.push({
      x: grid.x,
      y: grid.y,
      width: grid.w,
      height: grid.h,
      content: {
        $ref: createPanelRef(panelKey),
      },
    });
  };

  const topLevelItems: PersesLayoutItem[] = [];
  const sections: DashboardSection[] = [];

  for (const entry of kibanaDashboardState.panels ?? []) {
    if (isDashboardSection(entry)) {
      sections.push(entry);
      continue;
    }

    const converted = createPanelFromKibanaPanel(entry);
    if (!converted) continue;
    addGridItem(topLevelItems, entry.grid, converted.panelKey);
  }

  layouts.push({
    kind: 'Grid' as const,
    spec: {
      items: topLevelItems,
    },
  });

  const sortedSections = [...sections].sort((a, b) => a.grid.y - b.grid.y);
  for (const section of sortedSections) {
    const items: PersesLayoutItem[] = [];

    for (const panel of section.panels) {
      const converted = createPanelFromKibanaPanel(panel);
      if (!converted) continue;
      addGridItem(items, panel.grid, converted.panelKey);
    }

    layouts.push({
      kind: 'Grid' as const,
      spec: {
        display: {
          title: section.title,
          collapse: {
            open: !section.collapsed,
          },
        },
        items,
      },
    });
  }

  const data: PersesDashboard = {
    kind: 'Dashboard',
    metadata: {
      project,
      name: slugifyDashboardName(title),
    },
    spec: {
      display: {
        name: title,
        ...(description ? { description } : undefined),
      },
      ...(duration ? { duration } : undefined),
      ...(refreshInterval ? { refreshInterval } : undefined),
      ...(datasources ? { datasources } : undefined),
      panels,
      layouts,
    },
  };

  return {
    data,
    ...(warnings.length ? { warnings } : undefined),
  };
}
