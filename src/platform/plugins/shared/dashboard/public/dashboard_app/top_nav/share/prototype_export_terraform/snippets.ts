/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

// PROTOTYPE (dashboards-tf flyout). The module files, all in Terraform JSON syntax (.tf.json). No HCL: there is no
// JavaScript HCL parser/validator, so Kibana only emits JSON it can build with JSON.stringify. String values in
// .tf.json are still Terraform templates; the converter already escapes `${` -> `$${` and `%{` -> `%%{`.

import { RESOURCE_TYPE, TARGET_PROVIDER } from './use_terraform_export';

type Json = any;
export type Mode = 'manage' | 'copy';

export interface SnippetInput {
  body: Json;
  name: string;
  mode: Mode;
  spaceId: string;
  dashboardId?: string;
}

const json = (v: Json) => `${JSON.stringify(v, null, 2)}\n`;

/** Managing the existing dashboard pins its id and space; a copy lets Kibana assign both. */
const withIds = ({ body, mode, spaceId, dashboardId }: SnippetInput) =>
  mode === 'manage' && dashboardId ? { space_id: spaceId, dashboard_id: dashboardId, ...body } : body;

export const mainTfJson = (i: SnippetInput) => json({ resource: { [RESOURCE_TYPE]: { [i.name]: withIds(i) } } });

/** `to` is a reference expression; Terraform's JSON syntax takes it as a string. */
export const importsTfJson = ({ name, spaceId, dashboardId }: SnippetInput) =>
  json({ import: [{ to: `${RESOURCE_TYPE}.${name}`, id: `${spaceId}/${dashboardId}` }] });

export const versionsTfJson = () =>
  json({
    terraform: {
      required_providers: {
        elasticstack: { source: TARGET_PROVIDER.source, version: `>= ${TARGET_PROVIDER.minVersion}` },
      },
    },
    // Reads ELASTICSEARCH_* / KIBANA_* environment variables by default.
    provider: { elasticstack: {} },
  });

export const readme = ({ mode }: SnippetInput) => `# Dashboard exported from Kibana

Generated for the ${TARGET_PROVIDER.source} provider ${TARGET_PROVIDER.version}
(built from this Kibana's Dashboards API). Requires >= ${TARGET_PROVIDER.minVersion}.

The files use Terraform's JSON configuration syntax (\`.tf.json\`). Terraform and
OpenTofu load them like \`.tf\` files; you can convert them to HCL yourself if you prefer.

    export KIBANA_ENDPOINT=...  KIBANA_API_KEY=...
    terraform init
    terraform plan
${
  mode === 'manage'
    ? '\nimports.tf.json adopts the existing dashboard: the first plan should show "1 to import, 0 to change".\n'
    : '\nThis creates a new dashboard; the original is untouched.\n'
}`;

export const download = (filename: string, content: string) => {
  const url = URL.createObjectURL(new Blob([content], { type: 'text/plain' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};
