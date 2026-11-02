/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

// PROTOTYPE (dashboards-tf flyout). Throwaway route: runs spike A's OAS-driven value converter in a child process.
// The real thing would run the converter in the browser; spawning keeps the prototype off Kibana's build.

import { spawn } from 'node:child_process';
import { join } from 'node:path';
import { schema } from '@kbn/config-schema';
import type { VersionedRouter } from '@kbn/core-http-server';
import type { RequestHandlerContext } from '@kbn/core/server';
import { REPO_ROOT } from '@kbn/repo-info';
import { DASHBOARD_INTERNAL_API_PATH } from '../../../common/constants';

const CLI = join(REPO_ROOT, 'prototype_dashboards_tf_a/consumers/export_cli.mts');

const runConverter = (input: object) =>
  new Promise<object>((resolve, reject) => {
    const { NODE_OPTIONS, ...env } = process.env;
    const child = spawn(process.execPath, [CLI], { env, cwd: REPO_ROOT });
    let out = '';
    let err = '';
    child.stdout.on('data', (d) => (out += d));
    child.stderr.on('data', (d) => (err += d));
    child.on('close', (code) =>
      code === 0 ? resolve(JSON.parse(out)) : reject(new Error(err || `exit ${code}`))
    );
    child.stdin.end(JSON.stringify(input));
  });

export function registerPrototypeTerraformExportRoute(
  router: VersionedRouter<RequestHandlerContext>
) {
  router
    .post({
      path: `${DASHBOARD_INTERNAL_API_PATH}/_prototype_terraform`,
      summary: 'PROTOTYPE: convert dashboard API JSON to Terraform-shaped JSON',
      security: { authz: { enabled: false, reason: 'Prototype; no data access' } },
      access: 'internal',
    })
    .addVersion(
      {
        version: '1',
        validate: {
          request: {
            body: schema.object(
              { dashboard: schema.any(), name: schema.string({ maxLength: 200 }) },
              { unknowns: 'ignore' }
            ),
          },
        },
      },
      async (ctx, req, res) => {
        try {
          return res.ok({ body: await runConverter(req.body) });
        } catch (e) {
          return res.badRequest({ body: { message: (e as Error).message.slice(0, 2000) } });
        }
      }
    );
}
