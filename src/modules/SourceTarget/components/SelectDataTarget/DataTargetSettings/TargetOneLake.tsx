import { TargetTypes } from 'api/types';
import { Box, Text } from 'components';
import { WorkspaceV1Select } from 'containers/River/Targets/components/MetaQuery/WorkspaceV1Select';
import { LakehouseV1Select } from 'containers/River/Targets/components/MetaQuery/LakehouseV1Select';
import { SchemaV1Select } from 'containers/River/Targets/components/MetaQuery/SchemaV1Select';
import { CustomFzTarget } from 'modules/SourceTarget/components/SelectDataTarget/DataTargetSettings/CustomFzTarget';
import { useController, useFormContext, useWatch } from 'react-hook-form';
import {
  CollapseWrap,
  RiveryMetadataField,
  SettingsHeader,
} from './commonTargetSettings';

export function TargetOneLake({ connectionReady }) {
  const formApi = useFormContext();
  const { field: connectionIdField } = useController({
    name: 'river.properties.target.connection_id',
    control: formApi.control,
  });

  return (
    <>
      <SettingsHeader />
      <Box w="full">
        <WorkspaceV1Select
          ariaLabel="workspace_name"
          name="river.properties.target.workspace_name"
          connectionId={connectionIdField.value}
          datasource_id={TargetTypes.ONELAKE}
          task_type="target"
          required="Workspace is required"
          isCreatable
        />
      </Box>
      <Box w="full">
        <LakehouseV1Select
          ariaLabel="lakehouse_name"
          name="river.properties.target.lakehouse_name"
          connectionId={connectionIdField.value}
          dependentFieldName="workspace_name"
          datasource_id={TargetTypes.ONELAKE}
          task_type="target"
          required="Lakehouse is required"
          workspaceRequired
        />
      </Box>
      <Box w="full">
        <SchemaV1Select
          ariaLabel="schema_name"
          name="river.properties.target.schema_name"
          connectionId={connectionIdField.value}
          dependentFields={['lakehouse_name', 'workspace_name']}
          datasource_id={TargetTypes.ONELAKE}
          task_type="target"
        />
      </Box>
      <PathPreview />
      <CollapseWrap>
        <RiveryMetadataField formApi={formApi} />
        <CustomFzTarget connId={connectionIdField.value} api={formApi} />
      </CollapseWrap>
    </>
  );
}

function PathPreview() {
  const workspace = useWatch({
    name: 'river.properties.target.workspace_name',
  });
  const lakehouse = useWatch({
    name: 'river.properties.target.lakehouse_name',
  });
  const schema = useWatch({
    name: 'river.properties.target.schema_name',
  });

  const display = (value: any, placeholder: string) => {
    if (!value) return placeholder;
    if (typeof value === 'object') {
      return value.label || value.value || placeholder;
    }
    return String(value);
  };

  const workspaceStr = display(workspace, '<workspace>');
  const lakehouseStr = display(lakehouse, '<lakehouse>');
  const schemaStr = display(schema, '<schema>');

  return (
    <Box w="full" mt={2}>
      <Text textStyle="M7" color="font" mb={1}>
        Target Path Preview
      </Text>
      <Box bg="background-selected-weak" p={3} borderRadius={4}>
        <Text fontFamily="mono" fontSize="sm" wordBreak="break-all">
          OneLake://{workspaceStr}/{lakehouseStr}.Lakehouse/Tables/{schemaStr}
          /&lt;table_name&gt;
        </Text>
      </Box>
      <Text textStyle="R8" color="font-secondary" mt={1}>
        Table names, loading mode, and key column(s) for Merge are configured
        per-table on the Schema tab.
      </Text>
    </Box>
  );
}
