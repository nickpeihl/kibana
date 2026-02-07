/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import { dashboardExportProvider } from './dashboard_export_provider';
import type { SavedObjectsClientContract } from '@kbn/core-saved-objects-api-browser';

describe('dashboardExportProvider', () => {
  const mockSavedObjectsClient = {
    get: jest.fn(),
  } as unknown as SavedObjectsClientContract;

  const provider = dashboardExportProvider({
    getSavedObjectsClient: () => mockSavedObjectsClient,
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should have the correct id', () => {
    expect(provider.id).toBe('dashboardJsonExport');
  });

  it('should return empty array for non-dashboard object types', () => {
    const items = provider.getShareMenuItems({
      objectType: 'visualization',
      sharingData: { title: 'Test' },
      isDirty: false,
    });

    expect(items).toEqual([]);
  });

  it('should return share menu item for dashboard object type', () => {
    const items = provider.getShareMenuItems({
      objectType: 'dashboard',
      objectId: 'test-dashboard-id',
      sharingData: { title: 'Test Dashboard' },
      isDirty: false,
    });

    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      shareMenuItem: {
        name: 'JSON Export',
        icon: 'exportAction',
        disabled: false,
        sortOrder: 2,
      },
      label: 'CSV',
      requiresSavedState: true,
    });
    expect(items[0].generateExport).toBeDefined();
    expect(items[0].helpText).toBeDefined();
    expect(items[0].generateExportButton).toBeDefined();
  });

  it('should disable export when no objectId is provided', () => {
    const items = provider.getShareMenuItems({
      objectType: 'dashboard',
      sharingData: { title: 'Test Dashboard' },
      isDirty: false,
    });

    expect(items).toHaveLength(1);
    expect(items[0].shareMenuItem?.disabled).toBe(true);
  });
});
