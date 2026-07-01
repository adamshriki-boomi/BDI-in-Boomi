import { shallowEqual, useSelector } from 'react-redux';
import * as selectors from '../river.selectors';

export function useRiver() {
  const state = {
    riverEntities: useSelector(selectors.selectRiverEntities, shallowEqual),
    riverArray: useSelector(selectors.selectRiverArray, shallowEqual),
    total: useSelector(selectors.selectTotalRiver),
    selected: useSelector(selectors.selectSelectedRiver),

    // Selected River State
    selectedRiver: useSelector(selectors.selectSelectedRiver),
    selectedRiverIsDirty: useSelector(selectors.selectSelectedRiverIsDirty),
    selectedRiverName: useSelector(selectors.selectSelectedRiverName),
    riverDescription: useSelector(selectors.selectSelectedRiverDescription),
    selectedLogicSteps: useSelector(selectors.selectRiverLogicSteps),
    selectedRiverCrossId: useSelector(selectors.selectSelectedRiveryCrossID),
    selectedRiverId: useSelector(selectors.selectSelectedRiveryID),
    selectedVariables: useSelector(selectors.selectSelectedRiverVariables),
    initialVariables: useSelector(selectors.selectInitialRiverVariables),
    selectedRiverVersionId: useSelector(selectors.selectSelectedRiverVersionId),
    isVersionMode: useSelector(selectors.selectIsVersionMode),
    isApiV2: useSelector(selectors.selectIsApiV2),
    errorFailRiver: useSelector(selectors.selectErrorFailRiver),
    latestVersion: useSelector(selectors.selectLatestVersion),
    riverBackup: useSelector(selectors.selectCopy),
    dateUpdated: useSelector(selectors.selectDateUpdated),
    definitions: useSelector(selectors.selectDefinitions),
    riverType: useSelector(selectors.selectRiverType),
    errors: useSelector(selectors.selectErrors),
    isRiverValid: useSelector(selectors.selectIsRiverValid),
    isProcessing: useSelector(selectors.selectIsProcessing),
    isReloading: useSelector(selectors.selectIsReloading),
    isPending: useSelector(selectors.selectIsPending),
    findStep: useSelector(selectors.findStep),
    findStepById: useSelector(selectors.findStepById),
    sharedParams: useSelector(selectors.selectSharedParams),
    isSubRiversEnabled: useSelector(selectors.selectIsSubRiversEnabled),
    schedulerAndNotifications: useSelector(
      selectors.riverSchedulerAndNotifications,
    ),
  };

  return state;
}
