/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

// PROTOTYPE (dashboards-tf flyout). Chosen layout (variant C): a ready-to-run module of .tf.json files plus a
// Problems list. Variants A (code first) and B (review, then code) and the HCL printer live in commit 01f7f10338d5.
// Throwaway: no i18n, no tests.

import React, { useCallback, useMemo, useState } from 'react';
import {
  EuiBadge,
  EuiBetaBadge,
  EuiButton,
  EuiButtonEmpty,
  EuiButtonGroup,
  EuiButtonIcon,
  EuiCallOut,
  EuiCode,
  EuiCodeBlock,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFlyoutBody,
  EuiFlyoutFooter,
  EuiFlyoutHeader,
  EuiIcon,
  EuiLoadingSpinner,
  EuiPanel,
  EuiSpacer,
  EuiText,
  EuiTitle,
} from '@elastic/eui';
import type { TerraformExport } from './use_terraform_export';
import { TARGET_PROVIDER, toResourceName } from './use_terraform_export';
import type { Mode, SnippetInput } from './snippets';
import { download, importsTfJson, mainTfJson, readme, versionsTfJson } from './snippets';

export interface TerraformModuleFlyoutProps {
  exp: TerraformExport;
  title: string;
  dashboardId?: string;
  isDirty: boolean;
  closeFlyout: () => void;
}

/** Simulated "added after the minimum provider version" panel types, to show the version warning. */
const SIMULATED_NEWER: Record<string, string> = {
  options_list_control: '0.15.0',
  range_slider_control: '0.15.0',
};

interface Problem {
  level: 'danger' | 'warning' | 'subdued';
  text: React.ReactNode;
}

const Loading = ({ exp }: { exp: TerraformExport }) =>
  exp.status === 'loading' ? (
    <EuiFlexGroup justifyContent="center" css={{ padding: 40 }}>
      <EuiLoadingSpinner size="xl" />
    </EuiFlexGroup>
  ) : (
    <EuiCallOut color="danger" iconType="error" title="Conversion failed">
      <EuiCode>{exp.error}</EuiCode>
    </EuiCallOut>
  );

