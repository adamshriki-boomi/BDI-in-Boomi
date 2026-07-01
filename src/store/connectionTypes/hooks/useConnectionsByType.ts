import { IConnectionType } from 'api/types';
import { useEffect, useMemo } from 'react';
import { compare } from 'utils/array.utils';
import { useConnectionTypes, useConnectionTypesActions } from '.';

const filterConnections = (connections: IConnectionType[], type: string) => {
  return connections.filter(compare('connection_type', type));
};
/**
 * a utility for fetching connections of type X
 * fetch once and cache when connections don't exist
 * @param connectionType - usually, a content.connection_type value
 */
export function useConnectionsByType(connectionType: string) {
  const { connectionsArray, loading } = useConnectionTypes();
  const { fetchConnectionsByType } = useConnectionTypesActions();
  const connections = useMemo(
    () => filterConnections(connectionsArray, connectionType),
    [connectionType, connectionsArray],
  );
  const isConnectionsAvailable = connections.length > 0;

  useEffect(() => {
    if (!isConnectionsAvailable && connectionType) {
      fetchConnectionsByType(connectionType);
    }
  }, [connectionType, isConnectionsAvailable, fetchConnectionsByType]);

  return { connections, loading };
}

const isTypeExists = (connections: IConnectionType[], type: string) =>
  filterConnections(connections, type)?.length > 0;

export function useConnectionsByTypes(connectionTypes: string[]) {
  const { connectionsArray } = useConnectionTypes();
  const { fetchConnectionsByType } = useConnectionTypesActions();

  const nonExistingTypes = useMemo(
    () =>
      connectionTypes.filter(type => {
        return !isTypeExists(connectionsArray, type);
      }),
    [connectionTypes, connectionsArray],
  );

  useEffect(() => {
    nonExistingTypes.forEach(fetchConnectionsByType);
  }, [nonExistingTypes, fetchConnectionsByType]);

  return connectionsArray;
}
