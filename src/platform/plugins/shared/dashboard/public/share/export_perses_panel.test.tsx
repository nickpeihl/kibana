/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@kbn/code-editor-mock/jest_helper';
import { userEvent } from '@testing-library/user-event';
import { ExportPersesPanel } from './export_perses_panel';

describe('ExportPersesPanel', () => {
  it('shows a loading indicator while preparing export', () => {
    render(
      <ExportPersesPanel
        sanitizedStatus="loading"
        sanitizedDashboardState={undefined}
        sanitizedWarnings={[]}
        sanitizedError={undefined}
        onRetrySanitize={jest.fn()}
        persesStatus="idle"
        persesData={undefined}
        persesWarnings={[]}
        persesError={undefined}
        project=""
        elasticsearchUrl=""
        onChangeProject={jest.fn()}
        onChangeElasticsearchUrl={jest.fn()}
        onGenerate={jest.fn()}
      />
    );
    expect(screen.getByTestId('dashboardExportPersesLoading')).toBeInTheDocument();
  });

  it('renders a sanitize error prompt and calls retry', async () => {
    const user = userEvent.setup();
    const onRetrySanitize = jest.fn();
    render(
      <ExportPersesPanel
        sanitizedStatus="error"
        sanitizedDashboardState={undefined}
        sanitizedWarnings={[]}
        sanitizedError={new Error('boom')}
        onRetrySanitize={onRetrySanitize}
        persesStatus="idle"
        persesData={undefined}
        persesWarnings={[]}
        persesError={undefined}
        project=""
        elasticsearchUrl=""
        onChangeProject={jest.fn()}
        onChangeElasticsearchUrl={jest.fn()}
        onGenerate={jest.fn()}
      />
    );

    expect(screen.getByTestId('dashboardExportPersesSanitizeErrorPrompt')).toBeInTheDocument();
    await user.click(screen.getByTestId('dashboardExportPersesRetryButton'));
    expect(onRetrySanitize).toHaveBeenCalledTimes(1);
  });

  it('disables generate button when project is empty', () => {
    render(
      <ExportPersesPanel
        sanitizedStatus="success"
        sanitizedDashboardState={{ title: 'x' }}
        sanitizedWarnings={[]}
        sanitizedError={undefined}
        onRetrySanitize={jest.fn()}
        persesStatus="idle"
        persesData={undefined}
        persesWarnings={[]}
        persesError={undefined}
        project=""
        elasticsearchUrl=""
        onChangeProject={jest.fn()}
        onChangeElasticsearchUrl={jest.fn()}
        onGenerate={jest.fn()}
      />
    );

    expect(screen.getByTestId('dashboardExportPersesGenerateButton')).toBeDisabled();
  });
});
