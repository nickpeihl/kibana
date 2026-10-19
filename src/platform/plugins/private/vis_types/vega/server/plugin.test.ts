/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import { BehaviorSubject } from 'rxjs';
import { coreMock } from '@kbn/core/server/mocks';
import {
  createEmbeddableSetupMock,
  mockGetDrilldownsSchema,
} from '@kbn/embeddable-plugin/server/mocks';
import type { SerializedVis } from '@kbn/visualizations-plugin/common';
import { VisTypeVegaPlugin } from './plugin';
import { VEGA_EMBEDDABLE_TYPE } from '../common/constants';

describe('VisTypeVegaPlugin (server)', () => {
  const plugins: VisTypeVegaPlugin[] = [];

  const setupPlugin = ({ legacyVegaPanelMigrationEnabled = false } = {}) => {
    const coreSetup = coreMock.createSetup();
    const coreStart = coreMock.createStart();
    const migrationFlag$ = new BehaviorSubject(legacyVegaPanelMigrationEnabled);
    coreStart.featureFlags.getBooleanValue$.mockReturnValue(migrationFlag$);
    const embeddable = createEmbeddableSetupMock();
    const visualizations = {
      registerReadOnlyVisType: jest.fn(),
      registerLegacyPanelMigration: jest.fn(),
    };

    const plugin = new VisTypeVegaPlugin(coreMock.createPluginInitializerContext());
    plugins.push(plugin);
    plugin.setup(coreSetup, { embeddable, visualizations });
    plugin.start(coreStart);

    return { embeddable, visualizations, migrationFlag$ };
  };

  afterEach(() => {
    plugins.splice(0).forEach((plugin) => plugin.stop());
  });

  test('registers a server definition for vega', () => {
    const { embeddable } = setupPlugin();

    expect(embeddable.registerEmbeddableServerDefinition).toHaveBeenCalledTimes(1);
    expect(embeddable.registerEmbeddableServerDefinition).toHaveBeenCalledWith(
      VEGA_EMBEDDABLE_TYPE,
      expect.any(Object)
    );
  });

  test('exposes a schema for by-value and by-reference panels', () => {
    const { embeddable } = setupPlugin();

    const [, serverDefinition] = embeddable.registerEmbeddableServerDefinition.mock.calls[0];
    const schema = serverDefinition.getSchema(mockGetDrilldownsSchema);
    expect(schema).toBeDefined();

    const validSpec = { format: 'hjson', value: '{ mark: point }' };
    const parsed = schema!.parse({ spec: validSpec, unknown_key: 'ignored' });
    expect(parsed.spec).toEqual(validSpec);
    expect(parsed).not.toHaveProperty('unknown_key');

    const query = { language: 'kql', expression: 'bytes > 1000' };
    expect(schema!.parse({ ref_id: 'library-item', query })).toEqual({
      ref_id: 'library-item',
      query,
    });

    expect(() => schema!.parse({})).toThrow();
    expect(() => schema!.parse({ spec: 123 })).toThrow();
    expect(() => schema!.parse({ spec: '' })).toThrow();
    expect(() => schema!.parse({ spec: { format: 'hjson', value: '' } })).toThrow();
    expect(() => schema!.parse({ spec: { format: 'json', value: 'not-an-object' } })).toThrow();
  });

  test('registers a legacy Vega panel migration that follows the dynamic migration flag', () => {
    const { visualizations, migrationFlag$ } = setupPlugin();
    expect(visualizations.registerLegacyPanelMigration).toHaveBeenCalledWith('vega', {
      to: VEGA_EMBEDDABLE_TYPE,
      migrate: expect.any(Function),
    });
    const { migrate } = visualizations.registerLegacyPanelMigration.mock.calls[0][1];
    const args = {
      savedVis: {
        title: 'Legacy Vega',
        type: 'vega',
        params: { spec: '{ mark: point }' },
        data: { aggs: [], searchSource: {} },
      } as SerializedVis,
      panelConfig: {},
    };

    expect(migrate(args)).toBeUndefined();

    migrationFlag$.next(true);
    expect(migrate(args)).toEqual({
      title: 'Legacy Vega',
      description: undefined,
      spec: { format: 'hjson', value: '{ mark: point }' },
    });
  });
});
