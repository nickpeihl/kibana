/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import React, { useEffect, useRef, useState } from 'react';
import { isEqual } from 'lodash';
import {
  EuiButton,
  EuiButtonEmpty,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFlyoutBody,
  EuiFlyoutFooter,
  EuiFlyoutHeader,
  EuiTitle,
} from '@elastic/eui';
import { css } from '@emotion/react';
import { i18n } from '@kbn/i18n';
import type { Filter, Query } from '@kbn/es-query';
import type { DataView } from '@kbn/data-views-plugin/public';
import type { StatefulSearchBarProps } from '@kbn/unified-search-plugin/public';
import { VegaSpecEditor } from '../components/vega_vis_editor';

const bodyCss = css({
  '.euiFlyoutBody__overflowContent': {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    '.vgaEditor': { flex: 1, minHeight: 0 },
  },
});

export const VegaEditorFlyout = ({
  ariaLabelledBy,
  closeFlyout,
  initialSpec,
  initialFilters,
  initialQuery,
  indexPatterns,
  SearchBar,
  isNewPanel = false,
  onPreview,
  onRevert,
  onSave,
}: {
  ariaLabelledBy: string;
  closeFlyout: () => void;
  initialSpec: string;
  initialFilters: Filter[] | undefined;
  initialQuery: Query | undefined;
  indexPatterns: DataView[] | undefined;
  SearchBar: React.ComponentType<StatefulSearchBarProps>;
  isNewPanel?: boolean;
  onPreview: (spec: string) => void;
  onRevert: () => void;
  onSave: (spec: string, filters: Filter[] | undefined, query: Query | undefined) => void;
}) => {
  const [spec, setSpec] = useState(initialSpec);
  const [previewedSpec, setPreviewedSpec] = useState(initialSpec);
  const [filters, setFilters] = useState<Filter[]>(initialFilters ?? []);
  const [query, setQuery] = useState<Query | undefined>(initialQuery);

  const canPreview = spec !== previewedSpec;
  const canSave =
    isNewPanel ||
    spec !== initialSpec ||
    !isEqual(filters, initialFilters ?? []) ||
    !isEqual(query, initialQuery);

  const previewChanges = () => {
    onPreview(spec);
    setPreviewedSpec(spec);
  };

  // Revert on unmount unless the user saved. A ref holds the latest callback without re-arming the
  // unmount effect; `saved` suppresses the revert after a successful Save.
  const saved = useRef(false);
  const onRevertRef = useRef(onRevert);
  onRevertRef.current = onRevert;
  useEffect(
    () => () => {
      if (!saved.current) {
        onRevertRef.current();
      }
    },
    []
  );

  const handleSave = () => {
    saved.current = true;
    onSave(spec, filters.length > 0 ? filters : undefined, query);
    closeFlyout();
  };

  return (
    <>
      <EuiFlyoutHeader hasBorder>
        <EuiTitle size="m">
          <h2 id={ariaLabelledBy}>Vega</h2>
        </EuiTitle>
      </EuiFlyoutHeader>
      <SearchBar
        appName="vega"
        indexPatterns={indexPatterns ?? []}
        query={query}
        onQueryChange={({ query: newQuery }) => setQuery(newQuery as Query | undefined)}
        onQuerySubmit={({ query: newQuery }) => setQuery(newQuery as Query | undefined)}
        filters={filters}
        onFiltersUpdated={(newFilters) => setFilters(newFilters)}
        showDatePicker={false}
        showFilterBar={true}
        showQueryInput={true}
        disableSubscribingToGlobalDataServices={true}
      />
      <EuiFlyoutBody css={bodyCss}>
        <VegaSpecEditor editorValue={spec} onChange={setSpec} />
      </EuiFlyoutBody>
      <EuiFlyoutFooter>
        <EuiFlexGroup justifyContent="spaceBetween" responsive={false}>
          <EuiFlexItem grow={false}>
            <EuiButtonEmpty
              data-test-subj="vegaEditorFlyoutCancelButton"
              flush="left"
              onClick={closeFlyout}
            >
              {i18n.translate('visTypeVega.dashboard.cancelButtonLabel', {
                defaultMessage: 'Cancel',
              })}
            </EuiButtonEmpty>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiFlexGroup gutterSize="s" responsive={false}>
              <EuiFlexItem grow={false}>
                <EuiButton
                  color="success"
                  data-test-subj="vegaEditorFlyoutPreviewButton"
                  disabled={!canPreview}
                  iconType="play"
                  onClick={previewChanges}
                >
                  {i18n.translate('visTypeVega.dashboard.previewButtonLabel', {
                    defaultMessage: 'Run Preview',
                  })}
                </EuiButton>
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiButton
                  data-test-subj="vegaEditorFlyoutSaveButton"
                  fill
                  disabled={!canSave}
                  onClick={handleSave}
                >
                  {i18n.translate('visTypeVega.dashboard.applyAndCloseButtonLabel', {
                    defaultMessage: 'Apply and close',
                  })}
                </EuiButton>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFlyoutFooter>
    </>
  );
};
