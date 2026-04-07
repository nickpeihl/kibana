/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import type { AsCodeFilter } from '@kbn/as-code-shared-schemas';
import { FilterStateStore } from '@kbn/es-query-constants';
import { FILTERS } from '@kbn/es-query';
import type { StoredFilter } from './types';
import { toStoredFilter } from './to_stored_filter';
import { fromStoredFilter } from './from_stored_filter';
import { spatialFilterFixture } from './__fixtures__/spatial_filter';
import { isConditionFilter, isDSLFilter } from './type_guards';

describe('toStoredFilter', () => {
  it('converts condition filters to stored phrase format', () => {
    const simplified: AsCodeFilter = {
      type: 'condition',
      condition: {
        field: 'status',
        operator: 'is',
        value: 'active',
      },
    };

    const result = toStoredFilter(simplified) as StoredFilter;

    // Properties not set in AsCodeFilter should not be present in StoredFilter
    expect(result.$state).toBeUndefined();
    expect(result.meta).toMatchObject({
      key: 'status',
      field: 'status',
      type: 'phrase',
    });
    expect(result.query).toEqual({
      match_phrase: {
        status: 'active',
      },
    });
  });

  it('converts group filters to combined filters', () => {
    const simplified: AsCodeFilter = {
      type: 'group',
      group: {
        operator: 'and',
        conditions: [
          { field: 'status', operator: 'is', value: 'active' },
          { field: 'type', operator: 'is', value: 'user' },
        ],
      },
    };

    const result = toStoredFilter(simplified) as StoredFilter;

    expect(result.meta.type).toBe('combined');
    expect(result.meta.relation).toBe('AND');
    expect(Array.isArray(result.meta.params)).toBe(true);
  });

  it('converts DSL filters to stored custom filters and preserves query', () => {
    const simplified: AsCodeFilter = {
      type: 'dsl',
      dsl: {
        query: { script: { source: 'doc.field.value > 0' } },
      },
    };

    const result = toStoredFilter(simplified) as StoredFilter;

    expect(result.query).toEqual({
      script: { source: 'doc.field.value > 0' },
    });
    expect(result.meta.type).toBe('custom');
  });

  it('handles negate precedence (top-level wins over condition.negate)', () => {
    const filter: AsCodeFilter = {
      type: 'condition',
      negate: false,
      condition: {
        field: 'status',
        operator: 'is',
        value: 'active',
        negate: true,
      },
    };

    const result = toStoredFilter(filter) as StoredFilter;
    expect(result.meta.negate).toBeUndefined();
  });

  it('converts spatial filters to stored spatial_filter type', () => {
    const simplified: AsCodeFilter = {
      type: 'spatial',
      dsl: { query: spatialFilterFixture.query },
    };

    const result = toStoredFilter(simplified) as StoredFilter;
    expect(result.meta.type).toBe(FILTERS.SPATIAL_FILTER);
    expect(result.query).toEqual(spatialFilterFixture.query);
  });

  it('round-trips spatial filter fixture without losing query', () => {
    const originalFilter = spatialFilterFixture as unknown as StoredFilter;

    const asCode = fromStoredFilter(originalFilter) as AsCodeFilter;
    const roundTrip = toStoredFilter(asCode) as StoredFilter;

    expect(roundTrip.query).toEqual(originalFilter.query);
    expect(roundTrip.meta.type).toBe(originalFilter.meta.type);
  });

  it('returns undefined for invalid AsCodeFilter structure', () => {
    expect(toStoredFilter({} as AsCodeFilter)).toBeUndefined();
  });

  it('preserves scripted phrase filters as DSL on fromStoredFilter', () => {
    const scriptedPhraseFilter: StoredFilter = {
      $state: { store: FilterStateStore.APP_STATE },
      meta: {
        field: 'calculated_field',
        type: 'phrase',
        negate: false,
        disabled: false,
        alias: 'Scripted calculation equals 100',
        params: { value: 100 },
      },
      query: {
        script: {
          script: {
            source: "doc['field1'].value + doc['field2'].value == params.value",
            params: { value: 100 },
            lang: 'painless',
          },
        },
      },
    };

    const asCode = fromStoredFilter(scriptedPhraseFilter) as AsCodeFilter;
    expect(isDSLFilter(asCode)).toBe(true);
    if (isDSLFilter(asCode)) {
      expect(asCode.dsl.query).toEqual(scriptedPhraseFilter.query);
    }
  });

  it('preserves condition.negate on negated phrases filters round-trip', () => {
    const originalFilter: StoredFilter = {
      $state: { store: FilterStateStore.APP_STATE },
      meta: {
        alias: null,
        disabled: false,
        negate: true,
        type: 'phrases',
        key: 'Carrier',
        field: 'Carrier',
        params: ['ES-Air', 'Kibana Airlines', 'Logstash Airways'],
        index: 'd3d7af60-4c81-11e8-b3d7-01146121b73d',
      },
      query: {
        bool: {
          should: [
            { match_phrase: { Carrier: 'ES-Air' } },
            { match_phrase: { Carrier: 'Kibana Airlines' } },
            { match_phrase: { Carrier: 'Logstash Airways' } },
          ],
          minimum_should_match: 1,
        },
      },
    };

    const asCode = fromStoredFilter(originalFilter) as AsCodeFilter;
    expect(isConditionFilter(asCode)).toBe(true);
    if (isConditionFilter(asCode)) {
      expect(asCode.condition.operator).toBe('is_one_of');
      expect(asCode.condition.negate).toBe(true);
    }

    const roundTrip = toStoredFilter(asCode) as StoredFilter;
    expect(roundTrip.meta.type).toBe('phrases');
    expect(roundTrip.meta.negate).toBe(true);
  });
});
