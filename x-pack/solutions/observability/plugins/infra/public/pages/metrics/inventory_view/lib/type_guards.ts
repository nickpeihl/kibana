/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type {
  InfraWaffleMapGroupOfGroups,
  InfraWaffleMapGroupOfNodes,
  InfraWaffleMapGradientLegend,
  InfraWaffleMapStepLegend,
} from '../../../../common/inventory/types';

export function isInfraWaffleMapStepLegend(subject: any): subject is InfraWaffleMapStepLegend {
  return subject.type && subject.type === 'step';
}

export function isInfraWaffleMapGradientLegend(
  subject: any
): subject is InfraWaffleMapGradientLegend {
  return subject.type && subject.type === 'gradient';
}

export function isWaffleMapGroupWithNodes(subject: any): subject is InfraWaffleMapGroupOfNodes {
  return subject && subject.nodes != null && Array.isArray(subject.nodes);
}

export function isWaffleMapGroupWithGroups(subject: any): subject is InfraWaffleMapGroupOfGroups {
  return subject && subject.groups != null && Array.isArray(subject.groups);
}
