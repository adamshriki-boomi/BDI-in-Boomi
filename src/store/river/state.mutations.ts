import { IRiver } from 'api/types';
import { getCrossId } from 'utils/api.sanitizer';
import { adapter, selectCopy } from './river.selectors';
import { IRiverState, REDUCER_KEY } from './river.types';
import { composeRiver } from './utils/river.mutations';

export function updateRiver(state, action) {
  const isDraft = action.meta.arg;
  if (isDraft) {
    selectRiver(state, getCrossId(action.payload));
  }

  // avoid crashing when an old deep link points to a deleted river
  // FIXME - there should be better way to identify and handle this
  if (action.payload) {
    const isEmptyPayload = Object.keys(action.payload)?.length === 0;
    if (isEmptyPayload) {
      adapter.removeOne(state, action.meta.arg);
    } else {
      upsertRiver(state, action.payload);
    }
  } else {
    console.warn('trying to load a non existing data flow: ', action.meta.arg);
  }
}

export function updateRiverWithoutReload(state, action) {
  upsertRiver(state, action.payload);
}
export function upsertRiver(state, river) {
  adapter.upsertOne(state, composeRiver(river));
}
export function onRestoreRiver(state: IRiverState, action) {
  clearBackup(state);
  upsertRiver(state, action.payload);
}
export function resetRunStatus(state: IRiverState) {
  state.runDetails = {};
  state.runStepsStatus = {};
}
export function selectRiver(state, riverId: string) {
  state.selectedId = riverId;
}
export function setSelectRiverIsDirty(state, isDirty: boolean) {
  state.selectedRiverIsDirty = isDirty;
}
export function setSelectedVariables(state, variables: any) {
  state.selectedVariables = variables;
}
export function setInitialVariables(state, variables: any) {
  state.initialVariables = variables;
}
export function setIsRiverVariablesLoaded(state, isLoaded: boolean) {
  state.isRiverVariablesLoaded = isLoaded;
}
export function setErrorFailRiver(state, errorFailRiver: string) {
  state.errorFailRiver = errorFailRiver;
}
export function toggleRiverVersions(state: IRiverState, show: boolean) {
  state.versions.display = show;
}
export function updateRiverBackup(state: IRiverState, river: IRiver) {
  state.versions.latestRiver = river;
}
export function getRiverCopy(state: IRiverState) {
  return selectCopy({ [REDUCER_KEY]: state });
}
export function clearBackup(state: IRiverState) {
  updateRiverBackup(state, null);
  toggleRiverVersions(state, false);
}

export function updateErrors(state: IRiverState, errors) {
  state.errors = errors;
}

export function clearErrors(state) {
  updateErrors(state, {});
}

export function setRunPending(state: IRiverState, isPending) {
  state.isPending = isPending;
}
