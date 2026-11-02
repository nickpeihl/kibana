// PROTOTYPE (dashboards-tf flyout). stdin: { dashboard, name } (Dashboards API JSON) -> stdout: { tfJson, losses, skipped }.
// Spawned by the prototype server route. Panels the slice mapping can't convert are dropped and reported, not fatal.
import { readFileSync } from 'node:fs';
import { apiToTfJson, buildModel, losses } from './value_conversion.mts';

type Json = any;
const { dashboard, name } = JSON.parse(readFileSync(0, 'utf8')) as { dashboard: Json; name: string };
const root = buildModel();
const skipped: Array<{ path: string; type?: string; title?: string; reason: string }> = [];

const panelLabel = (p: Json) => p?.config?.title ?? p?.title ?? p?.config?.attributes?.title;
const tryConvert = (d: Json) => {
  losses.length = 0;
  return apiToTfJson(root, d, name);
};

let tfJson: Json;
try {
  tfJson = tryConvert(dashboard);
} catch {
  // Fall back to keeping only the panels that convert on their own.
  const keep = (panels: Json[] = [], prefix: string): Json[] =>
    panels.flatMap((p, i) => {
      if (Array.isArray(p?.panels) && !('type' in p)) return [{ ...p, panels: keep(p.panels, `${prefix}[${i}].panels`) }];
      try {
        tryConvert({ title: 'probe', panels: [p] });
        return [p];
      } catch (e) {
        skipped.push({ path: `${prefix}[${i}]`, type: p?.type, title: panelLabel(p), reason: (e as Error).message.slice(0, 200) });
        return [];
      }
    });
  const pinned = (dashboard.pinned_panels ?? []).filter((p: Json, i: number) => {
    try {
      tryConvert({ title: 'probe', pinned_panels: [p] });
      return true;
    } catch (e) {
      skipped.push({ path: `pinned_panels[${i}]`, type: p?.type, reason: (e as Error).message.slice(0, 200) });
      return false;
    }
  });
  tfJson = tryConvert({ ...dashboard, panels: keep(dashboard.panels, 'panels'), ...(dashboard.pinned_panels ? { pinned_panels: pinned } : {}) });
}
process.stdout.write(JSON.stringify({ tfJson, losses: [...losses], skipped }));
