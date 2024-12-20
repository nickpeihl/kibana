/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { transformError } from '@kbn/securitysolution-es-utils';
import { buildRouteValidationWithZod } from '@kbn/zod-helpers';
import { AlertsMigrationCleanupRequestBody } from '../../../../../common/api/detection_engine/signals_migration';
import type { SecuritySolutionPluginRouter } from '../../../../types';
import { DETECTION_ENGINE_SIGNALS_MIGRATION_URL } from '../../../../../common/constants';
import { buildSiemResponse } from '../utils';

import { signalsMigrationService } from '../../migrations/migration_service';
import { getMigrationSavedObjectsById } from '../../migrations/get_migration_saved_objects_by_id';

export const deleteSignalsMigrationRoute = (router: SecuritySolutionPluginRouter) => {
  router.versioned
    .delete({
      path: DETECTION_ENGINE_SIGNALS_MIGRATION_URL,
      access: 'public',
      security: {
        authz: {
          requiredPrivileges: ['securitySolution'],
        },
      },
    })
    .addVersion(
      {
        version: '2023-10-31',
        validate: {
          request: { body: buildRouteValidationWithZod(AlertsMigrationCleanupRequestBody) },
        },
      },
      async (context, request, response) => {
        const siemResponse = buildSiemResponse(response);
        const { migration_ids: migrationIds } = request.body;

        try {
          const core = await context.core;
          const securitySolution = await context.securitySolution;

          const esClient = core.elasticsearch.client.asCurrentUser;
          const soClient = core.savedObjects.client;
          const appClient = securitySolution?.getAppClient();
          if (!appClient) {
            return siemResponse.error({ statusCode: 404 });
          }

          const user = core.security.authc.getCurrentUser();
          const migrationService = signalsMigrationService({
            esClient,
            soClient,
            username: user?.username ?? 'elastic',
          });

          const signalsAlias = appClient.getSignalsIndex();
          const migrations = await getMigrationSavedObjectsById({
            ids: migrationIds,
            soClient,
          });

          const deletionResults = await Promise.all(
            migrations.map(async (migration) => {
              try {
                const deletedMigration = await migrationService.delete({
                  migration,
                  signalsAlias,
                });

                return {
                  id: deletedMigration.id,
                  destinationIndex: deletedMigration.attributes.destinationIndex,
                  status: deletedMigration.attributes.status,
                  sourceIndex: deletedMigration.attributes.sourceIndex,
                  version: deletedMigration.attributes.version,
                  updated: deletedMigration.attributes.updated,
                };
              } catch (err) {
                const error = transformError(err);
                return {
                  id: migration.id,
                  destinationIndex: migration.attributes.destinationIndex,
                  error: {
                    message: error.message,
                    status_code: error.statusCode,
                  },
                  status: migration.attributes.status,
                  sourceIndex: migration.attributes.sourceIndex,
                  version: migration.attributes.version,
                  updated: migration.attributes.updated,
                };
              }
            })
          );

          return response.ok({ body: { migrations: deletionResults } });
        } catch (err) {
          const error = transformError(err);
          return siemResponse.error({
            body: error.message,
            statusCode: error.statusCode,
          });
        }
      }
    );
};
