/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import {
  getResult,
  getFindResultWithSingleHit,
  FindHit,
} from '../routes/__mocks__/request_responses';
import { alertsClientMock } from '../../../../../../../plugins/alerting/server/mocks';
import { getExportAll } from './get_export_all';
import { unSetFeatureFlagsForTestsOnly, setFeatureFlagsForTestsOnly } from '../feature_flags';

describe('getExportAll', () => {
  beforeAll(() => {
    setFeatureFlagsForTestsOnly();
  });

  afterAll(() => {
    unSetFeatureFlagsForTestsOnly();
  });

  test('it exports everything from the alerts client', async () => {
    const alertsClient = alertsClientMock.create();
    alertsClient.get.mockResolvedValue(getResult());
    alertsClient.find.mockResolvedValue(getFindResultWithSingleHit());

    const exports = await getExportAll(alertsClient);
    expect(exports).toEqual({
      rulesNdjson: `${JSON.stringify({
        created_at: '2019-12-13T16:40:33.400Z',
        updated_at: '2019-12-13T16:40:33.400Z',
        created_by: 'elastic',
        description: 'Detecting root and admin users',
        enabled: true,
        false_positives: [],
        filters: [{ query: { match_phrase: { 'host.name': 'some-host' } } }],
        from: 'now-6m',
        id: '04128c15-0d1b-4716-a4c5-46997ac7f3bd',
        immutable: false,
        index: ['auditbeat-*', 'filebeat-*', 'packetbeat-*', 'winlogbeat-*'],
        interval: '5m',
        rule_id: 'rule-1',
        language: 'kuery',
        output_index: '.siem-signals',
        max_signals: 100,
        risk_score: 50,
        name: 'Detect Root/Admin Users',
        query: 'user.name: root or user.name: admin',
        references: ['http://www.example.com', 'https://ww.example.com'],
        timeline_id: 'some-timeline-id',
        timeline_title: 'some-timeline-title',
        meta: { someMeta: 'someField' },
        severity: 'high',
        updated_by: 'elastic',
        tags: [],
        to: 'now',
        type: 'query',
        threat: [
          {
            framework: 'MITRE ATT&CK',
            tactic: {
              id: 'TA0040',
              name: 'impact',
              reference: 'https://attack.mitre.org/tactics/TA0040/',
            },
            technique: [
              {
                id: 'T1499',
                name: 'endpoint denial of service',
                reference: 'https://attack.mitre.org/techniques/T1499/',
              },
            ],
          },
        ],
        note: '# Investigative notes',
        version: 1,
        lists: [
          {
            field: 'source.ip',
            boolean_operator: 'and',
            values: [
              {
                name: '127.0.0.1',
                type: 'value',
              },
            ],
          },
          {
            field: 'host.name',
            boolean_operator: 'and not',
            values: [
              {
                name: 'rock01',
                type: 'value',
              },
              {
                name: 'mothra',
                type: 'value',
              },
            ],
          },
        ],
      })}\n`,
      exportDetails: `${JSON.stringify({
        exported_count: 1,
        missing_rules: [],
        missing_rules_count: 0,
      })}\n`,
    });
  });

  test('it will export empty rules', async () => {
    const alertsClient = alertsClientMock.create();
    const findResult: FindHit = {
      page: 1,
      perPage: 1,
      total: 0,
      data: [],
    };

    alertsClient.find.mockResolvedValue(findResult);

    const exports = await getExportAll(alertsClient);
    expect(exports).toEqual({
      rulesNdjson: '',
      exportDetails: '{"exported_count":0,"missing_rules":[],"missing_rules_count":0}\n',
    });
  });
});
