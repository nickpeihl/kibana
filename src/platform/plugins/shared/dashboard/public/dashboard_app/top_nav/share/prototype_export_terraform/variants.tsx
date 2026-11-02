/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

// PROTOTYPE (dashboards-tf flyout). Three "Export as Terraform" flyout variants, switchable with the floating bar
// (or ?tfVariant=A|B|C). Throwaway: no i18n, no tests. Question: what should the flyout show and how should it feel?

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  EuiAccordion,
  EuiBadge,
  EuiBasicTable,
  EuiBetaBadge,
  EuiButton,
  EuiButtonEmpty,
  EuiButtonGroup,
  EuiButtonIcon,
  EuiCallOut,
  EuiCode,
  EuiCodeBlock,
  EuiCopy,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFlyoutBody,
  EuiFlyoutFooter,
  EuiFlyoutHeader,
  EuiFormRow,
  EuiHealth,
  EuiIcon,
  EuiLoadingSpinner,
  EuiPanel,
  EuiRadioGroup,
  EuiSpacer,
  EuiStat,
  EuiSwitch,
  EuiText,
  EuiTitle,
} from '@elastic/eui';
import type { PanelRow, TerraformExport } from './use_terraform_export';
import { TARGET_PROVIDER, toResourceName } from './use_terraform_export';
import type { Format, Mode, SnippetInput } from './snippets';
import { download, importTf, mainTf, mainTfJson, readme, versionsTf } from './snippets';

