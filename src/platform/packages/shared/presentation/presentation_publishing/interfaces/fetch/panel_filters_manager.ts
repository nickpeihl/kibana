/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import type { AggregateQuery, Filter, Query } from '@kbn/es-query';
import type { StateComparators, WithAllKeys } from '../../state_manager/types';
import { initializeStateManager } from '../../state_manager';
import type { StateManager } from '../../state_manager/types';

export interface SerializedPanelFilters {
  filters?: Filter[];
  // AggregateQuery included so query$ satisfies PublishesUnifiedSearch.query$
  query?: Query | AggregateQuery;
}

const defaultPanelFiltersState: WithAllKeys<SerializedPanelFilters> = {
  filters: undefined,
  query: undefined,
};

export const panelFiltersComparators: StateComparators<SerializedPanelFilters> = {
  filters: 'deepEquality',
  query: 'deepEquality',
};

export const initializePanelFiltersManager = (
  initialState: SerializedPanelFilters
): StateManager<SerializedPanelFilters> =>
  initializeStateManager(initialState, defaultPanelFiltersState);
