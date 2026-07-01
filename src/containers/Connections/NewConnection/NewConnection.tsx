import { Text, View } from 'components';
import ConnectionsExplorer from 'containers/Connections/ConnectionsExplorer';
import { useDataSourcesSections } from 'modules';
import React from 'react';

export function NewConnection() {
  const { sections, entities } = useDataSourcesSections('connections');
  return (
    <View header="New Connection">
      <Text fontSize="md" fontWeight="bold" mb={4}>
        Select Data Source Connection
      </Text>
      <Text ml="auto">
        Can't find the source you're looking for? contact us at{' '}
        <a href="mailto:helpme@rivery.io">helpme@rivery.io</a>
      </Text>
      <ConnectionsExplorer
        connections={entities}
        connectionSections={sections}
        onSelect={value => {
          console.log(value);
        }}
      />
    </View>
  );
}
