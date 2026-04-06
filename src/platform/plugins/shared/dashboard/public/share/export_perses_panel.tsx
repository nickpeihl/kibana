/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import React, { useEffect, useMemo, useState } from 'react';
import { css } from '@emotion/react';
import {
  EuiAccordion,
  EuiButton,
  EuiCallOut,
  EuiCopy,
  EuiEmptyPrompt,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiLoadingSpinner,
  EuiSpacer,
  EuiText,
  euiYScrollWithShadows,
  useEuiTheme,
  useGeneratedHtmlId,
} from '@elastic/eui';
import { i18n } from '@kbn/i18n';
import { XJsonLang } from '@kbn/monaco';
import { CodeEditor } from '@kbn/code-editor';

type Status = 'idle' | 'loading' | 'success' | 'error';

function WarningsCallout({
  warnings,
  accordionId,
  isExpanded,
  setIsExpanded,
  isVisible,
  onDismiss,
  title,
}: {
  warnings: string[];
  accordionId: string;
  isExpanded: boolean;
  setIsExpanded: (isExpanded: boolean) => void;
  isVisible: boolean;
  onDismiss: () => void;
  title: string;
}) {
  const euiThemeContext = useEuiTheme();

  const warningsListStyles = useMemo(
    () => css`
      ${euiYScrollWithShadows(euiThemeContext, { height: 'auto' })}
      max-height: 240px;
      padding-top: ${euiThemeContext.euiTheme.size.s};
      padding-bottom: ${euiThemeContext.euiTheme.size.s};
    `,
    [euiThemeContext]
  );

  if (!isVisible || !warnings.length) return null;

  return (
    <EuiFlexItem grow={false}>
      <EuiCallOut
        color="warning"
        iconType="alert"
        title={title}
        size="s"
        data-test-subj="dashboardExportPersesWarnings"
        onDismiss={onDismiss}
      >
        <EuiText size="s" color="subdued">
          {i18n.translate('dashboard.exportPerses.warningsSummary', {
            defaultMessage:
              '{count} item{count, plural, one {} other {s}} require attention to run the exported dashboard.',
            values: { count: warnings.length },
          })}
        </EuiText>

        <EuiAccordion
          id={accordionId}
          initialIsOpen={false}
          onToggle={setIsExpanded}
          paddingSize="s"
          buttonContent={
            isExpanded
              ? i18n.translate('dashboard.exportPerses.warningsAccordionHide', {
                  defaultMessage: 'Hide details',
                })
              : i18n.translate('dashboard.exportPerses.warningsAccordionShow', {
                  defaultMessage: 'Show details',
                })
          }
        >
          {isExpanded ? (
            <EuiText
              size="s"
              data-test-subj="dashboardExportPersesWarningsList"
              css={warningsListStyles}
            >
              <ul>
                {warnings.map((warning, idx) => (
                  <li key={`${idx}-${warning}`}>{warning}</li>
                ))}
              </ul>
            </EuiText>
          ) : null}
        </EuiAccordion>
      </EuiCallOut>
    </EuiFlexItem>
  );
}

