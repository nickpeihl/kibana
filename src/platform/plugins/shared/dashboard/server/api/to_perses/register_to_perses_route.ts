/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import type { VersionedRouter } from '@kbn/core-http-server';
import type { RequestHandlerContext } from '@kbn/core/server';
import { once } from 'lodash';
import { getRouteConfig } from '../get_route_config';
import { getDashboardStateSchema } from '../dashboard_state_schemas';
import { embeddableService } from '../../kibana_services';
import { toPersesRequestQuerySchema, toPersesResponseBodySchema } from './schemas';
import { toPersesDashboard } from './to_perses';

export function registerToPersesRoute(
  router: VersionedRouter<RequestHandlerContext>,
  elasticsearchPublicBaseUrl?: string
) {
  const { basePath, routeConfig, routeVersion } = getRouteConfig(false);
  const toPersesRoute = router.post({
    path: `${basePath}/_to_perses`,
    summary: 'Convert a dashboard state to a Perses dashboard resource',
    ...routeConfig,
  });

  // Do not call getDashboardStateSchema when registering route.
  // Route is registered during setup and before all plugins have registered embeddable schemas.
  // Instead, use once to only call getDashboardStateSchema the first time a route handler is executed.
  const getCachedDashboardStateSchema = once(() => {
    return getDashboardStateSchema(false);
  });

  toPersesRoute.addVersion(
    {
      version: routeVersion,
      validate: () => ({
        request: {
          query: toPersesRequestQuerySchema,
          body: getCachedDashboardStateSchema(),
        },
        response: {
          200: {
            body: () => toPersesResponseBodySchema,
            description: 'success',
          },
          400: {
            description: 'invalid request',
          },
        },
      }),
    },
    async (ctx, req, res) => {
      try {
        const resolvedElasticsearchUrl =
          req.query.elasticsearch_url ?? elasticsearchPublicBaseUrl ?? undefined;

        const result = toPersesDashboard({
          kibanaDashboardState: req.body,
          project: req.query.project,
          resolvedElasticsearchUrl,
          toPersesEmbeddable: (type, state, options) => {
            const transforms = embeddableService?.getTransforms(type);
            if (!transforms?.toPerses) {
              return {
                error: `Panel type "${type}" is not supported and was dropped.`,
              };
            }

            if (typeof state !== 'object' || state === null) {
              return {
                error: `Panel type "${type}" has invalid state and was dropped.`,
              };
            }

            return transforms.toPerses(state, options);
          },
        });

        return res.ok({
          body: result,
        });
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Unknown error';
        return res.badRequest({
          body: { message },
        });
      }
    }
  );
}
