import { generatePath } from 'react-router-dom';
import { useCore } from 'store/core';

const RIVER_NEW_PREFIX = 'new';
export const AppRoutes = {
  ROOT: '/',
  ONBOARDING: '/onboarding/:account/:env',
  HOME: '/home/:account/:env',
  DASHBOARD: '/dashboard/:account/:env/dashboard',
  LEGACY_DASHBOARD: '/legacy_dashboard/:account/:env',
  ACTIVITIES_LEGACY: '/legacy_activities/:account/:env/legacy_activities',
  RIVERS: '/rivers/:account/:env',
  RIVER: '/rivers/:account/:env/:river',
  RIVER_SETTINGS: '/rivers/:account/:env/:river/settings',
  RIVER_SOURCE_TO_TARGET_NEW: `/rivers/:account/:env/${RIVER_NEW_PREFIX}/source-to-target`,
  RIVER_ACTION_SELECTOR: `/rivers/:account/:env/action-selector`,
  RIVER_NEW: `/rivers/:account/:env/${RIVER_NEW_PREFIX}/:type`,
  RIVER_SECTION: '/rivers/:account/:env/:river/:section',
  CONNECTIONS: '/connections/:account/:env',
  BETA_CONNECTIONS: '/BETA_connections/:account/:env',
  CONNECTION: '/connection/:account/:env/connection',
  VARIABLES: '/variables/:account/:env/variables',
  USERS: '/users/:account/:env',
  ENVIRONMENTS: '/environments/:account/:env/environments',
  ACTIVITIES: '/activities/:account/:env/activities',
  ACTIVITIES_RIVER_VIEW: '/activities/:account/:env/activities/:river',
  TOKENS: '/tokens/:account/:env',
  SETTINGS: '/settings/:account/:env',
  BILLING: '/billing/:account/:env',
  CONSUMPTION: '/consumption/:account/:env',
  SETTINGS_SECTION: '/settings/:account/:env/:section',
  AUDIT_LOG: '/audit/:account/:env',
  KITS: '/kits/:account/:env',
  BLUEPRINTS: '/blueprints/:account/:env/blueprints',
  SINGLE_BLUEPRINT: '/blueprints/:account/:env/blueprints?blueprint=:blueprint',
};
export const AppParamRoutes = {
  VERSIONS: 'version',
};

export const LegacyRoutes = {
  RIVERS: '/rivers/:account/:env/rivers',
  RIVER: '/river/:account/:env/river/:river',
  RIVER_SETTINGS: '/river/:account/:env/river/:river/settings',
  CREATE_RIVER: '/river/:account/:env/river',
  CONNECTIONS: '/connections/:account/:env/connections',
  SINGLE_CONNECTION: '/connections/:account/:env/:connectionId',
  NEW_CONNECTION: '/connections/:account/:env/new',
};

export const paramsReplacer = (route: string) => params =>
  generatePath(route, params);

export const paramReplacer =
  (route: string) =>
  ({ accountId: account = undefined, envId: env = undefined, ...rest }) =>
    generatePath(route, { account, env, ...rest });

export const RoutesBuilder = {
  dashboard: paramReplacer(AppRoutes.DASHBOARD),
  legacyDashboard: paramReplacer(AppRoutes.LEGACY_DASHBOARD),
  kits: paramReplacer(AppRoutes.KITS),
  createRiverLegacy: paramReplacer(LegacyRoutes.CREATE_RIVER),
  monitoring: paramsReplacer(AppRoutes.ACTIVITIES),
  river: paramsReplacer(AppRoutes.RIVER),
  riverSettings: paramsReplacer(AppRoutes.RIVER_SETTINGS),
  rivers: paramsReplacer(AppRoutes.RIVERS),
  legacyRiver: paramReplacer(LegacyRoutes.RIVER),
  legacyRiverSettings: paramReplacer(LegacyRoutes.RIVER_SETTINGS),
  riverDraft: paramsReplacer(AppRoutes.RIVER_NEW),
  connection: paramsReplacer(LegacyRoutes.SINGLE_CONNECTION),
  users: paramReplacer(AppRoutes.USERS),
  sourceToTarget: paramReplacer(AppRoutes.RIVER_SOURCE_TO_TARGET_NEW),
  newConnection: paramReplacer(LegacyRoutes.NEW_CONNECTION),
  home: paramReplacer(AppRoutes.DASHBOARD),
  blueprints: paramReplacer(AppRoutes.BLUEPRINTS),
  singleBlueprint: paramsReplacer(AppRoutes.SINGLE_BLUEPRINT),
  actions: paramsReplacer(AppRoutes.RIVER_ACTION_SELECTOR),
};

export const useAccountRoute = (urlBuilder, extraParams = {}) => {
  const { activeAccountId: account, envId: env } = useCore();
  return urlBuilder({ account, env, ...extraParams });
};

export const useAccountRouteBuilder = urlBuilder => {
  const { activeAccountId: account, envId: env } = useCore();
  return {
    createUrl: extraParams => urlBuilder({ account, env, ...extraParams }),
  };
};

// route prefixes that are supported by the app
// a route with a prefix that is not included,
// will be recognized as a 404 and will show "not found" component
export const supportedAppRoutes = [
  'dashboard',
  'connections',
  'administration',
  'kits',
  'settings',
  'billing',
  'consumption',
  'river',
  'rivers',
  'users',
  'environments',
  'activities',
  'activities_legacy',
  'variables',
  'tokens',
  'audit',
  'BETA_connections',
  'legacy_activities',
  'legacy_dashboard',
  'home',
  'onboarding',
  'blueprints',
];

export const reactAppRoutes = [
  'dashboard',
  'rivers',
  'connections',
  'settings',
  'billing',
  'consumption',
  'tokens',
  'users',
  'audit',
  'environments',
  'activities',
  'variables',
  'BETA_connections',
  'onboarding',
  'home',
  'blueprints',
];

export const goBack = (defaultPath, history) => {
  //if last page is on the app go back using history otherwise go to default path
  if ((document?.referrer ?? '').indexOf(window.location.host) >= 0) {
    history.goBack();
  } else {
    history.push(defaultPath);
  }
};
