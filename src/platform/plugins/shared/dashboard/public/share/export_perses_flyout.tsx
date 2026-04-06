/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import React, { useCallback, useMemo, useState } from 'react';
import { css } from '@emotion/react';
import {
  EuiBetaBadge,
  EuiButton,
  EuiButtonEmpty,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFlyoutBody,
  EuiFlyoutFooter,
  EuiFlyoutHeader,
  EuiSpacer,
  EuiTitle,
  euiFullHeight,
} from '@elastic/eui';
import { i18n } from '@kbn/i18n';
import { FormattedMessage } from '@kbn/i18n-react';
import { downloadFileAs, useShareTypeContext } from '@kbn/share-plugin/public';

import type { DashboardState } from '../../server';
import type { buildExportSharingData } from '../dashboard_app/top_nav/share/share_options_utils';
import { buildExportJsonFilename } from './export_json_share_utils';
import { ExportPersesPanel } from './export_perses_panel';
import { useSanitizedDashboardState } from './use_sanitized_dashboard_state';
import { toPersesDashboard } from './to_perses_dashboard';

const flyoutBodyCss = css`
  ${euiFullHeight()}
  .euiFlyoutBody__overflow {
    ${euiFullHeight()}
    min-height: 0;
  }

  .euiFlyoutBody__overflowContent {
    ${euiFullHeight()}
    min-height: 0;
  }
`;

type PersesStatus = 'idle' | 'loading' | 'success' | 'error';

export const ExportPersesFlyout = ({ closeFlyout }: { closeFlyout: () => void }) => {
  const { objectType, objectTypeAlias, sharingData } = useShareTypeContext(
    'integration',
    'exportDerivatives'
  );

  const typedSharingData = sharingData as unknown as ReturnType<typeof buildExportSharingData>;
  const { title, exportJson } = typedSharingData;

  const dashboardState = useMemo(() => exportJson(), [exportJson]) as DashboardState;
  const {
    status: sanitizedStatus,
    data: sanitizedDashboardState,
    warnings: sanitizedWarnings,
    error: sanitizedError,
    retry: retrySanitize,
  } = useSanitizedDashboardState({
    dashboardState,
  });

  const [project, setProject] = useState('');
  const [elasticsearchUrl, setElasticsearchUrl] = useState('');

  const [persesStatus, setPersesStatus] = useState<PersesStatus>('idle');
  const [persesData, setPersesData] = useState<unknown>(undefined);
  const [persesWarnings, setPersesWarnings] = useState<string[]>([]);
  const [persesError, setPersesError] = useState<Error | undefined>(undefined);

  const onGenerate = useCallback(async () => {
    if (sanitizedStatus !== 'success' || !sanitizedDashboardState) return;
    if (!project.trim()) return;

    setPersesStatus('loading');
    setPersesError(undefined);
    setPersesWarnings([]);
    setPersesData(undefined);

    try {
      const { data, warnings } = await toPersesDashboard({
        dashboardState: sanitizedDashboardState as DashboardState,
        project: project.trim(),
        elasticsearchUrl: elasticsearchUrl.trim() || undefined,
      });
      setPersesData(data);
      setPersesWarnings(warnings.map((w) => w.message));
      setPersesStatus('success');
    } catch (e) {
      setPersesError(e instanceof Error ? e : new Error(String(e)));
      setPersesStatus('error');
    }
  }, [elasticsearchUrl, project, sanitizedDashboardState, sanitizedStatus]);

  const onDownload = useCallback(async () => {
    if (persesStatus !== 'success' || persesData === undefined) return;
    const filename = buildExportJsonFilename(title, '.perses.json');
    const content = JSON.stringify(persesData, null, 2);
    await downloadFileAs(filename, { content, type: 'application/json' });
    closeFlyout();
  }, [closeFlyout, persesData, persesStatus, title]);

  return (
    <React.Fragment>
      <EuiFlyoutHeader hasBorder>
        <EuiTitle>
          <h2>
            <FormattedMessage
              id="dashboard.exportPerses.flyoutTitle"
              defaultMessage="Export {objectType} as {type}"
              values={{
                objectType: objectTypeAlias ?? objectType.toLocaleLowerCase(),
                type: i18n.translate('dashboard.exportPerses.label', { defaultMessage: 'Perses' }),
              }}
            />
          </h2>
        </EuiTitle>
        <React.Fragment>
          <EuiSpacer size="s" />
          <EuiBetaBadge
            label={i18n.translate('dashboard.exportPerses.technicalPreviewBadgeLabel', {
              defaultMessage: 'TECHNICAL PREVIEW',
            })}
            tooltipContent={i18n.translate('dashboard.exportPerses.technicalPreviewBadgeTooltip', {
              defaultMessage:
                'This functionality is experimental and not supported. It may change or be removed at any time.',
            })}
            size="s"
            data-test-subj="dashboardExportPersesTechnicalPreviewBadge"
          />
        </React.Fragment>
      </EuiFlyoutHeader>

      <EuiFlyoutBody data-test-subj="exportItemDetailsFlyoutBody" css={flyoutBodyCss}>
        <EuiFlexGroup css={{ height: '100%' }} direction="column">
          <ExportPersesPanel
            sanitizedStatus={sanitizedStatus}
            sanitizedDashboardState={sanitizedDashboardState}
            sanitizedWarnings={sanitizedWarnings}
            sanitizedError={sanitizedError}
            onRetrySanitize={retrySanitize}
            persesStatus={persesStatus}
            persesData={persesData}
            persesWarnings={persesWarnings}
            persesError={persesError}
            project={project}
            elasticsearchUrl={elasticsearchUrl}
            onChangeProject={setProject}
            onChangeElasticsearchUrl={setElasticsearchUrl}
            onGenerate={onGenerate}
          />
        </EuiFlexGroup>
      </EuiFlyoutBody>

      <EuiFlyoutFooter>
        <EuiFlexGroup justifyContent="spaceBetween">
          <EuiFlexItem grow={false}>
            <EuiButtonEmpty data-test-subj="exportFlyoutCloseButton" onClick={closeFlyout}>
              <FormattedMessage
                id="dashboard.exportPerses.closeFlyoutButtonLabel"
                defaultMessage="Close"
              />
            </EuiButtonEmpty>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButton
              fill
              onClick={onDownload}
              data-test-subj="dashboardExportPersesDownloadButton"
              disabled={persesStatus !== 'success' || persesData === undefined}
            >
              {i18n.translate('dashboard.exportPerses.downloadButtonLabel', {
                defaultMessage: 'Download Perses JSON',
              })}
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFlyoutFooter>
    </React.Fragment>
  );
};
