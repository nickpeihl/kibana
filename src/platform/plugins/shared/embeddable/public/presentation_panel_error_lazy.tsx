/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import React, { Suspense } from 'react';
import type { PresentationPanelErrorProps } from './react_embeddable_system/panel_component/presentation_panel_error';

const LazyPanelError = React.lazy(async () => {
  const { PresentationPanelError } = await import('./async_module');
  return { default: PresentationPanelError };
});

/** Lazily renders PresentationPanelError inside a Suspense boundary. */
export const PresentationPanelError = (props: PresentationPanelErrorProps) => {
  return (
    <Suspense>
      <LazyPanelError {...props} />
    </Suspense>
  );
};
