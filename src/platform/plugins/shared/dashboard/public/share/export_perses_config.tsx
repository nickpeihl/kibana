/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import React from 'react';
import { EuiButtonEmpty } from '@elastic/eui';
import { i18n } from '@kbn/i18n';
import type { ExportShareDerivatives } from '@kbn/share-plugin/public';
import { ExportPersesFlyout } from './export_perses_flyout';

export const exportPersesConfig: ReturnType<ExportShareDerivatives['config']> extends Promise<
  infer R
>
  ? R
  : never = {
  label: ({ openFlyout }) => (
    <EuiButtonEmpty
      size="s"
      iconType="exportAction"
      onClick={openFlyout}
      data-test-subj="exportMenuItem-PERSES"
    >
      {i18n.translate('dashboard.exportPerses.label', {
        defaultMessage: 'Perses',
      })}
    </EuiButtonEmpty>
  ),
  shouldRender: () => true,
  flyoutSizing: {
    size: 'm',
    maxWidth: 1000,
  },
  flyoutContent: ({ closeFlyout }) => <ExportPersesFlyout closeFlyout={closeFlyout} />,
};
