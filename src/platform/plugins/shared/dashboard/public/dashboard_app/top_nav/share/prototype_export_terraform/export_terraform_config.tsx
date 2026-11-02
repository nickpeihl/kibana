/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

// PROTOTYPE (dashboards-tf flyout). Export → Terraform, next to Export → JSON. Three variants + a floating switcher.

import React from 'react';
import { EuiButtonEmpty } from '@elastic/eui';
import type { ExportJsonSharingData } from '@kbn/as-code-export-flyout-component';
import type { DashboardState } from '@kbn/as-code-dashboard-schema';
import type { ExportShareParameters } from '@kbn/share-plugin/public';
import { useShareTypeContext } from '@kbn/share-plugin/public';
import { useTerraformExport } from './use_terraform_export';
import { PrototypeSwitcher, VARIANTS, useVariant } from './variants';

const ExportTerraformFlyout = ({ closeFlyout }: { closeFlyout: () => void }) => {
  const { sharingData, objectId, isDirty } = useShareTypeContext('integration', 'exportDerivatives');
  const { title, getExportJson } = sharingData as unknown as ExportJsonSharingData<DashboardState>;
  const exp = useTerraformExport(getExportJson, title);
  const { index, go } = useVariant();
  const { Component } = VARIANTS[index];
  return (
    <>
      <Component exp={exp} title={title} dashboardId={objectId} isDirty={Boolean(isDirty)} closeFlyout={closeFlyout} />
      <PrototypeSwitcher index={index} go={go} />
    </>
  );
};

export const exportTerraformPrototypeConfig: ExportShareParameters = {
  label: ({ openFlyout }) => (
    <EuiButtonEmpty size="s" iconType="pipelineApp" onClick={openFlyout} data-test-subj="exportMenuItem-Terraform">
      Terraform (prototype)
    </EuiButtonEmpty>
  ),
  shouldRender: () => true,
  flyoutSizing: { size: 'm', maxWidth: 1100 },
  flyoutContent: ({ closeFlyout }) => <ExportTerraformFlyout closeFlyout={closeFlyout} />,
};
