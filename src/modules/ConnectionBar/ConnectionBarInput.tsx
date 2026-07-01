import { OID } from 'api/types';
import * as React from 'react';
import { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { useConnectionsByType } from 'store/connectionTypes';
import { getCrossId, getOId } from 'utils/api.sanitizer';
import { ConnectionBar, ConnectionBarProps } from './ConnectionBar';

interface ConnectionBarInputProps<T>
  extends Omit<ConnectionBarProps<T>, 'connections'> {
  value: OID;
  connectionType: string;
  label?: string;
  useNewConnectionBar?: boolean;
  dataSourceId: string;
  type?: 'source' | 'target';
  children?: React.ReactNode;
}

export function ConnectionBarInput({
  value,
  connectionType,
  dataSourceId,
  useNewConnectionBar = false,
  type,
  ...connectionBarProps
}: ConnectionBarInputProps<any>) {
  const { connections, loading } = useConnectionsByType(connectionType);
  const findConnection = useConnectionFinder(
    connections,
    useNewConnectionBar,
    type,
  );

  return (
    <ConnectionBar
      useNewConnectionBar={useNewConnectionBar}
      connections={connections}
      connectionType={connectionType}
      dataSourceId={dataSourceId}
      selectedConnection={findConnection(getOId(value))}
      isDisabled={loading || connectionBarProps.isDisabled}
      isLoading={loading}
      {...connectionBarProps}
    />
  );
}

export const useConnectionFinder = (connections, useNewConnectionBar, type) => {
  const formApi = useFormContext();
  const connectionFromRiverResponse = useMemo(
    () =>
      formApi && {
        connection_name: formApi.watch(
          `river.properties.${type}.connection_name`,
        ),
        cross_id: {
          $oid: formApi.watch(`river.properties.${type}.connection_id`),
        },
      },
    [formApi, type],
  );
  return React.useCallback(
    (connectionCrossId: string) => {
      if (
        connections?.length === 0 &&
        useNewConnectionBar &&
        Boolean(connectionFromRiverResponse.connection_name)
      ) {
        return connectionFromRiverResponse as any;
      }
      return connections.find(
        connection => getCrossId(connection) === connectionCrossId,
      );
    },
    [connectionFromRiverResponse, connections, useNewConnectionBar],
  );
};
