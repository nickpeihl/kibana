#!/usr/bin/env bash
# PROTOTYPE (spike C). Runs every step from the Kibana worktree root. Node per .nvmrc (native TS type stripping).
set -uo pipefail
cd "$(dirname "$0")/.."
DT=${DT:-../../kibana/.claude/dashboards-terraform}
P=prototype_dashboards_tf_c
node $P/build_derived_schema.ts                                   # 1. Zod-derived OAS + mapping -> derived JSON Schema
node $P/build_oas_wrapper.mjs $P/derived/dashboard.terraform_shaped.schema.json $P/derived/dashboard.terraform_shaped.oas.json
node $P/schema_consumer.mjs $P/derived/dashboard.terraform_shaped.schema.json $P/derived/candidate.attribute-tree.json
node $DT/spike0/diff-tree.mjs $P/derived/candidate.attribute-tree.json > $P/derived/diff-tree.out.txt; echo "diff exit $?"
node $DT/spike0/diff-tree.mjs $P/derived/candidate.attribute-tree.json --ignore-mode > $P/derived/diff-tree.ignore-mode.out.txt
node $P/round_trip.ts | tee $P/derived/round_trip.out.txt         # 3+4. value conversion + round trip + controls
node $P/drift_sim.ts > $P/derived/drift_sim.out.txt               # drift scenarios
PROTOTYPE_EXPAND_CHARTS=bar_gauge_config node $P/drift_sim.ts > $P/derived/drift_sim.expand_bar_gauge.out.txt
# Optional: off-the-shelf generator over the derived OAS (needs tfplugingen-openapi on PATH).
if command -v tfplugingen-openapi >/dev/null; then
  node $P/build_oas_wrapper.mjs $P/derived/dashboard.terraform_shaped.schema.json $P/derived/dashboard.terraform_shaped.no_if_then.oas.json --strip-if-then
  tfplugingen-openapi generate --config $P/tfplugingen_generator_config.yml --output $P/derived/tfplugingen_provider_code_spec.json $P/derived/dashboard.terraform_shaped.no_if_then.oas.json
  node $P/pcs_to_tree.mjs $P/derived/tfplugingen_provider_code_spec.json $P/derived/tfplugingen.attribute-tree.json
  node $DT/spike0/diff-tree.mjs $P/derived/tfplugingen.attribute-tree.json --ignore-mode > $P/derived/diff-tree.tfplugingen.out.txt
fi
