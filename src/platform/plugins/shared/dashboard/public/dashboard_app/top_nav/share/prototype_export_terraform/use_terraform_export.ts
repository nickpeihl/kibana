/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

// PROTOTYPE (dashboards-tf flyout). Fetches everything every variant renders: sanitized API JSON, the converter's
// Terraform-shaped JSON, and what was dropped. Read-only; no persistence.

import { useEffect, useMemo, useState } from 'react';
import { DASHBOARD_INTERNAL_API_PATH } from '../../../../../common/constants';
import { coreServices, spacesService } from '../../../../services/kibana_services';
import { sanitizeDashboard } from '../export_json/sanitize_dashboard';

type Json = any;

/** Stand-in for "the provider version built from this Kibana's spec" (ADR 0002). Not real. */
export const TARGET_PROVIDER = { source: 'elastic/elasticstack', version: '0.15.0', minVersion: '0.14.0' };
export const RESOURCE_TYPE = 'elasticstack_kibana_dashboard';

export interface PanelRow {
  path: string;
  title: string;
  type: string;
  /** Terraform variant key path, e.g. `vis_config.by_value.xy_chart_config`. */
  tfKey?: string;
  status: 'exported' | 'json' | 'partial' | 'skipped';
  reason?: string;
}

export interface TerraformExport {
  status: 'loading' | 'success' | 'error';
  error?: string;
  apiJson?: Json;
  /** Resource body under `resource.elasticstack_kibana_dashboard.<name>`. */
  body?: Json;
  panels: PanelRow[];
  /** Fields the mapping has no Terraform attribute for (dropped). */
  losses: string[];
  /** Messages from Kibana's own sanitize step (same as the JSON export). */
  sanitizeWarnings: string[];
  spaceId: string;
}

export const toResourceName = (title: string) =>
  (title.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'dashboard').replace(/^(\d)/, '_$1');

const VARIANT_KEY = /(_config|_chart|^by_value|^by_reference|^by_field|^by_esql|^(dashboard|discover|url)(_drilldown)?)$/;
/** Walks down the single variant key at each level (e.g. vis_config -> by_value -> xy_chart_config). */
const variantKeyPath = (tfPanel: Json): { key?: string; json: boolean } => {
  const parts: string[] = [];
  let node = tfPanel;
  for (let depth = 0; depth < 3 && node && typeof node === 'object'; depth++) {
    const k = Object.keys(node).find((x) => VARIANT_KEY.test(x) && x !== 'grid');
    if (!k) break;
    parts.push(k);
    node = node[k];
    if (typeof node === 'string') return { key: parts.join('.'), json: true };
  }
  return { key: parts.join('.') || undefined, json: false };
};

const label = (p: Json) =>
  p?.config?.title ?? p?.config?.attributes?.title ?? p?.config?.label ?? p?.config?.field_name ?? '(untitled)';

const buildRows = (apiJson: Json, body: Json, skipped: Json[], losses: string[]): PanelRow[] => {
  const status = (tfPath: string, json: boolean): PanelRow['status'] =>
    losses.some((l) => l.startsWith(`.${tfPath}.`)) ? 'partial' : json ? 'json' : 'exported';
  const rows: PanelRow[] = [];
  const skippedByPath = new Map(skipped.map((s: Json) => [s.path, s]));
  const tfSections: Json[] = body.sections ?? [];
  const tfPanels: Json[] = body.panels ?? [];
  let plainIdx = 0;
  let sectionIdx = 0;
  const walk = (apiPanels: Json[], tfList: () => Json[], prefix: string, section?: string, tfPrefix = prefix) => {
    let tfIdx = 0;
    apiPanels.forEach((p, i) => {
      const path = `${prefix}[${i}]`;
      const skip = skippedByPath.get(path);
      const title = section ? `${section} › ${label(p)}` : label(p);
      if (skip) {
        rows.push({ path, title, type: p.type, status: 'skipped', reason: skip.reason });
        return;
      }
      const tfPath = `${tfPrefix}[${tfIdx}]`;
      const { key, json } = variantKeyPath(tfList()[tfIdx++]);
      rows.push({ path, title, type: p.type, tfKey: key, status: status(tfPath, json) });
    });
  };
  (apiJson.panels ?? []).forEach((p: Json, i: number) => {
    if (Array.isArray(p?.panels) && !('type' in p)) {
      const tfSection = tfSections[sectionIdx] ?? {};
      walk(p.panels, () => tfSection.panels ?? [], `panels[${i}].panels`, p.title || '(untitled section)', `sections[${sectionIdx++}].panels`);
    } else {
      const path = `panels[${i}]`;
      const skip = skippedByPath.get(path);
      if (skip) rows.push({ path, title: label(p), type: p.type, status: 'skipped', reason: skip.reason });
      else {
        const tfPath = `panels[${plainIdx}]`;
        const { key, json } = variantKeyPath(tfPanels[plainIdx++]);
        rows.push({ path, title: label(p), type: p.type, tfKey: key, status: status(tfPath, json) });
      }
    }
  });
  walk(apiJson.pinned_panels ?? [], () => body.pinned_panels ?? [], 'pinned_panels', 'Controls');
  return rows;
};

export const useTerraformExport = (getExportJson: () => Json, title: string): TerraformExport => {
  const [result, setResult] = useState<TerraformExport>({
    status: 'loading',
    panels: [],
    losses: [],
    sanitizeWarnings: [],
    spaceId: 'default',
  });
  const state = useMemo(() => getExportJson(), [getExportJson]);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const [{ data, warnings }, space] = await Promise.all([
          sanitizeDashboard(state, controller.signal),
          spacesService?.getActiveSpace().catch(() => undefined),
        ]);
        const res = await coreServices.http.post<Json>(`${DASHBOARD_INTERNAL_API_PATH}/_prototype_terraform`, {
          version: '1',
          body: JSON.stringify({ dashboard: data, name: toResourceName(title) }),
          signal: controller.signal,
        });
        const body = Object.values(res.tfJson.resource[RESOURCE_TYPE])[0] as Json;
        setResult({
          status: 'success',
          apiJson: data,
          body,
          panels: buildRows(data, body, res.skipped, res.losses),
          losses: res.losses,
          sanitizeWarnings: warnings,
          spaceId: space?.id ?? 'default',
        });
      } catch (e) {
        if (controller.signal.aborted) return;
        setResult((r) => ({ ...r, status: 'error', error: e?.body?.message ?? (e as Error).message }));
      }
    })();
    return () => controller.abort();
  }, [state, title]);

  return result;
};
