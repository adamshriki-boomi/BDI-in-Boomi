import { TargetTypes } from 'api/types';
import { Box, Divider } from 'components';
import { DataBaseV1Select } from 'containers/River/Targets/components/MetaQuery/DatabaseV1Select';
import { SchemaV1Select } from 'containers/River/Targets/components/MetaQuery/SchemaV1Select';
import { CustomFzTarget } from 'modules/SourceTarget/components/SelectDataTarget/DataTargetSettings/CustomFzTarget';
import { useController, useFormContext } from 'react-hook-form';
import {
  CollapseWrap,
  ReplaceInvalid,
  ReplaceNullValuesField,
  RiveryMetadataField,
  SettingsHeader,
  TruncateColumnsField,
} from './commonTargetSettings';

export function TargetSnowflake({ connectionReady }) {
  const formApi = useFormContext();
  const { field: connectionIdField } = useController({
    name: 'river.properties.target.connection_id',
    control: formApi.control,
  });

  return (
    <>
      <SettingsHeader />
      <Box w="full">
        <DataBaseV1Select
          ariaLabel="database_name"
          name="river.properties.target.database_name"
          connectionId={connectionIdField.value}
          datasource_id={TargetTypes.SNOWFLAKE}
          task_type="target"
          required="Database is required"
          isCreatable
        />
      </Box>
      <Box w="full">
        <SchemaV1Select
          ariaLabel="schema_name"
          name="river.properties.target.schema_name"
          connectionId={connectionIdField.value}
          dependentFields={['database_name']}
          datasource_id={TargetTypes.SNOWFLAKE}
          task_type="target"
          required="Schema is required"
        />
      </Box>
      <CollapseWrap>
        <TruncateColumnsField formApi={formApi} />
        <ReplaceInvalid formApi={formApi} />
        <RiveryMetadataField formApi={formApi} />
        <ReplaceNullValuesField formApi={formApi} />
        <Divider />
        <CustomFzTarget connId={connectionIdField.value} api={formApi} />
      </CollapseWrap>
    </>
  );
}
