import { combineReducers } from '@reduxjs/toolkit';
import {
  activitiesApi,
  activitiesSliceApi,
  riverApi,
} from 'containers/Activities';
import { blueprintFilesApi } from 'containers/BluePrints/blueprints.query';
import { riversApi } from 'containers/Rivers/RiversV1/riversV1.query';
import { teamsActionsApi } from 'containers/Settings/Users/teams.query';
import { dsApi } from 'modules';
import { accountsV1Api } from 'modules/AccountPicker';
import { plansApi } from 'modules/Billing';
import { connectionsApi } from 'modules/ConnectionModal';
import { dataframeApi } from 'modules/DataFrames';
import { targetsApi } from 'modules/Datasources/store/targets.query';
import { qualityTestsApi, qualityTestTypesApi } from 'modules/QualityTests';
import actionRivers from './actionRivers';
import connections from './connections';
import connectionTypes from './connectionTypes';
import core from './core';
import { signOut } from './core/core.effects';
import environments from './environments';
import groups from './groups';
import { metadataApi } from './metadata';
import { metadataApiV1 } from './metadata/metadataSvcV1';
import { remoteFileApi } from './remoteFiles';
import { requirementsApi } from './requirements';
import { resourcesApi } from './resources';
import river from './river';
import rivers from './rivers';
import riverTypes from './riverTypes';
import { templatesApi } from './templates';

const stores = {
  core,
  environments,
  rivers,
  actionRivers,
  groups,
  connections,
  river,
  riverTypes,
  connectionTypes,
  activitiesSliceApi,
};

const queryStores = {
  metadataApi,
  dataframeApi,
  remoteFileApi,
  blueprintFilesApi,
  resourcesApi,
  requirementsApi,
  templatesApi,
  qualityTestsApi,
  qualityTestTypesApi,
  plansApi,
  activitiesApi,
  riverApi,
  connectionsApi,
  riversApi,
  dsApi,
  targetsApi,
  accountsV1Api,
  teamsActionsApi,
  metadataApiV1,
};

const reducerKeys = Object.keys(stores);
const queryReducerKeys = Object.keys(queryStores);

const storeReducers = Object.values(stores).reduce(
  (result, store) => ({
    ...result,
    ...store.reducer,
  }),
  {},
);
const queryReducers = Object.values(queryStores).reduce(
  (result, store) => ({
    ...result,
    [store.reducerPath]: store.reducer,
  }),
  {},
);

const appReducers = { ...queryReducers, ...storeReducers };

const createEmptyStore = () => {
  const store = reducerKeys.reduce(
    (result, key) => ({
      ...result,
      [key]: stores[key].initialState ?? { ids: [], entitites: {} },
    }),
    {},
  );
  const queryStore = queryReducerKeys.reduce(
    (result, key) => ({
      ...result,
      [key]: queryStores[key].initialState ?? { ids: [], entities: {} },
    }),
    {},
  );

  return { ...store, ...queryStore };
};

export const appStateReducer = combineReducers(appReducers);
export const appReducer = (state, action) => {
  return action.type === signOut.pending.type
    ? createEmptyStore()
    : appStateReducer(state, action);
};

export type AppState = ReturnType<typeof appReducer>;
