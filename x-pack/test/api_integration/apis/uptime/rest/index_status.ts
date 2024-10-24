/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { API_URLS } from '@kbn/synthetics-plugin/common/constants';
import expect from '@kbn/expect';
import { FtrProviderContext } from '../../../ftr_provider_context';

export default function ({ getService }: FtrProviderContext) {
  describe('indexStatus query', () => {
    const supertest = getService('supertest');

    it(`will fetch the index's count`, async () => {
      const apiResponse = await supertest.get(API_URLS.INDEX_STATUS);
      const data = apiResponse.body;
      expect(data).to.eql({
        indexExists: true,
        indices: 'heartbeat-8*,heartbeat-7*,synthetics-*',
      });
    });
  });
}
