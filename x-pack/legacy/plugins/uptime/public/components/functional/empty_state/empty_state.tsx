/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { Fragment } from 'react';
import { i18n } from '@kbn/i18n';
import { EmptyStateError } from './empty_state_error';
import { EmptyStateLoading } from './empty_state_loading';
import { DataMissing } from './data_missing';
import { StatesIndexStatus } from '../../../../common/runtime_types';

interface EmptyStateProps {
  children: JSX.Element[] | JSX.Element;
  statesIndexStatus: StatesIndexStatus | null;
  loading: boolean;
  errors?: Error[];
}

export const EmptyStateComponent = ({
  children,
  statesIndexStatus,
  loading,
  errors,
}: EmptyStateProps) => {
  if (errors?.length) {
    return <EmptyStateError errors={errors} />;
  }
  if (!loading && statesIndexStatus) {
    const { indexExists, docCount } = statesIndexStatus;
    if (!indexExists) {
      return (
        <DataMissing
          headingMessage={i18n.translate('xpack.uptime.emptyState.noIndexTitle', {
            defaultMessage: 'Uptime index not found',
          })}
        />
      );
    } else if (indexExists && docCount === 0) {
      return (
        <DataMissing
          headingMessage={i18n.translate('xpack.uptime.emptyState.noDataMessage', {
            defaultMessage: 'No uptime data found',
          })}
        />
      );
    }
    /**
     * We choose to render the children any time the count > 0, even if
     * the component is loading. If we render the loading state for this component,
     * it will blow away the state of child components and trigger an ugly
     * jittery UX any time the components refresh. This way we'll keep the stale
     * state displayed during the fetching process.
     */
    return <Fragment>{children}</Fragment>;
  }
  return <EmptyStateLoading />;
};
