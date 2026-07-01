import { useEffect } from 'react';
import { useConnections } from './useConnections';

export function useConnectionsLoader(accountId, envId) {
  const { fetchConnections, total } = useConnections();

  useEffect(() => {
    if (total === 0) fetchConnections();
  }, [fetchConnections, total]);
}
