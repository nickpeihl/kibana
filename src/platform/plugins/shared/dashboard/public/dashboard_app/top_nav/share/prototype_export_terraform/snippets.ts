/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

// PROTOTYPE (dashboards-tf flyout). Text the variants put in front of the user.

import { RESOURCE_TYPE, TARGET_PROVIDER } from './use_terraform_export';
import { resourceToHcl } from './to_hcl';

type Json = any;
export type Mode = 'manage' | 'copy';
export type Format = 'hcl' | 'tfjson';

export interface SnippetInput {
  body: Json;
  name: string;
  mode: Mode;
  spaceId: string;
  dashboardId?: string;
  jsonencode?: boolean;
}

/** Managing the existing dashboard pins its id and space; a copy lets Kibana assign both. */
const withIds = ({ body, mode, spaceId, dashboardId }: SnippetInput) =>
  mode === 'manage' && dashboardId ? { space_id: spaceId, dashboard_id: dashboardId, ...body } : body;

export const mainTf = (i: SnippetInput) => resourceToHcl(RESOURCE_TYPE, i.name, withIds(i), i.jsonencode ?? true);

export const mainTfJson = (i: SnippetInput) =>
  JSON.stringify({ resource: { [RESOURCE_TYPE]: { [i.name]: withIds(i) } } }, null, 2);

export const importTf = ({ name, spaceId, dashboardId }: SnippetInput) =>
  `import {\n  to = ${RESOURCE_TYPE}.${name}\n  id = "${spaceId}/${dashboardId}"\n}\n`;

export const versionsTf = () => `terraform {
  required_providers {
    elasticstack = {
      source  = "${TARGET_PROVIDER.source}"
      version = ">= ${TARGET_PROVIDER.minVersion}"
    }
  }
}

provider "elasticstack" {
  # Reads ELASTICSEARCH_* / KIBANA_* environment variables by default.
  kibana {}
}
`;

export const readme = ({ mode }: SnippetInput) => `# Dashboard exported from Kibana

Generated for the ${TARGET_PROVIDER.source} provider ${TARGET_PROVIDER.version}
(built from this Kibana's Dashboards API). Requires >= ${TARGET_PROVIDER.minVersion}.

  export KIBANA_ENDPOINT=...  KIBANA_API_KEY=...
  terraform init
  terraform plan
${
  mode === 'manage'
    ? '\nimports.tf adopts the existing dashboard: the first plan should show "1 to import, 0 to change".\n'
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
