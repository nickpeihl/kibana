/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { npSetup, npStart } from 'ui/new_platform';

import { PluginInitializerContext } from '../../../../../src/core/public';
import { plugin } from './';
import { SetupPlugins, StartPlugins } from './plugin';

const pluginInstance = plugin({} as PluginInitializerContext);

pluginInstance.setup(npSetup.core, (npSetup.plugins as unknown) as SetupPlugins);
pluginInstance.start(npStart.core, (npStart.plugins as unknown) as StartPlugins);
