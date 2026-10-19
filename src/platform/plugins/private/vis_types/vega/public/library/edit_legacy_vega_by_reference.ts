/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import type { CoreStart } from '@kbn/core/public';
import { asCodeIdSchema } from '@kbn/as-code-shared-schemas';
import { SavedObjectNotFound } from '@kbn/kibana-utils-plugin/public';
import { apiIsPresentationContainer, hasEditCapabilities } from '@kbn/presentation-publishing';
import type { VisualizeApi } from '@kbn/visualizations-plugin/public';
import { VEGA_EMBEDDABLE_TYPE, VEGA_SUPPORTED_TRIGGERS } from '../../common/constants';
import { fromLegacyVegaVis } from '../../common/from_legacy_vega_vis';
import type { VegaByReferenceState } from '../../server';
import type { VegaPluginStartDependencies } from '../plugin';
import { openVegaLibraryEditor } from './open_vega_library_editor';
import { createVegaLibraryClient } from './vega_library_client';

const libraryItemExists = async (core: CoreStart, id: string) => {
  try {
    await createVegaLibraryClient(core.http).get(id);
    return true;
  } catch (error) {
    if (error instanceof SavedObjectNotFound) return false;
    throw error;
  }
};

/**
 * Edits a by-reference legacy Vega panel as a `vega` library item, and replaces the panel with a
 * by-reference `vega` panel once the item exists. Resolves `false` when the panel should be edited
 * in the Visualize app instead.
 */
export const editLegacyVegaByReference = async (
  core: CoreStart,
  deps: Pick<VegaPluginStartDependencies, 'dataViews' | 'unifiedSearch' | 'savedObjectsTaggingOss'>,
  api: VisualizeApi
): Promise<boolean> => {
  const { parentApi } = api;
  const state = api.serializeState();
  if (
    !apiIsPresentationContainer(parentApi) ||
    !('savedObjectId' in state) ||
    !state.savedObjectId
  ) {
    return false;
  }

  const vis = api.getVis();
  const { savedObjectId, uiState, drilldowns, title, description, ...panelState } = state;
  const replaceWithLibraryItem = (refId: string) =>
    parentApi.replacePanel<VegaByReferenceState>(api.uuid, {
      panelType: VEGA_EMBEDDABLE_TYPE,
      serializedState: {
        ...panelState,
        // The legacy panel stores the visualization's title and description, which the library
        // item now owns.
        ...(title !== vis.title && { title }),
        ...(description !== vis.description && { description }),
        // Legacy Vega only fires the filter trigger, so other drilldowns never ran.
        drilldowns: drilldowns?.filter(({ trigger }) => VEGA_SUPPORTED_TRIGGERS.includes(trigger)),
        ref_id: refId,
      },
    });

  // Reuse the visualization's id so that converting it on other dashboards links the same item.
  const id = asCodeIdSchema.safeParse(savedObjectId).success ? savedObjectId : undefined;

  if (id && (await libraryItemExists(core, id))) {
    const childApi = await parentApi.getChildApi(await replaceWithLibraryItem(id));
    if (hasEditCapabilities(childApi)) await childApi.onEdit();
    return true;
  }

  const created = await openVegaLibraryEditor({
    core,
    deps,
    id,
    data: {
      ...fromLegacyVegaVis(vis.serialize()),
      title: vis.title,
      description: vis.description,
      tags: [],
    },
  });
  if (created) await replaceWithLibraryItem(created.id);
  return true;
};
