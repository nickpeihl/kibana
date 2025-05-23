/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { waitFor, renderHook } from '@testing-library/react';
import * as api from './api';

import { TestProviders } from '../../common/mock';
import { useGetActionTypes } from './use_action_types';
import { useToasts } from '../../common/lib/kibana';

jest.mock('./api');
jest.mock('../../common/lib/kibana');

describe('useActionTypes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch action types', async () => {
    const spy = jest.spyOn(api, 'fetchActionTypes');

    renderHook(() => useGetActionTypes(), {
      wrapper: TestProviders,
    });

    expect(spy).toHaveBeenCalledWith({ signal: expect.any(AbortSignal) });
  });

  it('should show a toast error message if failed to fetch', async () => {
    const spyOnFetchActionTypes = jest.spyOn(api, 'fetchActionTypes');

    spyOnFetchActionTypes.mockRejectedValue(() => {
      throw new Error('Something went wrong');
    });

    const addErrorMock = jest.fn();

    (useToasts as jest.Mock).mockReturnValue({ addError: addErrorMock });

    renderHook(() => useGetActionTypes(), {
      wrapper: TestProviders,
    });

    await waitFor(() => expect(addErrorMock).toHaveBeenCalled());
  });
});
