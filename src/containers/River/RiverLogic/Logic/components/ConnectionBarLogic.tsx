import { Box } from '@chakra-ui/react';
import { IConnectionType, ILogicStep } from 'api/types';
import { SelectedTarget } from 'containers/River/Targets/SelectedTarget';
import { ConnectionBar, useStepPropValidationMessage } from 'modules';
import React, { useCallback, useMemo } from 'react';
import { useConnectionsByType } from 'store/connectionTypes';
import { getCrossId, getHashKey, getOId } from 'utils/api.sanitizer';
import { Collapse, DisplayVariantProps } from './Collapse';
import { useStepActions } from './hooks/useStepActions';
import { useTitles } from './hooks/useTitles';

interface ConnectionBarLogicProps extends DisplayVariantProps {
  node: ILogicStep;
}

export function getConnectionDefaults(target, connection) {
  const fields = SelectedTarget[target]?.targetConnectionFields ?? {};
  const defaultValues = Object.entries(fields).reduce((acc, [key, value]) => {
    const defaultValue = connection?.[`default_${value}` as string] ?? '';
    acc[key] = defaultValue;
    return acc;
  }, {});
  return defaultValues;
}

export function ConnectionBarLogic({
  node,
  displayVariant = Collapse.DisplayVariant.DEFAULT,
}: ConnectionBarLogicProps) {
  const {
    content: { block_type, gConnection },
  } = node;
  const hash = getHashKey(node);
  const { updateContent } = useStepActions(hash);

  const { target, connectionHeader } = useTitles(block_type);
  const { connections } = useConnectionsByType(target?.connection_type);
  const selectedConnection = useMemo(
    () =>
      gConnection
        ? connections?.find(
            connection => getCrossId(connection) === getOId(gConnection),
          )
        : null,
    [connections, gConnection],
  );
  const gConnectionMessage = useStepPropValidationMessage(
    hash,
    'content.gConnection',
  );
  const onConnectionChange = useCallback(
    connection => {
      const { cross_id = null } = connection;
      if (cross_id) {
        const defaultValuesFromConnection = getConnectionDefaults(
          target.target_type,
          connection,
        );
        updateContent({
          gConnection: cross_id,
          ...defaultValuesFromConnection,
        });
      }
    },
    [target, updateContent],
  );

  if (displayVariant === Collapse.DisplayVariant.SUMMARY) {
    return null;
  }

  return (
    <Box>
      <ConnectionBar<IConnectionType>
        connections={connections}
        onChange={onConnectionChange}
        selectedConnection={selectedConnection}
        connectionHeader={connectionHeader}
        dataSourceId={target?.target_type}
        connectionType={target?.connection_type}
        validationMessage={gConnectionMessage}
      />
    </Box>
  );
}
