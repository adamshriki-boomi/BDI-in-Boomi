import { useEffect, useMemo } from 'react';
import { useActionRiversActions } from 'store/actionRivers';
import { useConnectionTypesActions } from 'store/connectionTypes';
import { useCore } from 'store/core';
import { useGroupsActions } from 'store/groups';
import { useRiversActions } from 'store/rivers';

/**
 * resets selected store's slices when account or env have changed
 */
export function useAccountReset() {
  const { envId, activeAccountId } = useCore();
  const { clear: clearRivers } = useRiversActions();
  const { clear: clearRiverActions } = useActionRiversActions();
  const { clear: clearGroups } = useGroupsActions();
  const { clear: clearConnections } = useConnectionTypesActions();

  const clearActions = useMemo(
    () => [clearRivers, clearRiverActions, clearGroups, clearConnections],
    [clearRiverActions, clearRivers, clearGroups, clearConnections],
  );

  useEffect(() => {
    if (envId && activeAccountId) {
      clearActions.forEach(action => action());
    }
  }, [envId, activeAccountId, clearActions]);
}
