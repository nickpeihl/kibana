/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import { BehaviorSubject } from 'rxjs';
import { coreMock } from '@kbn/core/public/mocks';
import { SavedObjectNotFound } from '@kbn/kibana-utils-plugin/public';
import type { VisualizeApi } from '@kbn/visualizations-plugin/public';
import type { SerializedVis } from '@kbn/visualizations-plugin/common';
import { editLegacyVegaByReference } from './edit_legacy_vega_by_reference';
import { openVegaLibraryEditor } from './open_vega_library_editor';

const mockGet = jest.fn();
jest.mock('./vega_library_client', () => ({
  createVegaLibraryClient: () => ({ get: mockGet }),
}));
jest.mock('./open_vega_library_editor', () => ({ openVegaLibraryEditor: jest.fn() }));

const deps = {} as Parameters<typeof editLegacyVegaByReference>[1];

const createParentApi = () => ({
  addNewPanel: jest.fn(),
  removePanel: jest.fn(),
  replacePanel: jest.fn().mockResolvedValue('new-panel'),
  getChildApi: jest.fn(),
  children$: new BehaviorSubject({}),
});

const createApi = ({
  parentApi = createParentApi() as unknown,
  state = {},
}: { parentApi?: unknown; state?: object } = {}) =>
  ({
    uuid: 'panel-1',
    parentApi,
    serializeState: () => ({
      savedObjectId: 'legacy-id',
      title: 'Legacy Vega',
      description: 'Panel description',
      hide_title: true,
      time_range: { from: 'now-15m', to: 'now' },
      uiState: { vis: {} },
      drilldowns: [
        { label: 'Filter', trigger: 'on_apply_filter', type: 'dashboard_drilldown' },
        { label: 'Range', trigger: 'on_select_range', type: 'url_drilldown' },
      ],
      ...state,
    }),
    getVis: () => ({
      title: 'Legacy Vega',
      description: 'Vis description',
      serialize: (): SerializedVis => ({
        title: 'Legacy Vega',
        type: 'vega',
        params: { spec: '{ mark: point }' },
        data: {
          aggs: [],
          searchSource: { query: { query: 'status:200', language: 'kuery' }, filter: [] },
        },
      }),
    }),
  } as unknown as VisualizeApi);

const expectedPanelState = (refId: string) => ({
  description: 'Panel description',
  hide_title: true,
  time_range: { from: 'now-15m', to: 'now' },
  drilldowns: [{ label: 'Filter', trigger: 'on_apply_filter', type: 'dashboard_drilldown' }],
  ref_id: refId,
});

describe('editLegacyVegaByReference', () => {
  const core = coreMock.createStart();

  beforeEach(() => {
    jest.clearAllMocks();
    mockGet.mockRejectedValue(new SavedObjectNotFound({ type: 'vega', id: 'legacy-id' }));
  });

  test('leaves panels outside of a container that can replace panels to the Visualize app', async () => {
    const api = createApi({ parentApi: {} });

    await expect(editLegacyVegaByReference(core, deps, api)).resolves.toBe(false);
    expect(openVegaLibraryEditor).not.toHaveBeenCalled();
  });

  test('leaves by-value panels to the Visualize app', async () => {
    const api = createApi({ state: { savedObjectId: undefined } });

    await expect(editLegacyVegaByReference(core, deps, api)).resolves.toBe(false);
    expect(openVegaLibraryEditor).not.toHaveBeenCalled();
  });

  test('creates a library item with the visualization id and links the panel to it', async () => {
    jest.mocked(openVegaLibraryEditor).mockResolvedValue({ id: 'legacy-id', title: 'Saved' });
    const parentApi = createParentApi();

    await expect(editLegacyVegaByReference(core, deps, createApi({ parentApi }))).resolves.toBe(
      true
    );

    expect(mockGet).toHaveBeenCalledWith('legacy-id');
    expect(openVegaLibraryEditor).toHaveBeenCalledWith({
      core,
      deps,
      id: 'legacy-id',
      data: {
        title: 'Legacy Vega',
        description: 'Vis description',
        tags: [],
        spec: { format: 'hjson', value: '{ mark: point }' },
        query: { expression: 'status:200', language: 'kql' },
      },
    });
    expect(parentApi.replacePanel).toHaveBeenCalledWith('panel-1', {
      panelType: 'vega',
      serializedState: expectedPanelState('legacy-id'),
    });
  });

  test('keeps the legacy panel when the editor closes without saving', async () => {
    jest.mocked(openVegaLibraryEditor).mockResolvedValue(undefined);
    const parentApi = createParentApi();

    await expect(editLegacyVegaByReference(core, deps, createApi({ parentApi }))).resolves.toBe(
      true
    );

    expect(parentApi.replacePanel).not.toHaveBeenCalled();
  });

  test('links an item that an earlier conversion created, then edits it', async () => {
    mockGet.mockResolvedValue({ id: 'legacy-id', data: {} });
    const onEdit = jest.fn();
    const parentApi = createParentApi();
    parentApi.getChildApi.mockResolvedValue({
      onEdit,
      isEditingEnabled: () => true,
      getTypeDisplayName: () => 'Vega',
    });

    await expect(editLegacyVegaByReference(core, deps, createApi({ parentApi }))).resolves.toBe(
      true
    );

    expect(parentApi.replacePanel).toHaveBeenCalledWith('panel-1', {
      panelType: 'vega',
      serializedState: expectedPanelState('legacy-id'),
    });
    expect(parentApi.getChildApi).toHaveBeenCalledWith('new-panel');
    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(openVegaLibraryEditor).not.toHaveBeenCalled();
  });

  test('creates an item with a new id when the visualization id is not a valid item id', async () => {
    jest.mocked(openVegaLibraryEditor).mockResolvedValue({ id: 'generated', title: 'Saved' });
    const parentApi = createParentApi();

    await editLegacyVegaByReference(
      core,
      deps,
      createApi({ parentApi, state: { savedObjectId: 'Legacy:Vega' } })
    );

    expect(mockGet).not.toHaveBeenCalled();
    expect(openVegaLibraryEditor).toHaveBeenCalledWith(expect.objectContaining({ id: undefined }));
    expect(parentApi.replacePanel).toHaveBeenCalledWith('panel-1', {
      panelType: 'vega',
      serializedState: expectedPanelState('generated'),
    });
  });

  test('fails when it cannot check for an existing item', async () => {
    mockGet.mockRejectedValue(new Error('Forbidden'));

    await expect(editLegacyVegaByReference(core, deps, createApi())).rejects.toThrow('Forbidden');
    expect(openVegaLibraryEditor).not.toHaveBeenCalled();
  });
});
