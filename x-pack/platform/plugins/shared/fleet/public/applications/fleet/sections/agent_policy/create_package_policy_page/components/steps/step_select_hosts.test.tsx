/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';
import { waitFor } from '@testing-library/react';

import { userEvent } from '@testing-library/user-event';

import type { TestRenderer } from '../../../../../../../mock';
import { createFleetTestRendererMock } from '../../../../../../../mock';

import { useGetAgentPolicies } from '../../../../../hooks';
import type { AgentPolicy, PackageInfo } from '../../../../../types';

import { StepSelectHosts } from './step_select_hosts';
import { useAllNonManagedAgentPolicies } from './components/use_policies';

jest.mock('./components/use_policies', () => {
  return {
    ...jest.requireActual('./components/use_policies'),
    useAllNonManagedAgentPolicies: jest.fn(),
  };
});

jest.mock('../../../../../hooks', () => {
  return {
    ...jest.requireActual('../../../../../hooks'),
    useGetAgentPolicies: jest.fn(),
    useGetOutputs: jest.fn().mockResolvedValue({
      data: [],
      isLoading: false,
    }),
    sendGetOneAgentPolicy: jest.fn().mockImplementation((id) =>
      Promise.resolve({
        data: { item: { id, name: `Agent policy ${id}` } },
      })
    ),
  };
});

// FLAKY: https://github.com/elastic/kibana/issues/203307
describe.skip('StepSelectHosts', () => {
  const packageInfo: PackageInfo = {
    name: 'apache',
    version: '1.0.0',
    description: '',
    format_version: '',
    release: 'ga',
    owner: { github: '' },
    title: 'Apache',
    latestVersion: '',
    assets: {} as any,
    status: 'not_installed',
    vars: [],
  };
  const agentPolicies: AgentPolicy[] = [
    {
      id: '1',
      namespace: 'default',
      name: 'Agent policy 1',
      is_managed: false,
      status: 'active',
      updated_at: '',
      updated_by: '',
      revision: 1,
      package_policies: [],
      is_protected: false,
    },
    {
      id: '2',
      namespace: 'default',
      name: 'Agent policy 2',
      is_managed: false,
      status: 'active',
      updated_at: '',
      updated_by: '',
      revision: 1,
      package_policies: [],
      is_protected: false,
    },
  ];
  const newAgentPolicy = {
    name: '',
    namespace: 'default',
  };
  const validation = {};

  let testRenderer: TestRenderer;
  let renderResult: ReturnType<typeof testRenderer.render>;
  const render = () =>
    (renderResult = testRenderer.render(
      <StepSelectHosts
        agentPolicies={agentPolicies}
        updateAgentPolicies={jest.fn()}
        newAgentPolicy={newAgentPolicy}
        updateNewAgentPolicy={jest.fn()}
        withSysMonitoring={false}
        updateSysMonitoring={jest.fn()}
        validation={validation}
        packageInfo={packageInfo}
        setHasAgentPolicyError={jest.fn()}
        updateSelectedTab={jest.fn()}
        selectedAgentPolicyIds={[]}
      />
    ));
  beforeEach(() => {
    testRenderer = createFleetTestRendererMock();
  });

  it('should display create form when no agent policies', async () => {
    (useGetAgentPolicies as jest.MockedFunction<any>).mockReturnValue({
      data: {
        items: [],
      },
    });
    (useAllNonManagedAgentPolicies as jest.MockedFunction<any>).mockReturnValue([]);

    render();

    await waitFor(() => {
      expect(renderResult.getByText('New agent policy name')).toBeInTheDocument();
    });
    expect(renderResult.queryByRole('tablist')).toBeInTheDocument();
    expect(renderResult.getByText('Create agent policy')).toBeInTheDocument();
  });

  it('should display tabs with New hosts selected when agent policies exist', async () => {
    (useGetAgentPolicies as jest.MockedFunction<any>).mockReturnValue({
      data: {
        items: [{ id: '1', name: 'Agent policy 1', namespace: 'default' }],
      },
    });
    (useAllNonManagedAgentPolicies as jest.MockedFunction<any>).mockReturnValue([
      { id: '1', name: 'Agent policy 1', namespace: 'default' },
    ]);

    render();

    expect(renderResult.getByRole('tablist')).toBeInTheDocument();
    expect(renderResult.getByText('New hosts').closest('button')).toHaveAttribute(
      'aria-selected',
      'true'
    );
  });

  it('should display dropdown with agent policy selected when Existing hosts selected', async () => {
    (useGetAgentPolicies as jest.MockedFunction<any>).mockReturnValue({
      data: {
        items: [{ id: '1', name: 'Agent policy 1', namespace: 'default' }],
      },
    });
    (useAllNonManagedAgentPolicies as jest.MockedFunction<any>).mockReturnValue([
      { id: '1', name: 'Agent policy 1', namespace: 'default' },
    ]);

    render();

    expect(renderResult.getByRole('tablist')).toBeInTheDocument();

    await userEvent.click(renderResult.getByText('Existing hosts').closest('button')!);

    await waitFor(() => {
      expect(
        renderResult.container.querySelector('[data-test-subj="agentPolicySelect"]')?.textContent
      ).toContain('Agent policy 1');
    });
  });

  it('should display dropdown without preselected value when Existing hosts selected with mulitple agent policies', async () => {
    (useGetAgentPolicies as jest.MockedFunction<any>).mockReturnValue({
      data: {
        items: [
          { id: '1', name: 'Agent policy 1', namespace: 'default' },
          { id: '2', name: 'Agent policy 2', namespace: 'default' },
        ],
      },
    });
    (useAllNonManagedAgentPolicies as jest.MockedFunction<any>).mockReturnValue([
      { id: '1', name: 'Agent policy 1', namespace: 'default' },
      { id: '2', name: 'Agent policy 2', namespace: 'default' },
    ]);

    render();

    expect(renderResult.getByRole('tablist')).toBeInTheDocument();

    await userEvent.click(renderResult.getByText('Existing hosts').closest('button')!);

    await waitFor(() => {
      const select = renderResult.container.querySelector('[data-test-subj="agentPolicySelect"]');
      expect((select as any)?.value).toEqual('');
    });
  });
});
