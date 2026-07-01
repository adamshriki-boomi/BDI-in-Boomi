import { RiverTypes } from 'api/types';
import {
  ComponentsTypes,
  SelectedTarget,
} from 'containers/River/Targets/SelectedTarget';
import { useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useCore } from 'store/core';
import { useGroupsLoader, useGroupsState } from 'store/groups';
import {
  DRAFT_UID,
  isRiverDraft,
  useRiver,
  useRiverActions,
} from 'store/river';
import { getCrossId, getOId } from 'utils/api.sanitizer';

/**
 * RiverLoader: MAIN HOOK
 * FETCH a river - OR - CREATE a draft river by params
 * and loads that rive into the store->river
 */
export function useRiverLoader() {
  useRiverFetcher();
  const buildRiver = useRiverBuilder();
  const { riverType, selectedRiverCrossId } = useRiver();
  const { envId } = useCore();
  useGroupsLoader(envId);
  const { defaultGroup, total: groupsLoaded } = useGroupsState();
  useEffect(() => {
    if (!riverType && groupsLoaded) {
      buildRiver(getCrossId(defaultGroup));
    }
  }, [riverType, buildRiver, defaultGroup, groupsLoaded]);
  return { riverType, crossId: getOId(selectedRiverCrossId) };
}

/**
 * 🧞‍♂️ fetch a river by url param
 */
function useRiverFetcher() {
  const { activeAccountId, envId } = useCore();
  const { fetchRiver, fetchRiverVariables, clear } = useRiverActions();
  const { river: riverId } = useParams<{
    river: string;
  }>();
  const { riverType } = useRiver();

  const areAllParamsValid = [
    activeAccountId,
    envId,
    riverId,
    !isRiverDraft(riverId),
  ].every(Boolean);
  const areAllParamsValidRiverType = [
    activeAccountId,
    envId,
    riverId,
    riverType,
  ].every(Boolean);
  useEffect(() => {
    clear();
    if (areAllParamsValid) {
      fetchRiver(riverId);
    }
  }, [areAllParamsValid, fetchRiver, riverId, envId, clear]);
  useEffect(() => {
    if (areAllParamsValidRiverType && riverType === RiverTypes.LOGIC) {
      fetchRiverVariables(riverId);
    }
  }, [riverType, riverId, areAllParamsValidRiverType, fetchRiverVariables]);
}

/**
 * 🧪 WHY?
 * this hook supports creating a new draft via deep link into rivers/accountid/envid/new/RIVER_TYPE
 */
export function useRiverBuilder() {
  const { type } = useParams<{ type: RiverTypes }>();
  const { setDraftRiver, selectRiver } = useRiverActions();
  const { userMainTarget } = useCore();
  const isNewLogicAsV2 = true; //keep it as a boolean for a while.

  const fields =
    SelectedTarget[userMainTarget]?.[ComponentsTypes.DEFAULT_FIELDS];
  return useCallback(
    (groupId, paramType = null) => {
      const riverType = paramType || type;
      if (riverType) {
        setDraftRiver({
          fields,
          type: riverType,
          groupId,
          userMainTarget,
          isNewLogicAsV2,
        });
        selectRiver(DRAFT_UID);
      }
    },
    [fields, setDraftRiver, type, selectRiver, isNewLogicAsV2, userMainTarget],
  );
}
