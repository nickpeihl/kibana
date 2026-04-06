/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import type { DashboardState } from '../types';
import { toPersesDashboard } from './to_perses';

const toPersesEmbeddable = (
  type: string,
  state: unknown,
  options?: { datasourceName?: string }
): { panel: unknown } | { error: string } => {
  if (!state || typeof state !== 'object') {
    return { error: `Panel type "${type}" is not supported and was dropped.` };
  }

  if (type === 'markdown') {
    if ('ref_id' in state) return { error: 'Markdown panel is by-reference and was dropped.' };
    const content = (state as any).content;
    return {
      panel: {
        kind: 'Panel',
        spec: {
          display: {
            ...(typeof (state as any).title === 'string'
              ? { name: (state as any).title }
              : undefined),
            ...(typeof (state as any).description === 'string'
              ? { description: (state as any).description }
              : undefined),
          },
          plugin: {
            kind: 'Markdown',
            spec: { text: content },
          },
        },
      },
    };
  }

  if (type === 'lens') {
    if ('ref_id' in state) return { error: 'Lens panel is by-reference and was dropped.' };
    const attributes = (state as any).attributes;
    if (!attributes) return { error: 'Lens panel is missing attributes and was dropped.' };

    const queries: string[] = [];
    if (attributes.type === 'xy') {
      for (const layer of attributes.layers ?? []) {
        if (layer.dataset?.type === 'esql') queries.push(layer.dataset.query);
      }
    } else if (attributes.dataset?.type === 'esql') {
      queries.push(attributes.dataset.query);
    }

    const uniqueQueries = Array.from(new Set(queries)).filter(Boolean);
    if (uniqueQueries.length === 0) return { error: 'Lens panel is not ES|QL and was dropped.' };

    const pluginKind =
      attributes.type === 'xy'
        ? 'TimeSeriesChart'
        : attributes.type === 'data_table'
        ? 'Table'
        : attributes.type === 'metric' || attributes.type === 'legacy_metric'
        ? 'StatChart'
        : attributes.type === 'gauge'
        ? 'GaugeChart'
        : undefined;
    if (!pluginKind)
      return { error: `Lens chart type "${attributes.type}" is not supported and was dropped.` };

    const datasource =
      options?.datasourceName != null
        ? { kind: 'ElasticsearchDatasource', name: options.datasourceName }
        : undefined;

    return {
      panel: {
        kind: 'Panel',
        spec: {
          display: {
            ...(typeof (state as any).title === 'string'
              ? { name: (state as any).title }
              : undefined),
          },
          plugin:
            pluginKind === 'StatChart' || pluginKind === 'GaugeChart'
              ? { kind: pluginKind, spec: { calculation: 'last' } }
              : { kind: pluginKind, spec: {} },
          queries: uniqueQueries.map((query) => ({
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
  }

  return { error: `Panel type "${type}" is not supported and was dropped.` };
};

const baseDashboardState = (): DashboardState =>
  ({
    title: 'My Dashboard',
    description: 'My Description',
    options: {
      hide_panel_titles: false,
      hide_panel_borders: false,
      use_margins: true,
      auto_apply_filters: true,
      sync_colors: false,
      sync_cursor: true,
      sync_tooltips: false,
    },
    pinned_panels: [],
    panels: [],
  } as unknown as DashboardState);

describe('toPersesDashboard', () => {
  it('maps top-level panels into the first layout', () => {
    const kibanaDashboardState = baseDashboardState();
    kibanaDashboardState.panels = [
      {
        type: 'markdown',
        uid: 'a',
        grid: { x: 1, y: 2, w: 3, h: 4 },
        config: { content: '# Hello', title: 'MD' },
      },
    ] as unknown as DashboardState['panels'];

    const result = toPersesDashboard({
      kibanaDashboardState,
      project: 'proj',
      resolvedElasticsearchUrl: 'https://es.example.com',
      toPersesEmbeddable,
    });

    expect(Object.keys(result.data.spec.panels)).toEqual(['panel_1']);
    expect(result.data.spec.layouts).toHaveLength(1);
    expect(result.data.spec.layouts[0].spec.display).toBeUndefined();
    expect(result.data.spec.layouts[0].spec.items).toEqual([
      {
        x: 1,
        y: 2,
        width: 3,
        height: 4,
        content: { $ref: '#/spec/panels/panel_1' },
      },
    ]);
  });

  it('creates one layout per section sorted by section.grid.y', () => {
    const kibanaDashboardState = baseDashboardState();
    kibanaDashboardState.panels = [
      {
        title: 'Section B',
        collapsed: true,
        uid: 'sec_b',
        grid: { y: 10 },
        panels: [
          {
            type: 'markdown',
            uid: 'b1',
            grid: { x: 0, y: 0, w: 6, h: 7 },
            config: { content: 'b1' },
          },
        ],
      },
      {
        title: 'Section A',
        collapsed: false,
        uid: 'sec_a',
        grid: { y: 5 },
        panels: [
          {
            type: 'markdown',
            uid: 'a1',
            grid: { x: 2, y: 3, w: 4, h: 5 },
            config: { content: 'a1' },
          },
        ],
      },
    ] as unknown as DashboardState['panels'];

    const result = toPersesDashboard({
      kibanaDashboardState,
      project: 'proj',
      resolvedElasticsearchUrl: 'https://es.example.com',
      toPersesEmbeddable,
    });

    // 0 = top-level layout, 1..n = section layouts
    expect(result.data.spec.layouts).toHaveLength(3);
    expect(result.data.spec.layouts[1].spec.display?.title).toBe('Section A');
    expect(result.data.spec.layouts[1].spec.display?.collapse.open).toBe(true);
    expect(result.data.spec.layouts[1].spec.items[0].x).toBe(2);
    expect(result.data.spec.layouts[1].spec.items[0].y).toBe(3);

    expect(result.data.spec.layouts[2].spec.display?.title).toBe('Section B');
    expect(result.data.spec.layouts[2].spec.display?.collapse.open).toBe(false);
  });

  it('converts markdown panels to Perses Markdown', () => {
    const kibanaDashboardState = baseDashboardState();
    kibanaDashboardState.panels = [
      {
        type: 'markdown',
        uid: 'a',
        grid: { x: 0, y: 0, w: 12, h: 6 },
        config: { content: '*hi*', title: 'MD title', description: 'MD desc' },
      },
    ] as unknown as DashboardState['panels'];

    const result = toPersesDashboard({
      kibanaDashboardState,
      project: 'proj',
      toPersesEmbeddable,
    });

    expect(result.data.spec.panels.panel_1).toEqual({
      kind: 'Panel',
      spec: {
        display: {
          name: 'MD title',
          description: 'MD desc',
        },
        plugin: {
          kind: 'Markdown',
          spec: { text: '*hi*' },
        },
      },
    });
  });

  it('drops by-reference Lens panels', () => {
    const kibanaDashboardState = baseDashboardState();
    kibanaDashboardState.panels = [
      {
        type: 'lens',
        uid: 'a',
        grid: { x: 0, y: 0, w: 12, h: 6 },
        config: { ref_id: 'lens-1' },
      },
    ] as unknown as DashboardState['panels'];

    const result = toPersesDashboard({
      kibanaDashboardState,
      project: 'proj',
      toPersesEmbeddable,
    });

    expect(Object.keys(result.data.spec.panels)).toEqual([]);
    expect(result.warnings?.some((w) => w.type === 'dropped_panel')).toBe(true);
  });

  it('drops non-ES|QL Lens panels', () => {
    const kibanaDashboardState = baseDashboardState();
    kibanaDashboardState.panels = [
      {
        type: 'lens',
        uid: 'a',
        grid: { x: 0, y: 0, w: 12, h: 6 },
        config: {
          title: 'Lens',
          attributes: {
            type: 'metric',
            dataset: { type: 'dataView', id: 'dv' },
          },
        },
      },
    ] as unknown as DashboardState['panels'];

    const result = toPersesDashboard({
      kibanaDashboardState,
      project: 'proj',
      toPersesEmbeddable,
    });

    expect(Object.keys(result.data.spec.panels)).toEqual([]);
    expect(result.warnings?.some((w) => w.type === 'dropped_panel')).toBe(true);
  });

  it('converts ES|QL Lens XY/table/metric/gauge panels and emits multiple query entries', () => {
    const kibanaDashboardState = baseDashboardState();
    kibanaDashboardState.panels = [
      {
        type: 'lens',
        uid: 'xy',
        grid: { x: 0, y: 0, w: 6, h: 6 },
        config: {
          title: 'XY',
          attributes: {
            type: 'xy',
            layers: [
              { dataset: { type: 'esql', query: 'FROM a | STATS count = count()' } },
              { dataset: { type: 'esql', query: 'FROM b | STATS count = count()' } },
            ],
          },
        },
      },
      {
        type: 'lens',
        uid: 'table',
        grid: { x: 6, y: 0, w: 6, h: 6 },
        config: {
          title: 'Table',
          attributes: {
            type: 'data_table',
            dataset: { type: 'esql', query: 'FROM c' },
          },
        },
      },
      {
        type: 'lens',
        uid: 'metric',
        grid: { x: 0, y: 6, w: 6, h: 6 },
        config: {
          title: 'Metric',
          attributes: {
            type: 'metric',
            dataset: { type: 'esql', query: 'FROM d' },
          },
        },
      },
      {
        type: 'lens',
        uid: 'gauge',
        grid: { x: 6, y: 6, w: 6, h: 6 },
        config: {
          title: 'Gauge',
          attributes: {
            type: 'gauge',
            dataset: { type: 'esql', query: 'FROM e' },
          },
        },
      },
    ] as unknown as DashboardState['panels'];

    const result = toPersesDashboard({
      kibanaDashboardState,
      project: 'proj',
      resolvedElasticsearchUrl: 'https://es.example.com',
      toPersesEmbeddable,
    });

    expect(Object.keys(result.data.spec.panels)).toEqual([
      'panel_1',
      'panel_2',
      'panel_3',
      'panel_4',
    ]);

    expect(result.data.spec.panels.panel_1.spec.plugin.kind).toBe('TimeSeriesChart');
    expect(result.data.spec.panels.panel_1.spec.queries).toHaveLength(2);

    expect(result.data.spec.panels.panel_2.spec.plugin.kind).toBe('Table');
    expect(result.data.spec.panels.panel_2.spec.queries).toHaveLength(1);

    expect(result.data.spec.panels.panel_3.spec.plugin.kind).toBe('StatChart');
    expect(result.data.spec.panels.panel_3.spec.plugin.spec).toEqual({ calculation: 'last' });

    expect(result.data.spec.panels.panel_4.spec.plugin.kind).toBe('GaugeChart');
    expect(result.data.spec.panels.panel_4.spec.plugin.spec).toEqual({ calculation: 'last' });

    // datasource selector is present when resolvedElasticsearchUrl exists
    expect(
      result.data.spec.panels.panel_2.spec.queries?.[0].spec.plugin.spec.datasource?.name
    ).toBe('elasticsearch');
    expect(result.data.spec.datasources?.elasticsearch.plugin.spec.directUrl).toBe(
      'https://es.example.com'
    );
  });

  it('omits datasource details and returns a queries_omitted warning when no elasticsearch_url is resolved', () => {
    const kibanaDashboardState = baseDashboardState();
    kibanaDashboardState.panels = [
      {
        type: 'markdown',
        uid: 'a',
        grid: { x: 0, y: 0, w: 12, h: 6 },
        config: { content: 'hi' },
      },
    ] as unknown as DashboardState['panels'];

    const result = toPersesDashboard({
      kibanaDashboardState,
      project: 'proj',
      toPersesEmbeddable,
    });

    expect(result.data.spec.panels.panel_1.spec.display?.name).toBe('panel_1');
    expect(result.data.spec.datasources).toBeUndefined();
    expect(result.warnings?.some((w) => w.type === 'queries_omitted')).toBe(true);
  });

  it('adds queries_omitted warning when dashboard-level query or filters exist', () => {
    const kibanaDashboardState = baseDashboardState();
    kibanaDashboardState.query = {
      language: 'kuery',
      query: 'x:1',
    } as unknown as DashboardState['query'];
    kibanaDashboardState.filters = [
      {
        meta: { disabled: false },
      },
    ] as unknown as DashboardState['filters'];

    const result = toPersesDashboard({
      kibanaDashboardState,
      project: 'proj',
      toPersesEmbeddable,
    });

    expect(result.warnings?.some((w) => w.type === 'queries_omitted')).toBe(true);
  });
});
