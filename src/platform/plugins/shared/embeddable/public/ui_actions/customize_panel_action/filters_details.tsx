/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import React, { useEffect, useState } from 'react';
import useMount from 'react-use/lib/useMount';

import { EuiButtonEmpty, EuiCodeBlock, EuiFlexGroup, EuiFormRow } from '@elastic/eui';
import type { Filter } from '@kbn/es-query';
import { getAggregateQueryMode, isOfQueryType, type AggregateQuery } from '@kbn/es-query';
import { i18n } from '@kbn/i18n';
import { FormattedMessage } from '@kbn/i18n-react';
import {
  apiPublishesWritableUnifiedSearch,
  hasEditCapabilities,
} from '@kbn/presentation-publishing';
import { FilterItems } from '@kbn/unified-search-plugin/public';
import type { CustomizePanelActionApi } from './customize_panel_action';
import { executeEditPanelAction } from '../edit_panel_action/execute_edit_action';

export const filterDetailsActionStrings = {
  getQueryTitle: () =>
    i18n.translate('embeddableApi.filters.queryTitle', {
      defaultMessage: 'Query',
    }),
  getFiltersTitle: () =>
    i18n.translate('embeddableApi.filters.filtersTitle', {
      defaultMessage: 'Filters',
    }),
};

interface FiltersDetailsProps {
  editMode: boolean;
  api: CustomizePanelActionApi;
}

export function FiltersDetails({ editMode, api }: FiltersDetailsProps) {
  const [queryString, setQueryString] = useState<string>('');
  const [queryLanguage, setQueryLanguage] = useState<'sql' | 'esql' | undefined>();
  const [incompatibleQueryLanguage, setIncompatibleQueryLanguage] = useState(false);

  const dataViews = api.dataViews$?.value ?? [];

  // React to live filter changes so that the flyout reflects updates made via setFilters.
  const [filters, setFiltersState] = useState<Filter[]>(api.filters$?.value ?? []);
  useEffect(() => {
    if (!api.filters$) return;
    const sub = api.filters$.subscribe((newFilters) => setFiltersState(newFilters ?? []));
    return () => sub.unsubscribe();
  }, [api.filters$]);

  const isWritable = editMode && apiPublishesWritableUnifiedSearch(api);
  const showNavigateAwayEditButton =
    hasEditCapabilities(api) && editMode && !incompatibleQueryLanguage && !isWritable;

  useMount(() => {
    const localQuery = api.query$?.value;
    if (localQuery) {
      if (isOfQueryType(localQuery)) {
        if (typeof localQuery.query === 'string') {
          setQueryString(localQuery.query);
        } else {
          setQueryString(JSON.stringify(localQuery.query, null, 2));
        }
      } else {
        const language = getAggregateQueryMode(localQuery);
        setQueryLanguage(language);
        setQueryString(localQuery[language as keyof AggregateQuery]);
        setIncompatibleQueryLanguage(true);
      }
    }
  });

  const handleFiltersUpdated = (newFilters: Filter[]) => {
    if (isWritable) {
      api.setFilters(newFilters.length > 0 ? newFilters : undefined);
    }
  };

  return (
    <>
      {queryString !== '' && (
        <EuiFormRow
          data-test-subj="panelCustomQueryRow"
          label={filterDetailsActionStrings.getQueryTitle()}
          display="rowCompressed"
          labelAppend={
            showNavigateAwayEditButton ? (
              <EuiButtonEmpty
                size="xs"
                data-test-subj="customizePanelEditQueryButton"
                onClick={() => executeEditPanelAction(api)}
                aria-label={i18n.translate(
                  'embeddableApi.action.customizePanel.flyout.optionsMenuForm.editQueryButtonAriaLabel',
                  {
                    defaultMessage: 'Edit query',
                  }
                )}
              >
                <FormattedMessage
                  id="embeddableApi.action.customizePanel.flyout.optionsMenuForm.editQueryButtonLabel"
                  defaultMessage="Edit"
                />
              </EuiButtonEmpty>
            ) : null
          }
        >
          <EuiCodeBlock
            data-test-subj="customPanelQuery"
            language={queryLanguage}
            paddingSize="s"
            fontSize="s"
            aria-labelledby={`${filterDetailsActionStrings.getQueryTitle()}: ${queryString}`}
            tabIndex={0}
          >
            {queryString}
          </EuiCodeBlock>
        </EuiFormRow>
      )}
      {(filters.length > 0 || isWritable) && (
        <EuiFormRow
          data-test-subj="panelCustomFiltersRow"
          label={filterDetailsActionStrings.getFiltersTitle()}
          labelAppend={
            showNavigateAwayEditButton ? (
              <EuiButtonEmpty
                size="xs"
                data-test-subj="customizePanelEditFiltersButton"
                onClick={() => executeEditPanelAction(api)}
                aria-label={i18n.translate(
                  'embeddableApi.action.customizePanel.flyout.optionsMenuForm.editFiltersButtonAriaLabel',
                  {
                    defaultMessage: 'Edit filters',
                  }
                )}
              >
                <FormattedMessage
                  id="embeddableApi.action.customizePanel.flyout.optionsMenuForm.editFiltersButtonLabel"
                  defaultMessage="Edit"
                />
              </EuiButtonEmpty>
            ) : null
          }
        >
          <EuiFlexGroup wrap={true} gutterSize="xs">
            <FilterItems
              filters={filters}
              indexPatterns={dataViews}
              readOnly={!isWritable}
              onFiltersUpdated={isWritable ? handleFiltersUpdated : undefined}
            />
          </EuiFlexGroup>
        </EuiFormRow>
      )}
    </>
  );
}
