import { IDataSource, IDataSourceConnection } from 'api/types';
import { Box, HStack } from 'components';
import React from 'react';
import { DataSource } from './DataSource';

interface Props extends IDataSource {
  filter?: string;
}

export function DataSourceSection({
  filter,
  section_datasources,
  section_description,
  section_name,
}: Props) {
  return (
    <Box
      py={4}
      borderBottom="1px solid"
      borderBottomColor="gray.300"
      borderTop="1px solid"
      borderTopColor="gray.300"
    >
      <h5>{section_name}</h5>
      <p>{section_description}</p>
      <HStack>
        {section_datasources
          ?.filter(source => includesFilter(source, filter))
          .map(source => (
            <Box width="160px" mr={3} mb={3} key={`ds-connection-${source.id}`}>
              <DataSource {...source} />
            </Box>
          ))}
      </HStack>
    </Box>
  );
}

const includesFilter = (
  { name, description }: IDataSourceConnection,
  filter: string,
) => {
  const normalizedFilter = filter.toLowerCase();
  return [name, description].some(value =>
    value.toLowerCase().includes(normalizedFilter),
  );
};
