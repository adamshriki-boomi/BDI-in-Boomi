import { useEffect } from 'react';
import { useGroupsActions } from './useGroupsLoaderActions';

export function useGroupsLoader(envId: string) {
  const { fetchGroups } = useGroupsActions();

  useEffect(() => {
    if (envId) {
      fetchGroups();
    }
  }, [envId, fetchGroups]);
}
