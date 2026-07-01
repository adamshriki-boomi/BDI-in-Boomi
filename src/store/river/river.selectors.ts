import { createEntityAdapter, createSelector } from '@reduxjs/toolkit';
import { IRiver } from 'api/types';
import { AppState } from 'store/reducers';
import { getCrossId, getDate, getOId } from 'utils/api.sanitizer';
import { IRiverState, REDUCER_KEY } from './river.types';
import { getTaskConfig } from './utils/river.mutations';
import { findStepByHash, findStepByStepId } from './utils/steps.builder';

export const adapter = createEntityAdapter<IRiver>({
  selectId: item => getCrossId(item),
});

export const selectors = adapter.getSelectors();

export const selectRiver = (state: AppState): IRiverState => state[REDUCER_KEY];
export const selectRiverEntities = createSelector(
  selectRiver,
  selectors.selectEntities,
);
export const selectRiverArray = createSelector(
  selectRiver,
  selectors.selectAll,
);
export const selectTotalRiver = createSelector(
  selectRiver,
  selectors.selectTotal,
);

// Selected River Selectors
export const selectSelectedRiver = createSelector(selectRiver, state =>
  selectors.selectById(state, state.selectedId),
);
export const selectSelectedRiverIsDirty = createSelector(
  selectRiver,
  state => state.selectedRiverIsDirty,
);
export const selectSelectedRiverConfig = createSelector(
  selectSelectedRiver,
  river => getTaskConfig(river),
);
export const selectRiverLogicSteps = createSelector(
  selectSelectedRiverConfig,
  config => config?.logic_steps,
);
export const selectSelectedRiveryCrossID = createSelector(
  selectSelectedRiver,
  river => river?.cross_id,
);
export const selectSelectedRiveryID = createSelector(
  selectSelectedRiver,
  river => river?._id,
);
export const selectDefinitions = createSelector(
  selectSelectedRiver,
  river => river?.river_definitions,
);
export const selectRiverType = createSelector(
  selectDefinitions,
  definitions => definitions?.river_type,
);
export const selectSelectedRiverName = createSelector(
  selectDefinitions,
  definitions => definitions?.river_name,
);
export const selectSelectedRiverDescription = createSelector(
  selectDefinitions,
  definitions => definitions?.river_desc,
);
export const selectSelectedRiverVersionId = createSelector(
  selectSelectedRiver,
  river => getOId(river?.river_definitions?.version_id),
);
export const selectDateUpdated = createSelector(selectSelectedRiver, river =>
  getDate(river?.river_definitions?.river_date_updated),
);

export const selectSelectedRiverVariables = createSelector(
  selectRiver,
  state => state.selectedVariables,
);
export const selectInitialRiverVariables = createSelector(
  selectRiver,
  state => state.initialVariables,
);
export const selectErrorFailRiver = createSelector(
  selectRiver,
  state => state.errorFailRiver,
);
export const selectRunDetails = createSelector(
  selectRiver,
  state => state?.runDetails,
);

export const selectRunWaiting = createSelector(
  selectRiver,
  state => state?.waitingRun,
);

export const selectIsRunDetailsAvailable = createSelector(
  selectRunDetails,
  runDetails => Boolean(runDetails?.run_id),
);
export const selectRunStepsStatus = createSelector(
  selectRiver,
  state => state?.runStepsStatus,
);
export const selectVersions = createSelector(
  selectRiver,
  state => state?.versions,
);
export const selectIsVersionMode = createSelector(selectVersions, versions =>
  Boolean(versions?.latestRiver),
);
export const selectIsApiV2 = createSelector(selectSelectedRiver, river =>
  Boolean(river?.river_definitions?.is_api_v2),
);
export const selectCopy = createSelector(selectVersions, versions => {
  return versions.latestRiver;
});
export const selectLatestVersion = createSelector(
  selectCopy,
  selectSelectedRiver,
  (riverCopy, currentRiver) => {
    return getOId((riverCopy ?? currentRiver)?.river_definitions.version_id);
  },
);
export const selectErrors = createSelector(selectRiver, state => {
  return state.errors;
});

export const selectIsRiverValid = createSelector(
  selectErrors,
  selectSelectedRiveryCrossID,
  (errors, crossId) => {
    return Object.keys(errors).length === 0;
  },
);

export const selectIsProcessing = createSelector(selectRiver, state => {
  return state.isProcessing;
});

export const selectIsPending = createSelector(selectRiver, state => {
  return state?.isPending;
});

export const selectIsReloading = createSelector(selectRiver, state => {
  return state.isReloading;
});

export const findStep = createSelector(selectRiverLogicSteps, steps => {
  return (hash: string) => findStepByHash(steps, hash);
});
export const findStepById = createSelector(selectRiverLogicSteps, steps => {
  return (hash: string) => findStepByStepId(steps, hash);
});

export const selectSharedParams = createSelector(
  selectSelectedRiver,
  river => river?.river_definitions?.shared_params,
);
export const selectIsSubRiversEnabled = createSelector(
  selectSelectedRiver,
  river => river?.river_definitions?.subrivers?.enabled,
);
export const riverSchedulerAndNotifications = createSelector(
  selectRiver,
  state => state?.riverSchedulerAndNotifications,
);
