import { useEffect } from 'react';
import { useActionRiversActions } from 'store/actionRivers';
import { useRivers } from './useRivers';
import { useRiversActions } from './useRiversActions';

export function useRiversLoader(envId) {
  const { total } = useRivers();
  const { fetchRivers } = useRiversActions();
  const { clear: resetActionRivers } = useActionRiversActions();

  useEffect(() => {
    if (envId) {
      fetchRivers();
      resetActionRivers();
    }
  }, [fetchRivers, total, envId, resetActionRivers]);
}
