// PROTOTYPE (spike C). Loads the Zod-derived OAS components (Kibana's committed capture of its Zod->OAS output).
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { setComponents } from './monomorphize.ts';

export const KIBANA_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(join(KIBANA_ROOT, 'package.json'));

export const loadComponents = () => {
  const yaml = require('js-yaml');
  const doc = yaml.load(readFileSync(join(KIBANA_ROOT, 'oas_docs/output/kibana.yaml'), 'utf8'));
  setComponents(doc.components.schemas);
  const sha = execSync('git rev-parse --short=12 HEAD', { cwd: KIBANA_ROOT }).toString().trim();
  return { source: `Derived from oas_docs/output/kibana.yaml (Zod->OAS) at kibana@${sha}.` };
};
