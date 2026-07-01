import { TargetTypesV1 } from 'api/types';
import { Box, Divider, Flex } from 'components';
import { SchemaV1Select } from 'containers/River/Targets/components/MetaQuery/SchemaV1Select';
import { useController, useFormContext } from 'react-hook-form';
import {
  CollapseWrap,
  RiveryMetadataField,
  SettingsHeader,
} from './commonTargetSettings';
import { CustomFzTarget } from './CustomFzTarget';

export function TargetAzureSQL({ connectionReady }) {
  const formApi = useFormContext();
  const { field: connectionIdField } = useController({
    name: 'river.properties.target.connection_id',
    control: formApi.control,
  });

  return (
    <>
      <SettingsHeader />
      <Box w="full">
        <SchemaV1Select
          ariaLabel="schema_name"
          name="river.properties.target.schema_name"
          connectionId={connectionIdField.value}
          useFormApi={formApi}
          datasource_id={TargetTypesV1.AZURE_SQL}
          task_type="target"
          required="Schema is required"
        />
      </Box>
      <CollapseWrap>
        <Flex flexDir="column" gap={4}>
          <RiveryMetadataField formApi={formApi} />
          <Divider />
          <CustomFzTarget connId={connectionIdField.value} api={formApi} />
        </Flex>
      </CollapseWrap>
    </>
  );
}
