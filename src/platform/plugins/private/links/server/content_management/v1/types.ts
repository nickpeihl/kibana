/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import { TypeOf } from '@kbn/config-schema';
import type {
  ContentManagementCrudTypes,
  SavedObjectCreateOptions,
  SavedObjectUpdateOptions,
} from '@kbn/content-management-utils';
import {
  dashboardLinkOptionsSchema,
  externalLinkOptionsSchema,
  linkSchema,
  linksAttributesSchema,
} from './cm_services';
import {
  CONTENT_ID,
  DASHBOARD_LINK_TYPE,
  EXTERNAL_LINK_TYPE,
  LINKS_HORIZONTAL_LAYOUT,
  LINKS_VERTICAL_LAYOUT,
} from '../../../common/content_management';

export type LinksContentType = typeof CONTENT_ID;
export type LinksAttributes = TypeOf<typeof linksAttributesSchema>;
export type LinkOptions =
  | TypeOf<typeof dashboardLinkOptionsSchema>
  | TypeOf<typeof externalLinkOptionsSchema>;

export type Link = TypeOf<typeof linkSchema>;
export type LinkType = typeof DASHBOARD_LINK_TYPE | typeof EXTERNAL_LINK_TYPE;
export type LinksLayoutType = typeof LINKS_HORIZONTAL_LAYOUT | typeof LINKS_VERTICAL_LAYOUT;

export interface LinksByValueSerializedState {
  attributes: LinksAttributes;
}

export interface LinksByReferenceSerializedState {
  savedObjectId: string;
}

export type LinksSerializedState = LinksByValueSerializedState | LinksByReferenceSerializedState;

export type LinksCrudTypes = ContentManagementCrudTypes<
  LinksContentType,
  Omit<LinksAttributes, 'title'> & { title: string }, // saved object attributes always have a title
  Pick<SavedObjectCreateOptions, 'references'>,
  Pick<SavedObjectUpdateOptions, 'references'>,
  {
    /** Flag to indicate to only search the text on the "title" field */
    onlyTitle?: boolean;
  }
>;
