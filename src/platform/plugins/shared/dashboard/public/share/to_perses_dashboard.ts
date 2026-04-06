/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import type { DashboardState } from '../../server';
import { DASHBOARD_API_PATH, DASHBOARD_API_VERSION } from '../../common/constants';
import { coreServices } from '../services/kibana_services';

export interface ToPersesResponseBody {
  data: unknown;
  warnings?: Array<{ message: string }>;
}

export async function toPersesDashboard({
  dashboardState,
  project,
  elasticsearchUrl,
}: {
  dashboardState: DashboardState;
  project: string;
  elasticsearchUrl?: string;
}): Promise<{ data: unknown; warnings: Array<{ message: string }> }> {
  const result = await coreServices.http.post<ToPersesResponseBody>(
    `${DASHBOARD_API_PATH}/_to_perses`,
    {
      version: DASHBOARD_API_VERSION,
      query: {
        project,
        ...(elasticsearchUrl ? { elasticsearch_url: elasticsearchUrl } : undefined),
      },
      body: JSON.stringify(dashboardState),
    }
  );

  return {
    data: result.data,
    warnings: result.warnings ?? [],
  };
}
