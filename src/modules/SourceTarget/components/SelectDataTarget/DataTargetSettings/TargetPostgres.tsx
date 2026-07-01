import { TargetTypesV1 } from 'api/types';
import { Box, Divider, Flex } from 'components';
import { RiverySwitch, SwitchComplexLabel } from 'components/Form';
import { SchemaV1Select } from 'containers/River/Targets/components/MetaQuery/SchemaV1Select';
import { useController, useFormContext } from 'react-hook-form';
import {
  CollapseWrap,
  RiveryMetadataField,
  SettingsHeader,
} from './commonTargetSettings';
import { CustomFzTarget } from './CustomFzTarget';

export function TargetPostgres({ connectionReady }) {
  const formApi = useFormContext();
  const { field: connectionIdField } = useController({
    name: 'river.properties.target.connection_id',
    control: formApi.control,
  });

  const { field: analyzeTableField } = useController({
    name: 'river.properties.target.analyze_table',
    control: formApi.control,
    defaultValue: true,
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
          datasource_id={TargetTypesV1.POSTGRES}
          task_type="target"
          required="Schema is required"
        />
      </Box>
      <CollapseWrap>
        <Flex flexDir="column" gap={4}>
          <RiverySwitch
            formControlStyle={{ alignItems: 'baseline' }}
            isChecked={analyzeTableField.value}
            leftLabel
            ml="auto"
            label={
              <SwitchComplexLabel
                label="Analyze table in Load"
                description="Analyze table after loading"
              />
            }
            onChange={e => {
              formApi.setValue(
                'river.properties.target.analyze_table',
                e.target.checked,
              );
            }}
          />
          <RiveryMetadataField formApi={formApi} />
          <Divider />
          <CustomFzTarget connId={connectionIdField.value} api={formApi} />
        </Flex>
      </CollapseWrap>
    </>
  );
}
