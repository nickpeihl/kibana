/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import { BehaviorSubject } from 'rxjs';
import type { TimeRange } from '@kbn/es-query';
import type { Vis } from '../vis';
import { initializeEditApi } from './initialize_edit_api';
import type { VisualizeApi } from './types';

const mockNavigateToEditor = jest.fn();
jest.mock('../services', () => ({
  getCapabilities: () => ({}),
  getEmbeddable: () => ({
    getStateTransfer: () => ({ navigateToEditor: mockNavigateToEditor }),
  }),
}));
jest.mock('..', () => ({ urlFor: (id: string) => `#/edit/${id}` }));

const api = {} as VisualizeApi;

const getOnEdit = ({
  savedObjectId,
  editByReference,
}: {
  savedObjectId?: string;
  editByReference?: jest.Mock;
}) => {
  const { onEdit } = initializeEditApi({
    customTimeRange$: new BehaviorSubject<TimeRange | undefined>(undefined),
    description$: new BehaviorSubject<string | undefined>(undefined),
    getApi: () => api,
    parentApi: { getAppContext: () => ({ currentAppId: 'dashboards' }) },
    savedObjectId$: new BehaviorSubject(savedObjectId),
    searchSessionId$: new BehaviorSubject<string | undefined>(undefined),
    title$: new BehaviorSubject<string | undefined>(undefined),
    vis$: new BehaviorSubject({
      type: { editByReference },
      serialize: () => ({}),
    } as unknown as Vis),
    uuid: 'panel-1',
  });
  if (!onEdit) throw new Error('Expected onEdit');
  return onEdit;
};

describe('initializeEditApi', () => {
  beforeEach(() => {
    mockNavigateToEditor.mockReset();
  });

  test('lets the vis type edit by-reference panels', async () => {
    const editByReference = jest.fn().mockResolvedValue(true);

    await getOnEdit({ savedObjectId: 'vis-1', editByReference })();

    expect(editByReference).toHaveBeenCalledWith(api);
    expect(mockNavigateToEditor).not.toHaveBeenCalled();
  });

  test('edits in Visualize when the vis type declines', async () => {
    const editByReference = jest.fn().mockResolvedValue(false);

    await getOnEdit({ savedObjectId: 'vis-1', editByReference })();

    expect(mockNavigateToEditor).toHaveBeenCalledWith(
      'visualize',
      expect.objectContaining({ path: '#/edit/vis-1' })
    );
  });

  test('edits by-value panels in Visualize', async () => {
    const editByReference = jest.fn();

    await getOnEdit({ editByReference })();

    expect(editByReference).not.toHaveBeenCalled();
    expect(mockNavigateToEditor).toHaveBeenCalledWith(
      'visualize',
      expect.objectContaining({ path: '#/edit_by_value' })
    );
  });
});
