/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import { BehaviorSubject } from 'rxjs';
import type { AggregateQuery, Filter, Query } from '@kbn/es-query';
import { fromStoredFilters, toStoredFilters } from '@kbn/as-code-filters-transforms';
import { toAsCodeQuery, toStoredQuery } from '@kbn/as-code-shared-transforms';
import type { SerializedPanelFilters } from '@kbn/presentation-publishing-schemas';
import type { StateComparators, WithAllKeys } from '../../state_manager/types';
import { initializeStateManager } from '../../state_manager';

export type { SerializedPanelFilters };

const defaultPanelFiltersState: WithAllKeys<SerializedPanelFilters> = {
  filters: undefined,
  query: undefined,
};

export const panelFiltersComparators: StateComparators<SerializedPanelFilters> = {
  filters: 'deepEquality',
  query: 'deepEquality',
};

export interface PanelFiltersApi {
  filters$: BehaviorSubject<Filter[] | undefined>;
  query$: BehaviorSubject<Query | AggregateQuery | undefined>;
  setFilters: (filters: Filter[] | undefined) => void;
  setQuery: (query: Query | undefined) => void;
}

export const initializePanelFiltersManager = (initialState: SerializedPanelFilters) => {
  // Internal state stores the as-code format for schema-validated persistence.
  const internal = initializeStateManager(initialState, defaultPanelFiltersState);

  // Derived subjects expose the runtime Filter/Query types used by existing Kibana APIs.
  const filters$ = new BehaviorSubject<Filter[] | undefined>(
    toStoredFilters(internal.api.filters$.value) as Filter[] | undefined
  );
  const query$ = new BehaviorSubject<Query | AggregateQuery | undefined>(
    toStoredQuery(internal.api.query$.value)
  );

  const filtersSub = internal.api.filters$.subscribe((asCodeFilters) => {
    filters$.next(toStoredFilters(asCodeFilters) as Filter[] | undefined);
  });
  const querySub = internal.api.query$.subscribe((asCodeQuery) => {
    query$.next(toStoredQuery(asCodeQuery));
  });

  const cleanup = () => {
    filtersSub.unsubscribe();
    querySub.unsubscribe();
  };

  const api: PanelFiltersApi = {
    filters$,
    query$,
    setFilters: (newFilters: Filter[] | undefined) => {
      internal.api.setFilters(fromStoredFilters(newFilters));
    },
    setQuery: (newQuery: Query | undefined) => {
      internal.api.setQuery(toAsCodeQuery(newQuery));
    },
  };

  return {
    api,
    anyStateChange$: internal.anyStateChange$,
    getLatestState: internal.getLatestState,
    reinitializeState: internal.reinitializeState,
    cleanup,
  };
};
