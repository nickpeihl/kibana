#!/usr/bin/env bash
# PROTOTYPE (dashboards-tf spike A): regenerate the OAS slice and run both consumers + checks.
#   bash prototype_dashboards_tf_a/run_all.sh
set -uo pipefail
cd "$(dirname "$0")/.."
export DISABLE_SWC_REGISTER_CACHE=1 NODE_NO_WARNINGS=1
DT=../../kibana/.claude/dashboards-terraform
node prototype_dashboards_tf_a/generate_oas.js 2>&1 | grep -E '^wrote'
node prototype_dashboards_tf_a/check_no_structural_leak.js
node prototype_dashboards_tf_a/consumers/schema_conversion.mts
node "$DT/spike0/diff-tree.mjs" prototype_dashboards_tf_a/out/attribute-tree.json > prototype_dashboards_tf_a/out/diff.txt; echo "diff-tree exit $? (full output: out/diff.txt)"
node "$DT/spike0/diff-tree.mjs" prototype_dashboards_tf_a/out/attribute-tree.json --ignore-mode > prototype_dashboards_tf_a/out/diff.ignore-mode.txt; echo "diff-tree --ignore-mode exit $? (out/diff.ignore-mode.txt)"
node prototype_dashboards_tf_a/consumers/value_conversion.mts
node prototype_dashboards_tf_a/consumers/round_trip.mts
node prototype_dashboards_tf_a/consumers/lint_mapping.mts --self-test