export const TerraformModuleFlyout = (p: TerraformModuleFlyoutProps) => {
  const { exp } = p;
  const [mode, setMode] = useState<Mode>(p.dashboardId ? 'manage' : 'copy');
  const name = toResourceName(p.title);
  const input: SnippetInput = useMemo(
    () => ({ body: exp.body, name, mode: p.dashboardId ? mode : 'copy', spaceId: exp.spaceId, dashboardId: p.dashboardId }),
    [exp.body, exp.spaceId, name, mode, p.dashboardId]
  );
  const files = useMemo(() => {
    if (exp.status !== 'success') return [];
    const f: Array<{ name: string; lang: string; content: string }> = [
      { name: 'versions.tf.json', lang: 'json', content: versionsTfJson() },
      { name: 'main.tf.json', lang: 'json', content: mainTfJson(input) },
    ];
    if (input.mode === 'manage') f.push({ name: 'imports.tf.json', lang: 'json', content: importsTfJson(input) });
    f.push({ name: 'README.md', lang: 'markdown', content: readme(input) });
    return f;
  }, [exp.status, input]);
  const [selected, setSelected] = useState('main.tf.json');
  const file = files.find((f) => f.name === selected) ?? files[1];

  const problems: Problem[] = [
    ...exp.panels
      .filter((r) => r.status === 'skipped')
      .map((r) => ({ level: 'danger' as const, text: <>Panel “{r.title}” ({r.type}) not exported: no Terraform support yet</> })),
    ...exp.panels
      .filter((r) => r.status !== 'skipped' && SIMULATED_NEWER[r.type])
      .map((r) => ({
        level: 'warning' as const,
        text: <>“{r.title}” requires provider ≥ {SIMULATED_NEWER[r.type]} (simulated); raise the constraint in versions.tf.json</>,
      })),
    ...exp.losses.map((l) => ({ level: 'warning' as const, text: <>Dropped <EuiCode>{l}</EuiCode>: no Terraform attribute</> })),
    ...exp.panels
      .filter((r) => r.status === 'json')
      .map((r) => ({ level: 'subdued' as const, text: <>“{r.title}” is exported as a JSON string (<EuiCode>{r.tfKey}</EuiCode>)</> })),
    ...exp.sanitizeWarnings.map((w) => ({ level: 'warning' as const, text: w })),
    ...(p.isDirty ? [{ level: 'subdued' as const, text: 'Includes unsaved changes' }] : []),
  ];

  const downloadAll = useCallback(() => files.forEach((f) => download(f.name, f.content)), [files]);

  return (
    <>
      <EuiFlyoutHeader hasBorder>
        <EuiFlexGroup justifyContent="spaceBetween" alignItems="center" responsive={false}>
          <EuiFlexItem grow={false}>
            <EuiTitle size="s">
              <h2>Terraform module</h2>
            </EuiTitle>
            <EuiText size="xs" color="subdued">
              {p.title}
            </EuiText>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiFlexGroup gutterSize="s" alignItems="center" responsive={false}>
              <EuiBadge color="hollow" iconType="package">
                {TARGET_PROVIDER.source} {TARGET_PROVIDER.version}
              </EuiBadge>
              <EuiBetaBadge label="Technical preview" size="s" tooltipContent="Prototype of the Export as Terraform flyout." />
            </EuiFlexGroup>
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiSpacer size="s" />
        <EuiFlexGroup justifyContent="spaceBetween" alignItems="center" responsive={false}>
          <EuiFlexItem grow={false}>
            <EuiButtonGroup
              legend="Mode"
              buttonSize="compressed"
              idSelected={mode}
              onChange={(id) => setMode(id as Mode)}
              options={[
                { id: 'manage', label: 'Adopt this dashboard', isDisabled: !p.dashboardId },
                { id: 'copy', label: 'New copy' },
              ]}
            />
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiText size="xs" color="subdued">
              Terraform JSON syntax (<EuiCode>.tf.json</EuiCode>)
            </EuiText>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFlyoutHeader>
      <EuiFlyoutBody>
        {exp.status !== 'success' ? (
          <Loading exp={exp} />
        ) : (
          <EuiFlexGroup direction="column" gutterSize="m" css={{ height: '100%' }}>
            <EuiFlexItem>
              <EuiFlexGroup gutterSize="s" responsive={false} css={{ minHeight: 0 }}>
                <EuiFlexItem grow={false} css={{ width: 190 }}>
                  {files.map((f) => (
                    <EuiFlexGroup key={f.name} gutterSize="none" alignItems="center" responsive={false} css={{ flexGrow: 0 }}>
                      <EuiFlexItem>
                        <EuiButtonEmpty
                          size="s"
                          flush="left"
                          iconType="document"
                          color={f.name === file?.name ? 'primary' : 'text'}
                          onClick={() => setSelected(f.name)}
                          css={{ fontWeight: f.name === file?.name ? 700 : 400 }}
                        >
                          {f.name}
                        </EuiButtonEmpty>
                      </EuiFlexItem>
                      <EuiFlexItem grow={false}>
                        <EuiButtonIcon
                          iconType="download"
                          size="xs"
                          aria-label={`Download ${f.name}`}
                          onClick={() => download(f.name, f.content)}
                        />
                      </EuiFlexItem>
                    </EuiFlexGroup>
                  ))}
                </EuiFlexItem>
                <EuiFlexItem css={{ minWidth: 0 }}>
                  {file && (
                    <EuiCodeBlock language={file.lang} isCopyable lineNumbers overflowHeight="50vh" fontSize="s">
                      {file.content}
                    </EuiCodeBlock>
                  )}
                </EuiFlexItem>
              </EuiFlexGroup>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiPanel hasBorder paddingSize="s" color="subdued">
                <EuiText size="xs">
                  <strong>Problems ({problems.filter((x) => x.level !== 'subdued').length})</strong>
                </EuiText>
                <EuiSpacer size="xs" />
                {problems.length === 0 ? (
                  <EuiText size="xs" color="subdued">
                    Everything on this dashboard is exported.
                  </EuiText>
                ) : (
                  problems.map((x, i) => (
                    <EuiText size="xs" key={i}>
                      <EuiIcon
                        type={x.level === 'danger' ? 'error' : x.level === 'warning' ? 'warning' : 'info'}
                        color={x.level}
                        size="s"
                      />{' '}
                      {x.text}
                    </EuiText>
                  ))
                )}
              </EuiPanel>
            </EuiFlexItem>
          </EuiFlexGroup>
        )}
      </EuiFlyoutBody>
      <EuiFlyoutFooter>
        <EuiFlexGroup justifyContent="spaceBetween">
          <EuiButtonEmpty onClick={p.closeFlyout}>Close</EuiButtonEmpty>
          <EuiButton fill iconType="download" onClick={downloadAll} disabled={exp.status !== 'success'}>
            Download {files.length} files
          </EuiButton>
        </EuiFlexGroup>
      </EuiFlyoutFooter>
    </>
  );
};
