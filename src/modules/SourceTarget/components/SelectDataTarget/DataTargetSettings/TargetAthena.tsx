import { TargetTypesV1 } from 'api/types';
import { Box, Divider, Flex } from 'components';
import { Input } from 'components/Form';
import { BucketSelect } from 'containers/River/Targets/components/MetaQuery/BucketSelect';
import { SchemaV1Select } from 'containers/River/Targets/components/MetaQuery/SchemaV1Select';
import { useController, useFormContext } from 'react-hook-form';
import {
  CollapseWrap,
  ReplaceInvalid,
  RiveryMetadataField,
  SettingsHeader,
  TruncateColumnsField,
} from './commonTargetSettings';
import { CustomFzTarget } from './CustomFzTarget';

export function TargetAthena({ connectionReady }) {
  const formApi = useFormContext();
  const { field: connectionIdField } = useController({
    name: 'river.properties.target.connection_id',
    control: formApi.control,
  });

  return (
    <>
      <SettingsHeader />
      <Box w="full">
        <Input
          chakra
          label="File Path Destination"
          api={formApi}
          name="river.properties.target.file_path_destination"
        />
      </Box>
      <Box w="full">
        <BucketSelect
          useFormApi={formApi}
          name="river.properties.target.bucket_name"
          datasource_id={TargetTypesV1.ATHENA}
          task_type="target"
          required
        />
      </Box>
      <Box w="full">
        <SchemaV1Select
          ariaLabel="schema_name"
          name="river.properties.target.schema_name"
          connectionId={connectionIdField.value}
          useFormApi={formApi}
          datasource_id={TargetTypesV1.ATHENA}
          task_type="target"
          required="Schema is required"
        />
      </Box>
      <CollapseWrap>
        <Flex flexDir="column" gap={4}>
          <TruncateColumnsField formApi={formApi} />
          <ReplaceInvalid formApi={formApi} />
          <RiveryMetadataField formApi={formApi} />
          <Divider />
          <CustomFzTarget connId={connectionIdField.value} api={formApi} />
        </Flex>
      </CollapseWrap>
    </>
  );
}
