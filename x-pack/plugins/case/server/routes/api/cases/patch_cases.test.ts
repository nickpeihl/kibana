/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { kibanaResponseFactory, RequestHandler } from 'src/core/server';
import { httpServerMock } from 'src/core/server/mocks';

import {
  createMockSavedObjectsRepository,
  createRoute,
  createRouteContext,
  mockCases,
  mockCaseComments,
} from '../__fixtures__';
import { initPatchCasesApi } from './patch_cases';

describe('PATCH cases', () => {
  let routeHandler: RequestHandler<any, any, any>;
  beforeAll(async () => {
    routeHandler = await createRoute(initPatchCasesApi, 'patch');
    const spyOnDate = jest.spyOn(global, 'Date') as jest.SpyInstance<{}, []>;
    spyOnDate.mockImplementation(() => ({
      toISOString: jest.fn().mockReturnValue('2019-11-25T21:54:48.952Z'),
    }));
  });
  it(`Close a case`, async () => {
    const request = httpServerMock.createKibanaRequest({
      path: '/api/cases',
      method: 'patch',
      body: {
        cases: [
          {
            id: 'mock-id-1',
            status: 'closed',
            version: 'WzAsMV0=',
          },
        ],
      },
    });

    const theContext = createRouteContext(
      createMockSavedObjectsRepository({
        caseSavedObject: mockCases,
      })
    );

    const response = await routeHandler(theContext, request, kibanaResponseFactory);
    expect(response.status).toEqual(200);
    expect(response.payload).toEqual([
      {
        closed_at: '2019-11-25T21:54:48.952Z',
        closed_by: { email: 'd00d@awesome.com', full_name: 'Awesome D00d', username: 'awesome' },
        comment_ids: ['mock-comment-1'],
        comments: [],
        created_at: '2019-11-25T21:54:48.952Z',
        created_by: { email: 'testemail@elastic.co', full_name: 'elastic', username: 'elastic' },
        description: 'This is a brand new case of a bad meanie defacing data',
        id: 'mock-id-1',
        status: 'closed',
        tags: ['defacement'],
        title: 'Super Bad Security Issue',
        updated_at: '2019-11-25T21:54:48.952Z',
        updated_by: { email: 'd00d@awesome.com', full_name: 'Awesome D00d', username: 'awesome' },
        version: 'WzE3LDFd',
      },
    ]);
  });
  it(`Open a case`, async () => {
    const request = httpServerMock.createKibanaRequest({
      path: '/api/cases',
      method: 'patch',
      body: {
        cases: [
          {
            id: 'mock-id-4',
            status: 'open',
            version: 'WzUsMV0=',
          },
        ],
      },
    });

    const theContext = createRouteContext(
      createMockSavedObjectsRepository({
        caseSavedObject: mockCases,
      })
    );

    const response = await routeHandler(theContext, request, kibanaResponseFactory);
    expect(response.status).toEqual(200);
    expect(response.payload).toEqual([
      {
        closed_at: null,
        closed_by: null,
        comment_ids: [],
        comments: [],
        created_at: '2019-11-25T22:32:17.947Z',
        created_by: { email: 'testemail@elastic.co', full_name: 'elastic', username: 'elastic' },
        description: 'Oh no, a bad meanie going LOLBins all over the place!',
        id: 'mock-id-4',
        status: 'open',
        tags: ['LOLBins'],
        title: 'Another bad one',
        updated_at: '2019-11-25T21:54:48.952Z',
        updated_by: { email: 'd00d@awesome.com', full_name: 'Awesome D00d', username: 'awesome' },
        version: 'WzE3LDFd',
      },
    ]);
  });
  it(`Fails with 409 if version does not match`, async () => {
    const request = httpServerMock.createKibanaRequest({
      path: '/api/cases',
      method: 'patch',
      body: {
        cases: [
          {
            id: 'mock-id-1',
            case: { status: 'closed' },
            version: 'badv=',
          },
        ],
      },
    });

    const theContext = createRouteContext(
      createMockSavedObjectsRepository({
        caseSavedObject: mockCases,
      })
    );

    const response = await routeHandler(theContext, request, kibanaResponseFactory);
    expect(response.status).toEqual(409);
  });
  it(`Fails with 406 if updated field is unchanged`, async () => {
    const request = httpServerMock.createKibanaRequest({
      path: '/api/cases',
      method: 'patch',
      body: {
        cases: [
          {
            id: 'mock-id-1',
            case: { status: 'open' },
            version: 'WzAsMV0=',
          },
        ],
      },
    });

    const theContext = createRouteContext(
      createMockSavedObjectsRepository({
        caseSavedObject: mockCases,
        caseCommentSavedObject: mockCaseComments,
      })
    );

    const response = await routeHandler(theContext, request, kibanaResponseFactory);
    expect(response.status).toEqual(406);
  });
  it(`Returns an error if updateCase throws`, async () => {
    const request = httpServerMock.createKibanaRequest({
      path: '/api/cases',
      method: 'patch',
      body: {
        cases: [
          {
            id: 'mock-id-does-not-exist',
            status: 'closed',
            version: 'WzAsMV0=',
          },
        ],
      },
    });

    const theContext = createRouteContext(
      createMockSavedObjectsRepository({
        caseSavedObject: mockCases,
      })
    );

    const response = await routeHandler(theContext, request, kibanaResponseFactory);
    expect(response.status).toEqual(404);
    expect(response.payload.isBoom).toEqual(true);
  });
});
