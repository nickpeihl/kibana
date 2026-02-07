/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import { i18n } from '@kbn/i18n';
import React from 'react';
import { FormattedMessage } from '@kbn/i18n-react';
import type { ShareMenuItemV2, ShareMenuProviderV2 } from '@kbn/share-plugin/public/types';
import type { SavedObjectsClientContract } from '@kbn/core-saved-objects-api-browser';

export interface DashboardExportData {
  title: string;
  dashboardId?: string;
}

async function exportDashboardAsJson({
  dashboardId,
  title,
  savedObjectsClient,
}: {
  dashboardId?: string;
  title: string;
  savedObjectsClient: SavedObjectsClientContract;
}) {
  if (!dashboardId) {
    return;
  }

  try {
    // Fetch the dashboard saved object
    const dashboard = await savedObjectsClient.get('dashboard', dashboardId);
    
    // Create JSON content
    const jsonContent = JSON.stringify(dashboard, null, 2);
    
    // Create a blob and download
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title || 'dashboard'}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    // Error handling could be improved with toast notifications
    // eslint-disable-next-line no-console
    console.error('Error exporting dashboard:', error);
  }
}

interface DashboardExportProviderOpts {
  getSavedObjectsClient: () => SavedObjectsClientContract;
}

export const dashboardExportProvider = ({
  getSavedObjectsClient,
}: DashboardExportProviderOpts): ShareMenuProviderV2 => {
  const getShareMenuItems: ShareMenuProviderV2['getShareMenuItems'] = ({
    objectType,
    sharingData,
    objectId,
  }) => {
    if ('dashboard' !== objectType) {
      return [];
    }

    // TODO fix sharingData types
    const { title } = sharingData as unknown as DashboardExportData;

    const panelTitle = i18n.translate(
      'dashboard.share.shareContextMenu.jsonExportButtonLabel',
      {
        defaultMessage: 'JSON Export',
      }
    );

    const exportHandler = () =>
      exportDashboardAsJson({
        dashboardId: objectId,
        title,
        savedObjectsClient: getSavedObjectsClient(),
      });

    return [
      {
        shareMenuItem: {
          name: panelTitle,
          icon: 'exportAction',
          disabled: !objectId,
          sortOrder: 2,
        },
        label: 'CSV' as const,
        requiresSavedState: true,
        generateExport: exportHandler,
        helpText: (
          <FormattedMessage
            id="dashboard.share.jsonPanelContent.exportDescription"
            defaultMessage="Export the dashboard as a JSON file."
          />
        ),
        generateExportButton: (
          <FormattedMessage
            id="dashboard.share.jsonExportButton"
            defaultMessage="Download JSON"
          />
        ),
      } satisfies ShareMenuItemV2,
    ];
  };

  return {
    id: 'dashboardJsonExport',
    getShareMenuItems,
  };
};
