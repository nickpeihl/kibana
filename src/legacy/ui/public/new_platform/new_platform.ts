/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { IScope } from 'angular';

import { UiActionsStart, UiActionsSetup } from 'src/plugins/ui_actions/public';
import { EmbeddableStart, EmbeddableSetup } from 'src/plugins/embeddable/public';
import { createBrowserHistory } from 'history';
import {
  LegacyCoreSetup,
  LegacyCoreStart,
  App,
  AppMountDeprecated,
  ScopedHistory,
} from '../../../../core/public';
import { Plugin as DataPlugin } from '../../../../plugins/data/public';
import {
  setFieldFormats,
  setIndexPatterns,
  setInjectedMetadata,
  setHttp,
  setNotifications,
  setOverlays,
  setQueryService,
  setSearchService,
  setUiSettings,
  // eslint-disable-next-line @kbn/eslint/no-restricted-paths
} from '../../../../plugins/data/public/services';
import { Plugin as ExpressionsPlugin } from '../../../../plugins/expressions/public';
import {
  Setup as InspectorSetup,
  Start as InspectorStart,
} from '../../../../plugins/inspector/public';
import { ChartsPluginSetup, ChartsPluginStart } from '../../../../plugins/charts/public';
import { DevToolsSetup, DevToolsStart } from '../../../../plugins/dev_tools/public';
import { KibanaLegacySetup, KibanaLegacyStart } from '../../../../plugins/kibana_legacy/public';
import { HomePublicPluginSetup } from '../../../../plugins/home/public';
import { SharePluginSetup, SharePluginStart } from '../../../../plugins/share/public';
import {
  AdvancedSettingsSetup,
  AdvancedSettingsStart,
} from '../../../../plugins/advanced_settings/public';
import { ManagementSetup, ManagementStart } from '../../../../plugins/management/public';
import { BfetchPublicSetup, BfetchPublicStart } from '../../../../plugins/bfetch/public';
import { UsageCollectionSetup } from '../../../../plugins/usage_collection/public';
import { TelemetryPluginSetup, TelemetryPluginStart } from '../../../../plugins/telemetry/public';
import {
  NavigationPublicPluginSetup,
  NavigationPublicPluginStart,
} from '../../../../plugins/navigation/public';
import { VisTypeVegaSetup } from '../../../../plugins/vis_type_vega/public';

export interface PluginsSetup {
  bfetch: BfetchPublicSetup;
  charts: ChartsPluginSetup;
  data: ReturnType<DataPlugin['setup']>;
  embeddable: EmbeddableSetup;
  expressions: ReturnType<ExpressionsPlugin['setup']>;
  home: HomePublicPluginSetup;
  inspector: InspectorSetup;
  uiActions: UiActionsSetup;
  navigation: NavigationPublicPluginSetup;
  devTools: DevToolsSetup;
  kibanaLegacy: KibanaLegacySetup;
  share: SharePluginSetup;
  usageCollection: UsageCollectionSetup;
  advancedSettings: AdvancedSettingsSetup;
  management: ManagementSetup;
  visTypeVega: VisTypeVegaSetup;
  telemetry?: TelemetryPluginSetup;
}

export interface PluginsStart {
  bfetch: BfetchPublicStart;
  charts: ChartsPluginStart;
  data: ReturnType<DataPlugin['start']>;
  embeddable: EmbeddableStart;
  expressions: ReturnType<ExpressionsPlugin['start']>;
  inspector: InspectorStart;
  uiActions: UiActionsStart;
  navigation: NavigationPublicPluginStart;
  devTools: DevToolsStart;
  kibanaLegacy: KibanaLegacyStart;
  share: SharePluginStart;
  management: ManagementStart;
  advancedSettings: AdvancedSettingsStart;
  telemetry?: TelemetryPluginStart;
}

export const npSetup = {
  core: (null as unknown) as LegacyCoreSetup,
  plugins: {} as PluginsSetup,
};

export const npStart = {
  core: (null as unknown) as LegacyCoreStart,
  plugins: {} as PluginsStart,
};

/**
 * Only used by unit tests
 * @internal
 */
export function __reset__() {
  npSetup.core = (null as unknown) as LegacyCoreSetup;
  npSetup.plugins = {} as any;
  npStart.core = (null as unknown) as LegacyCoreStart;
  npStart.plugins = {} as any;
  legacyAppRegistered = false;
}

export function __setup__(coreSetup: LegacyCoreSetup, plugins: PluginsSetup) {
  npSetup.core = coreSetup;
  npSetup.plugins = plugins;

  // Setup compatibility layer for AppService in legacy platform
  npSetup.core.application.register = legacyAppRegister;

  // Services that need to be set in the legacy platform since the legacy data plugin
  // which previously provided them has been removed.
  setInjectedMetadata(npSetup.core.injectedMetadata);
}

export function __start__(coreStart: LegacyCoreStart, plugins: PluginsStart) {
  npStart.core = coreStart;
  npStart.plugins = plugins;

  // Services that need to be set in the legacy platform since the legacy data plugin
  // which previously provided them has been removed.
  setHttp(npStart.core.http);
  setNotifications(npStart.core.notifications);
  setOverlays(npStart.core.overlays);
  setUiSettings(npStart.core.uiSettings);
  setFieldFormats(npStart.plugins.data.fieldFormats);
  setIndexPatterns(npStart.plugins.data.indexPatterns);
  setQueryService(npStart.plugins.data.query);
  setSearchService(npStart.plugins.data.search);
}

/** Flag used to ensure `legacyAppRegister` is only called once. */
let legacyAppRegistered = false;

/**
 * Exported for testing only. Use `npSetup.core.application.register` in legacy apps.
 * @internal
 */
export const legacyAppRegister = (app: App<any>) => {
  if (legacyAppRegistered) {
    throw new Error(`core.application.register may only be called once for legacy plugins.`);
  }
  legacyAppRegistered = true;

  require('ui/chrome').setRootController(app.id, ($scope: IScope, $element: JQLite) => {
    const element = $element[0];

    // Root controller cannot return a Promise so use an internal async function and call it immediately
    (async () => {
      const appRoute = app.appRoute || `/app/${app.id}`;
      const appBasePath = npSetup.core.http.basePath.prepend(appRoute);
      const params = {
        element,
        appBasePath,
        history: new ScopedHistory(
          createBrowserHistory({ basename: npSetup.core.http.basePath.get() }),
          appRoute
        ),
        onAppLeave: () => undefined,
      };
      const unmount = isAppMountDeprecated(app.mount)
        ? await app.mount({ core: npStart.core }, params)
        : await app.mount(params);
      $scope.$on('$destroy', () => {
        unmount();
      });
    })();
  });
};

function isAppMountDeprecated(mount: (...args: any[]) => any): mount is AppMountDeprecated {
  // Mount functions with two arguments are assumed to expect deprecated `context` object.
  return mount.length === 2;
}
