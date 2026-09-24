/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import type { PluginInitializerContext } from '@kbn/core/public';
import React, { Suspense } from 'react';
import { EmbeddablePublicPlugin } from './plugin';

export type { DrilldownDefinition, DrilldownEditorProps } from './drilldowns/types';

export { getAddFromLibraryType, useAddFromLibraryTypes } from './add_from_library/registry';
export { PanelNotFoundError, PanelIncompatibleError } from './react_embeddable_system';
export { EmbeddableStateTransfer } from './state_transfer';
export {
  ACTION_EDIT_PANEL,
  ACTION_INSPECT_PANEL,
  ACTION_REMOVE_PANEL,
  EXPORT_ACTION_GROUP,
  isMultiValueClickTriggerContext,
  isRangeSelectTriggerContext,
  isRowClickTriggerContext,
  isValueClickTriggerContext,
} from '@kbn/embeddable-actions';

export type {
  CellValueContext,
  ChartActionContext,
  MultiValueClickContext,
  RangeSelectContext,
  ValueClickContext,
} from '@kbn/embeddable-actions';
export type {
  EmbeddableEditorState,
  EmbeddableEditorBreadcrumb,
  EmbeddablePackageState,
} from './state_transfer';
export type { EmbeddableSetup, EmbeddableStart } from './types';

export {
  EmbeddableRenderer,
  EmbeddableRendererContext,
  PlacementStrategy,
  type DefaultEmbeddableApi,
  type EmbeddablePublicDefinition,
  type LayoutConstraints,
  type QuickActionIds,
} from './react_embeddable_system';

export type { PresentationPanelProps } from './react_embeddable_system/panel_component/types';

export type { DrilldownsManager, HasDrilldowns } from './drilldowns/types';

import type { PresentationPanelErrorProps } from './react_embeddable_system/panel_component/presentation_panel_error';
const LazyPanelError = React.lazy(async () => {
  const { PresentationPanelError } = await import('./async_module');
  return { default: PresentationPanelError };
});
export const PresentationPanelError = (props: PresentationPanelErrorProps) => {
  return (
    <Suspense>
      <LazyPanelError {...props} />
    </Suspense>
  );
};

export async function transformType(type: string) {
  const { transformType: transformTypeFn } = await import('./async_module');
  return transformTypeFn(type);
}

export type { SerializedDrilldowns } from '../server';

export function plugin(initializerContext: PluginInitializerContext) {
  return new EmbeddablePublicPlugin(initializerContext);
}

export {
  ADD_PANEL_ANNOTATION_GROUP,
  ADD_PANEL_LEGACY_GROUP,
  ADD_PANEL_OTHER_GROUP,
  ADD_PANEL_VISUALIZATION_GROUP,
} from '@kbn/embeddable-actions';
