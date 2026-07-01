import { TargetTypesV1 } from 'api/types';
import { Box, Divider, Flex } from 'components';
import { SelectFormGroup } from 'components/Form';
import { SchemaV1Select } from 'containers/River/Targets/components/MetaQuery/SchemaV1Select';
import { distributionMethodOptions } from 'containers/River/Targets/TargetAzureSynapse';
import { useController, useFormContext } from 'react-hook-form';
import { compare } from 'utils/array.utils';
import {
  CollapseWrap,
  RiveryMetadataField,
  SettingsHeader,
} from './commonTargetSettings';
import { CustomFzTarget } from './CustomFzTarget';

export function TargetAzureSynapse({ connectionReady }) {
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
          datasource_id={TargetTypesV1.AZURE_SQL_DWH}
          task_type="target"
          required="Schema is required"
        />
      </Box>
      <TableTypeSelect formApi={formApi} />

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

const tableTypeOptions = [
  { label: 'Column Store', value: 'columnstore' },
  { label: 'Row Store', value: 'rowstore' },
];

function TableTypeSelect({ formApi }) {
  const { field } = useController({
    name: 'river.properties.target.table_type',
    control: formApi.control,
    defaultValue: tableTypeOptions[0].value,
  });

  return (
    <SelectFormGroup
      label="Table Type"
      options={tableTypeOptions}
      controlId="table-type"
      value={tableTypeOptions.find(opt => opt.value === field.value) || null}
      onChange={(option: any) => field.onChange(option?.value ?? '')}
      chakra
      isClearable
      backspaceRemovesValue
    />
  );
}

export function DistributionMethod({ onChange, value }) {
  return (
    <SelectFormGroup
      label="Distribution Method"
      options={distributionMethodOptions}
      controlId="distribution method"
      onChange={onChange}
      value={distributionMethodOptions?.find(compare('value', value))}
      chakra
      isClearable
      backspaceRemovesValue
      defaultValue={distributionMethodOptions[0]}
    />
  );
}
