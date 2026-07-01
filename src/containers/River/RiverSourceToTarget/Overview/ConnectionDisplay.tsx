import { Box, Flex, Text } from 'components';
import { DataSourceIcon } from 'containers/Activities/components/ActivitiesColumns';
import { SourceToTargetRiverProperties } from 'modules/SourceTarget';
import { useDataSourcesSections } from 'modules/Datasources';
import { ReactNode } from 'react';
import { useHistory } from 'react-router-dom';
import { upsertSearchParam } from 'utils/searchParams';

interface ConnectionDisplayProps {
  type: keyof Pick<SourceToTargetRiverProperties, 'source' | 'target'>;
  connectionType: string;
  connectionHeader: string;
  connectionName: string;
  onChange: (connection: any) => any;
  children?: ReactNode;
}

export function ConnectionDisplay({
  type,
  connectionType,
  connectionHeader,
  connectionName,
  onChange,
  children = null,
}: ConnectionDisplayProps) {
  const {
    replace,
    location: { pathname },
  } = useHistory();

  const { selectedDataSource } = useDataSourcesSections(type, connectionType);

  const displayName = connectionName ?? selectedDataSource?.name;

  return (
    <Flex
      gap={3}
      alignItems="center"
      role="button"
      onClick={() =>
        replace({
          search: upsertSearchParam('tab', type),
          pathname,
        })
      }
    >
      <Box boxSize="48px" p={1} bg="background-secondary" borderRadius={4}>
        <DataSourceIcon type={connectionType} />
      </Box>
      <Text textStyle="M7">{displayName}</Text>
    </Flex>
  );
}
