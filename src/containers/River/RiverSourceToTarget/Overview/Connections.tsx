import { ArrowNarrowRight, Grid, HStack, Icon, Text } from 'components';
import {
  SelectDataTarget,
  SetupDataSource,
  useSttController,
  useSttSchemas,
  useSttSource,
  useSttTarget,
} from 'modules/SourceTarget';
import { ConnectionDisplay } from './ConnectionDisplay';

const useCountTables = () => {
  const schemas = useSttSchemas();
  let count = 0;
  for (let schema in schemas) {
    if (schemas.hasOwnProperty(schema)) {
      count += Object.keys(schemas[schema]).length;
    }
  }
  return count;
};

export function Connections() {
  const source = useSttSource();
  const target = useSttTarget();
  const { field: sourceConnectionField } = useSttController({
    name: 'river.properties.source',
  });

  const { field: targetConnectionField } = useSttController({
    name: 'river.properties.target',
  });

  const tables = useCountTables();

  return (
    <Grid
      gridTemplateColumns="max-content min-content max-content"
      alignItems="center"
      py={4}
      gap="48px"
    >
      <HStack>
        <ConnectionDisplay
          type="source"
          connectionType={source?.name}
          connectionName={source?.connection_name}
          connectionHeader={source?.name}
          onChange={sourceConnectionField.onChange}
        >
          <SetupDataSource />
        </ConnectionDisplay>
        <Text>({tables.toLocaleString()} Tables)</Text>
      </HStack>
      <Icon
        as={ArrowNarrowRight}
        color="purple.200"
        boxSize="4"
        alignSelf="center"
      />

      <ConnectionDisplay
        type="target"
        connectionType={target?.name}
        connectionName={target?.connection_name}
        connectionHeader={target?.name}
        onChange={targetConnectionField.onChange}
      >
        <SelectDataTarget />
      </ConnectionDisplay>
    </Grid>
  );
}
