/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { EuiLink, EuiText } from '@elastic/eui';
import React from 'react';
import { i18n } from '@kbn/i18n';

interface LocationNameProps {
  location: string | null | undefined;
}
export const LocationName = ({ location }: LocationNameProps) =>
  !!location ? (
    <EuiText>{location}</EuiText>
  ) : (
    <EuiLink
      data-test-subj="syntheticsLocationNameAddLocationLink"
      href="https://www.elastic.co/guide/en/beats/heartbeat/current/configuration-observer-options.html"
      target="_blank"
    >
      {i18n.translate('xpack.synthetics.locationName.helpLinkAnnotation', {
        defaultMessage: 'Add location',
        description:
          'Text that instructs the user to navigate to our docs to add a geographic location to their data',
      })}
    </EuiLink>
  );