export interface VariantProps {
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

const statusHealth: Record<PanelRow['status'], { color: string; label: string }> = {
  exported: { color: 'success', label: 'Typed attributes' },
  json: { color: 'warning', label: 'JSON string' },
  partial: { color: 'warning', label: 'Partial: fields dropped' },
  skipped: { color: 'danger', label: 'Not exported' },
};

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

const TechPreview = () => (
  <EuiBetaBadge label="Technical preview" size="s" tooltipContent="Prototype of the Export as Terraform flyout." />
);

const useSnippetInput = (p: VariantProps, mode: Mode, name: string, jsonencode = true): SnippetInput => ({
  body: p.exp.body,
  name,
  mode: p.dashboardId ? mode : 'copy',
  spaceId: p.exp.spaceId,
  dashboardId: p.dashboardId,
  jsonencode,
});

const newerRows = (exp: TerraformExport) => exp.panels.filter((r) => r.status !== 'skipped' && SIMULATED_NEWER[r.type]);

// ─── Variant A: code first (mirrors the existing Export → JSON flyout) ──────────────────────────────────────────

export const VariantA = (p: VariantProps) => {
  const { exp } = p;
  const [format, setFormat] = useState<Format>('hcl');
  const [manage, setManage] = useState(Boolean(p.dashboardId));
  const name = toResourceName(p.title);
  const skipped = exp.panels.filter((r) => r.status === 'skipped');
  const newer = newerRows(exp);
  const input = useSnippetInput(p, manage ? 'manage' : 'copy', name);
  const code =
    exp.status !== 'success'
      ? ''
      : format === 'hcl'
      ? `${manage && p.dashboardId ? `${importTf(input)}\n` : ''}${mainTf(input)}`
      : mainTfJson(input);

  return (
    <>
      <EuiFlyoutHeader hasBorder>
        <EuiTitle>
          <h2>Export dashboard as Terraform</h2>
        </EuiTitle>
        <EuiSpacer size="s" />
        <EuiFlexGroup justifyContent="spaceBetween" alignItems="center" responsive={false}>
          <EuiFlexItem grow={false}>
            <TechPreview />
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiFlexGroup gutterSize="m" alignItems="center" responsive={false}>
              <EuiFlexItem grow={false}>
                <EuiSwitch
                  compressed
                  label="Manage this dashboard"
                  checked={manage}
                  disabled={!p.dashboardId}
                  onChange={() => setManage(!manage)}
                />
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiButtonGroup
                  legend="Format"
                  buttonSize="compressed"
                  idSelected={format}
                  onChange={(id) => setFormat(id as Format)}
                  options={[
                    { id: 'hcl', label: 'HCL' },
                    { id: 'tfjson', label: '.tf.json' },
                  ]}
                />
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiSpacer size="s" />
        <EuiText size="xs" color="subdued">
          For <EuiCode>{TARGET_PROVIDER.source}</EuiCode> ≥ {TARGET_PROVIDER.minVersion}. Generated from this Kibana&apos;s
          Dashboards API.{' '}
          {manage && p.dashboardId
            ? 'The import block adopts this dashboard, so Terraform updates it in place.'
            : 'Applying creates a new dashboard.'}
          {p.isDirty && ' Includes unsaved changes.'}
        </EuiText>
        {(skipped.length > 0 || exp.losses.length > 0 || newer.length > 0) && (
          <>
            <EuiSpacer size="s" />
            <EuiCallOut size="s" color="warning" iconType="warning" title="Some of this dashboard isn't in the export">
              <ul>
                {skipped.map((r) => (
                  <li key={r.path}>
                    Panel <strong>{r.title}</strong> ({r.type}) isn&apos;t supported by the Terraform provider yet.
                  </li>
                ))}
                {exp.losses.map((l) => (
                  <li key={l}>
                    <EuiCode>{l}</EuiCode> has no Terraform attribute.
                  </li>
                ))}
                {newer.map((r) => (
                  <li key={r.path}>
                    <strong>{r.title}</strong> needs provider ≥ {SIMULATED_NEWER[r.type]} (simulated).
                  </li>
                ))}
              </ul>
            </EuiCallOut>
          </>
        )}
      </EuiFlyoutHeader>
      <EuiFlyoutBody>
        {exp.status === 'success' ? (
          <EuiCodeBlock language={format === 'hcl' ? 'hcl' : 'json'} isCopyable lineNumbers overflowHeight="70vh" fontSize="s">
            {code}
          </EuiCodeBlock>
        ) : (
          <Loading exp={exp} />
        )}
      </EuiFlyoutBody>
      <EuiFlyoutFooter>
        <EuiFlexGroup justifyContent="spaceBetween">
          <EuiButtonEmpty onClick={p.closeFlyout}>Close</EuiButtonEmpty>
          <EuiButton
            fill
            iconType="download"
            disabled={exp.status !== 'success'}
            onClick={() => download(format === 'hcl' ? `${name}.tf` : `${name}.tf.json`, code)}
          >
            Download {format === 'hcl' ? `${name}.tf` : `${name}.tf.json`}
          </EuiButton>
        </EuiFlexGroup>
      </EuiFlyoutFooter>
    </>
  );
};

// ─── Variant B: review what's included, choose, then get code ───────────────────────────────────────────────────

export const VariantB = (p: VariantProps) => {
  const { exp } = p;
  const [name, setName] = useState(toResourceName(p.title));
  const [mode, setMode] = useState<Mode>(p.dashboardId ? 'manage' : 'copy');
  const [format, setFormat] = useState<Format>('hcl');
  const input = useSnippetInput(p, mode, name || 'dashboard');
  const counts = useMemo(
    () => ({
      exported: exp.panels.filter((r) => r.status === 'exported').length,
      json: exp.panels.filter((r) => r.status === 'json').length,
      skipped: exp.panels.filter((r) => r.status === 'skipped').length,
      partial: exp.panels.filter((r) => r.status === 'partial').length,
    }),
    [exp.panels]
  );
  const code =
    exp.status !== 'success'
      ? ''
      : format === 'hcl'
      ? `${mode === 'manage' && p.dashboardId ? `${importTf(input)}\n` : ''}${mainTf(input)}`
      : mainTfJson(input);

  return (
    <>
      <EuiFlyoutHeader hasBorder>
        <EuiFlexGroup alignItems="center" gutterSize="s" responsive={false}>
          <EuiFlexItem grow={false}>
            <EuiTitle>
              <h2>Export dashboard as Terraform</h2>
            </EuiTitle>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <TechPreview />
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFlyoutHeader>
      <EuiFlyoutBody>
        {exp.status !== 'success' ? (
          <Loading exp={exp} />
        ) : (
          <>
            <EuiTitle size="xs">
              <h3>1. What&apos;s included</h3>
            </EuiTitle>
            <EuiSpacer size="s" />
            <EuiFlexGroup responsive={false}>
              <EuiFlexItem>
                <EuiStat title={counts.exported} description="Typed attributes" titleColor="success" titleSize="s" />
              </EuiFlexItem>
              <EuiFlexItem>
                <EuiStat title={counts.json} description="As JSON strings" titleColor="warning" titleSize="s" />
              </EuiFlexItem>
              <EuiFlexItem>
                <EuiStat title={counts.partial} description="Partial" titleColor="warning" titleSize="s" />
              </EuiFlexItem>
              <EuiFlexItem>
                <EuiStat title={counts.skipped} description="Not exported" titleColor="danger" titleSize="s" />
              </EuiFlexItem>
            </EuiFlexGroup>
            <EuiSpacer size="s" />
            <EuiBasicTable<PanelRow>
              tableCaption="Panels"
              compressed
              items={exp.panels}
              columns={[
                { field: 'title', name: 'Panel', truncateText: true },
                { field: 'type', name: 'Type', width: '120px' },
                {
                  name: 'Terraform attribute',
                  render: (r: PanelRow) => (r.tfKey ? <EuiCode>{r.tfKey}</EuiCode> : '—'),
                },
                {
                  name: 'Status',
                  width: '150px',
                  render: (r: PanelRow) => (
                    <EuiHealth color={statusHealth[r.status].color}>
                      {SIMULATED_NEWER[r.type] && r.status !== 'skipped'
                        ? `Needs ≥ ${SIMULATED_NEWER[r.type]}`
                        : statusHealth[r.status].label}
                    </EuiHealth>
                  ),
                },
              ]}
            />
            {exp.losses.length > 0 && (
              <>
                <EuiSpacer size="s" />
                <EuiCallOut size="s" color="warning" title={`${exp.losses.length} field(s) have no Terraform attribute and are dropped`}>
                  {exp.losses.map((l) => (
                    <EuiCode key={l}>{l}</EuiCode>
                  ))}
                </EuiCallOut>
              </>
            )}

            <EuiSpacer size="l" />
            <EuiTitle size="xs">
              <h3>2. How to use it</h3>
            </EuiTitle>
            <EuiSpacer size="s" />
            <EuiRadioGroup
              idSelected={mode}
              onChange={(id) => setMode(id as Mode)}
              options={[
                {
                  id: 'manage',
                  disabled: !p.dashboardId,
                  label: 'Manage this dashboard with Terraform (adds an import block; keeps its ID)',
                },
                { id: 'copy', label: 'Create a new dashboard from this one' },
              ]}
            />
            <EuiSpacer size="m" />
            <EuiFlexGroup>
              <EuiFlexItem>
                <EuiFormRow label="Resource name" helpText="Terraform address of the resource" display="rowCompressed">
                  <EuiFieldText compressed value={name} onChange={(e) => setName(toResourceName(e.target.value))} />
                </EuiFormRow>
              </EuiFlexItem>
              <EuiFlexItem>
                <EuiFormRow label="Provider" display="rowCompressed" helpText="Built from this Kibana's API">
                  <EuiText size="s">
                    <EuiCode>
                      {TARGET_PROVIDER.source} ≥ {TARGET_PROVIDER.minVersion}
                    </EuiCode>
                  </EuiText>
                </EuiFormRow>
              </EuiFlexItem>
            </EuiFlexGroup>

            <EuiSpacer size="l" />
            <EuiAccordion
              id="tfPrototypePreview"
              buttonContent={<strong>3. Preview code</strong>}
              extraAction={
                <EuiButtonGroup
                  legend="Format"
                  buttonSize="compressed"
                  idSelected={format}
                  onChange={(id) => setFormat(id as Format)}
                  options={[
                    { id: 'hcl', label: 'HCL' },
                    { id: 'tfjson', label: '.tf.json' },
                  ]}
                />
              }
            >
              <EuiSpacer size="s" />
              <EuiCodeBlock language={format === 'hcl' ? 'hcl' : 'json'} isCopyable overflowHeight={400} fontSize="s">
                {code}
              </EuiCodeBlock>
            </EuiAccordion>
          </>
        )}
      </EuiFlyoutBody>
      <EuiFlyoutFooter>
        <EuiFlexGroup justifyContent="spaceBetween">
          <EuiButtonEmpty onClick={p.closeFlyout}>Cancel</EuiButtonEmpty>
          <EuiFlexGroup gutterSize="s" justifyContent="flexEnd" responsive={false}>
            <EuiCopy textToCopy={code}>
              {(copy) => (
                <EuiButton iconType="copyClipboard" onClick={copy} disabled={exp.status !== 'success'}>
                  Copy
                </EuiButton>
              )}
            </EuiCopy>
            <EuiButton
              fill
              iconType="download"
              disabled={exp.status !== 'success'}
              onClick={() => download(format === 'hcl' ? `${name}.tf` : `${name}.tf.json`, code)}
            >
              Download
            </EuiButton>
          </EuiFlexGroup>
        </EuiFlexGroup>
      </EuiFlyoutFooter>
    </>
  );
};

// ─── Variant C: a ready-to-run module (files + problems list, IDE-like) ─────────────────────────────────────────

interface Problem {
  level: 'danger' | 'warning' | 'subdued';
  text: React.ReactNode;
}

export const VariantC = (p: VariantProps) => {
  const { exp } = p;
  const [mode, setMode] = useState<Mode>(p.dashboardId ? 'manage' : 'copy');
  const name = toResourceName(p.title);
  const input = useSnippetInput(p, mode, name);
  const files = useMemo(() => {
    if (exp.status !== 'success') return [];
    const f: Array<{ name: string; lang: string; content: string }> = [
      { name: 'versions.tf', lang: 'hcl', content: versionsTf() },
      { name: 'main.tf', lang: 'hcl', content: mainTf(input) },
    ];
    if (input.mode === 'manage') f.push({ name: 'imports.tf', lang: 'hcl', content: importTf(input) });
    f.push({ name: 'README.md', lang: 'markdown', content: readme(input) });
    return f;
  }, [exp.status, input]);
  const [selected, setSelected] = useState('main.tf');
  const file = files.find((f) => f.name === selected) ?? files[1];

  const problems: Problem[] = [
    ...exp.panels
      .filter((r) => r.status === 'skipped')
      .map((r) => ({ level: 'danger' as const, text: <>Panel “{r.title}” ({r.type}) not exported: no Terraform support yet</> })),
    ...newerRows(exp).map((r) => ({
      level: 'warning' as const,
      text: <>“{r.title}” requires provider ≥ {SIMULATED_NEWER[r.type]} (simulated); raise the constraint in versions.tf</>,
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
              <TechPreview />
            </EuiFlexGroup>
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiSpacer size="s" />
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
      </EuiFlyoutHeader>
      <EuiFlyoutBody>
        {exp.status !== 'success' ? (
          <Loading exp={exp} />
        ) : (
          <EuiFlexGroup direction="column" gutterSize="m" css={{ height: '100%' }}>
            <EuiFlexItem>
              <EuiFlexGroup gutterSize="s" responsive={false} css={{ minHeight: 0 }}>
                <EuiFlexItem grow={false} css={{ width: 160 }}>
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

// ─── Floating switcher ───────────────────────────────────────────────────────────────────────────────────────────

export const VARIANTS = [
  { key: 'A', name: 'Code first', Component: VariantA },
  { key: 'B', name: 'Review, then code', Component: VariantB },
  { key: 'C', name: 'Module files + problems', Component: VariantC },
] as const;

const STORAGE_KEY = 'dashboardsTfPrototypeVariant';
const initialVariant = () => {
  const fromUrl = new URLSearchParams((window.location.search || window.location.hash.split('?')[1]) ?? '').get('tfVariant');
  let stored: string | null = null;
  try {
    stored = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    stored = null;
  }
  const k = (fromUrl ?? stored ?? 'A').toUpperCase();
  return Math.max(0, VARIANTS.findIndex((v) => v.key === k));
};

export const useVariant = () => {
  const [index, setIndex] = useState(initialVariant);
  const go = useCallback((delta: number) => {
    setIndex((i) => {
      const next = (i + delta + VARIANTS.length) % VARIANTS.length;
      try {
        window.localStorage.setItem(STORAGE_KEY, VARIANTS[next].key);
      } catch {
        // prototype: ignore
      }
      return next;
    });
  }, []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.closest('input, textarea, [contenteditable="true"]') || t.isContentEditable)) return;
      if (e.key === 'ArrowLeft') go(-1);
      if (e.key === 'ArrowRight') go(1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go]);
  return { index, go };
};

export const PrototypeSwitcher = ({ index, go }: { index: number; go: (d: number) => void }) => (
  <div
    data-test-subj="tfPrototypeSwitcher"
    css={{
      position: 'fixed',
      bottom: 72,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 10000,
      background: '#111',
      color: '#fff',
      borderRadius: 999,
      padding: '4px 8px',
      boxShadow: '0 4px 16px rgba(0,0,0,.35)',
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      fontSize: 13,
      whiteSpace: 'nowrap',
    }}
  >
    <EuiButtonIcon iconType="arrowLeft" color="text" css={{ color: '#fff' }} aria-label="Previous variant" onClick={() => go(-1)} />
    <span>
      PROTOTYPE {VARIANTS[index].key} ({VARIANTS[index].name})
    </span>
    <EuiButtonIcon iconType="arrowRight" color="text" css={{ color: '#fff' }} aria-label="Next variant" onClick={() => go(1)} />
  </div>
);