export const ExportPersesPanel = ({
  sanitizedStatus,
  sanitizedDashboardState,
  sanitizedWarnings,
  sanitizedError,
  onRetrySanitize,
  persesStatus,
  persesData,
  persesWarnings,
  persesError,
  project,
  elasticsearchUrl,
  onChangeProject,
  onChangeElasticsearchUrl,
  onGenerate,
}: {
  sanitizedStatus: 'loading' | 'success' | 'error';
  sanitizedDashboardState: unknown;
  sanitizedWarnings: string[];
  sanitizedError: Error | undefined;
  onRetrySanitize: () => void;
  persesStatus: Status;
  persesData: unknown;
  persesWarnings: string[];
  persesError: Error | undefined;
  project: string;
  elasticsearchUrl: string;
  onChangeProject: (value: string) => void;
  onChangeElasticsearchUrl: (value: string) => void;
  onGenerate: () => void;
}) => {
  const warningsAccordionId = useGeneratedHtmlId({ prefix: 'dashboardExportPersesWarnings' });
  const [isWarningsExpanded, setIsWarningsExpanded] = useState(false);
  const [showWarningsCallout, setShowWarningsCallout] = useState(true);

  useEffect(() => {
    setIsWarningsExpanded(false);
    setShowWarningsCallout(true);
  }, [sanitizedStatus, persesStatus]);

  const allWarnings = useMemo(
    () => [...sanitizedWarnings, ...persesWarnings],
    [sanitizedWarnings, persesWarnings]
  );

  const jsonValue = useMemo(() => {
    if (persesStatus !== 'success' || persesData == null) return '';
    return JSON.stringify(persesData, null, 2);
  }, [persesData, persesStatus]);

  const canGenerate =
    sanitizedStatus === 'success' && sanitizedDashboardState != null && project.trim().length > 0;

  if (sanitizedStatus === 'loading') {
    return (
      <EuiFlexGroup
        direction="column"
        alignItems="center"
        justifyContent="center"
        css={{ height: '100%' }}
        gutterSize="s"
      >
        <EuiFlexItem grow={false}>
          <EuiLoadingSpinner
            size="xl"
            data-test-subj="dashboardExportPersesLoading"
            aria-label={i18n.translate('dashboard.exportPerses.loadingLabel', {
              defaultMessage: 'Preparing dashboard export',
            })}
          />
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiText size="s" color="subdued">
            {i18n.translate('dashboard.exportPerses.loadingText', {
              defaultMessage: 'Preparing export…',
            })}
          </EuiText>
        </EuiFlexItem>
      </EuiFlexGroup>
    );
  }

  if (sanitizedStatus === 'error') {
    const errorMessage = sanitizedError?.message ?? 'Unknown error';
    return (
      <EuiEmptyPrompt
        iconType="error"
        color="danger"
        titleSize="s"
        data-test-subj="dashboardExportPersesSanitizeErrorPrompt"
        title={
          <h3>
            {i18n.translate('dashboard.exportPerses.sanitizeErrorTitle', {
              defaultMessage: 'Unable to export',
            })}
          </h3>
        }
        body={
          <EuiText size="s">
            <p>
              {i18n.translate('dashboard.exportPerses.sanitizeErrorBody', {
                defaultMessage: 'Sorry, there was an error preparing the dashboard export.',
              })}
            </p>
            <p>
              {i18n.translate('dashboard.exportPerses.sanitizeErrorDetails', {
                defaultMessage: 'Error: {errorMessage}',
                values: { errorMessage },
              })}
            </p>
          </EuiText>
        }
        actions={
          <EuiButton
            color="danger"
            iconType="refresh"
            onClick={onRetrySanitize}
            data-test-subj="dashboardExportPersesRetryButton"
          >
            {i18n.translate('dashboard.exportPerses.retryButtonLabel', {
              defaultMessage: 'Retry',
            })}
          </EuiButton>
        }
      />
    );
  }

  return (
    <EuiFlexItem grow css={{ minHeight: 0 }}>
      <EuiFlexGroup direction="column" gutterSize="s" css={{ flex: '1 1 auto', minHeight: 0 }}>
        <WarningsCallout
          warnings={allWarnings}
          accordionId={warningsAccordionId}
          isExpanded={isWarningsExpanded}
          setIsExpanded={setIsWarningsExpanded}
          isVisible={showWarningsCallout}
          title={i18n.translate('dashboard.exportPerses.warningsTitle', {
            defaultMessage: 'Some content may not be exportable',
          })}
          onDismiss={() => {
            setShowWarningsCallout(false);
            setIsWarningsExpanded(false);
          }}
        />

        <EuiFlexItem grow={false}>
          <EuiFormRow
            label={i18n.translate('dashboard.exportPerses.projectLabel', {
              defaultMessage: 'Perses project',
            })}
            helpText={i18n.translate('dashboard.exportPerses.projectHelpText', {
              defaultMessage: 'Required. Used for Perses dashboard metadata.project.',
            })}
            isInvalid={project.trim().length === 0}
            error={
              project.trim().length === 0
                ? i18n.translate('dashboard.exportPerses.projectError', {
                    defaultMessage: 'Project is required.',
                  })
                : undefined
            }
          >
            <EuiFieldText
              value={project}
              onChange={(e) => onChangeProject(e.target.value)}
              isInvalid={project.trim().length === 0}
              data-test-subj="dashboardExportPersesProjectInput"
              aria-label={i18n.translate('dashboard.exportPerses.projectAriaLabel', {
                defaultMessage: 'Perses project',
              })}
            />
          </EuiFormRow>

          <EuiFormRow
            label={i18n.translate('dashboard.exportPerses.elasticsearchUrlLabel', {
              defaultMessage: 'Elasticsearch URL (optional)',
            })}
            helpText={i18n.translate('dashboard.exportPerses.elasticsearchUrlHelpText', {
              defaultMessage:
                'If set, the exported queries will reference this datasource URL. Otherwise, Kibana will use its configured public Elasticsearch URL when available.',
            })}
          >
            <EuiFieldText
              value={elasticsearchUrl}
              onChange={(e) => onChangeElasticsearchUrl(e.target.value)}
              data-test-subj="dashboardExportPersesElasticsearchUrlInput"
            />
          </EuiFormRow>

          <EuiSpacer size="s" />
          <EuiFlexGroup justifyContent="flexEnd" gutterSize="s">
            <EuiFlexItem grow={false}>
              <EuiButton
                fill
                onClick={onGenerate}
                isLoading={persesStatus === 'loading'}
                disabled={!canGenerate}
                data-test-subj="dashboardExportPersesGenerateButton"
              >
                {i18n.translate('dashboard.exportPerses.generateButtonLabel', {
                  defaultMessage: 'Generate',
                })}
              </EuiButton>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexItem>

        <EuiFlexItem grow css={{ minHeight: 0 }}>
          {persesStatus === 'idle' ? (
            <EuiEmptyPrompt
              iconType="exportAction"
              titleSize="s"
              title={
                <h3>
                  {i18n.translate('dashboard.exportPerses.idleTitle', {
                    defaultMessage: 'Export to Perses',
                  })}
                </h3>
              }
              body={
                <EuiText size="s">
                  <p>
                    {i18n.translate('dashboard.exportPerses.idleBody', {
                      defaultMessage:
                        'Enter a Perses project and click Generate to preview the exported dashboard.',
                    })}
                  </p>
                </EuiText>
              }
            />
          ) : persesStatus === 'error' ? (
            <EuiEmptyPrompt
              iconType="error"
              color="danger"
              titleSize="s"
              data-test-subj="dashboardExportPersesErrorPrompt"
              title={
                <h3>
                  {i18n.translate('dashboard.exportPerses.errorTitle', {
                    defaultMessage: 'Unable to generate export',
                  })}
                </h3>
              }
              body={
                <EuiText size="s">
                  {i18n.translate('dashboard.exportPerses.errorBody', {
                    defaultMessage: 'Error: {message}',
                    values: { message: persesError?.message ?? 'Unknown error' },
                  })}
                </EuiText>
              }
            />
          ) : persesStatus === 'success' ? (
            <EuiFlexGroup
              direction="column"
              gutterSize="s"
              wrap={false}
              responsive={false}
              css={css({
                '.react-monaco-editor-container': {
                  flexGrow: 1,
                },
              })}
              data-test-subj="dashboardExportPersesValue"
            >
              <EuiFlexItem grow={false}>
                <EuiSpacer size="s" />
                <EuiFlexGroup justifyContent="flexEnd" gutterSize="m" wrap>
                  <EuiFlexItem grow={false}>
                    <EuiCopy textToCopy={jsonValue}>
                      {(copy) => (
                        <EuiButton size="s" iconType="copyClipboard" onClick={copy}>
                          {i18n.translate('dashboard.exportPerses.copyButtonLabel', {
                            defaultMessage: 'Copy to clipboard',
                          })}
                        </EuiButton>
                      )}
                    </EuiCopy>
                  </EuiFlexItem>
                </EuiFlexGroup>
              </EuiFlexItem>
              <EuiFlexItem grow css={{ minHeight: 0 }}>
                <CodeEditor
                  languageId={XJsonLang.ID}
                  value={jsonValue}
                  aria-label={i18n.translate('dashboard.exportPerses.codeBlockAriaLabel', {
                    defaultMessage: 'Export Perses JSON',
                  })}
                  options={{
                    readOnly: true,
                    lineNumbers: 'off',
                    fontSize: 12,
                    minimap: { enabled: false },
                    folding: true,
                    scrollBeyondLastLine: false,
                    glyphMargin: true,
                    wordWrap: 'on',
                    wrappingIndent: 'indent',
                    automaticLayout: true,
                  }}
                />
              </EuiFlexItem>
            </EuiFlexGroup>
          ) : (
            <EuiFlexGroup
              direction="column"
              alignItems="center"
              justifyContent="center"
              css={{ height: '100%' }}
              gutterSize="s"
            >
              <EuiFlexItem grow={false}>
                <EuiLoadingSpinner size="xl" />
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiText size="s" color="subdued">
                  {i18n.translate('dashboard.exportPerses.generatingText', {
                    defaultMessage: 'Generating export…',
                  })}
                </EuiText>
              </EuiFlexItem>
            </EuiFlexGroup>
          )}
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiFlexItem>
  );
};
