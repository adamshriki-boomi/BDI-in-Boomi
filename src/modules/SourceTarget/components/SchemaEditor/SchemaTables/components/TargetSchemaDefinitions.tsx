import { storageTargets, TargetTypesV1 } from 'api/types';
import { Flex, HStack, RenderGuard } from 'components';
import { TablePrefixField } from 'modules/SourceTarget/components/SelectDataTarget/DataTargetDefinitions/commonTargetDefinitions';
import { TargetAthena } from 'modules/SourceTarget/components/SelectDataTarget/DataTargetDefinitions/TargetAthena';
import { TargetAzureSQL } from 'modules/SourceTarget/components/SelectDataTarget/DataTargetDefinitions/TargetAzureSQL';
import { TargetAzureSynapse } from 'modules/SourceTarget/components/SelectDataTarget/DataTargetDefinitions/TargetAzureSynapse';
import { TargetBigQuery } from 'modules/SourceTarget/components/SelectDataTarget/DataTargetDefinitions/TargetBigQuery';
import { TargetDatabricks } from 'modules/SourceTarget/components/SelectDataTarget/DataTargetDefinitions/TargetDatabricks';
import { TargetPostgres } from 'modules/SourceTarget/components/SelectDataTarget/DataTargetDefinitions/TargetPostgres';
import { TargetRedshift } from 'modules/SourceTarget/components/SelectDataTarget/DataTargetDefinitions/TargetRedshift';
import { TargetS3 } from 'modules/SourceTarget/components/SelectDataTarget/DataTargetDefinitions/TargetS3';
import { TargetTableName } from '../TableSettings/TableTarget/commonSettings';
import { TargetKnowledgeHub } from 'modules/SourceTarget/components/SelectDataTarget/DataTargetDefinitions/TargetKnowledgeHub';
import { TargetSnowflake } from 'modules/SourceTarget/components/SelectDataTarget/DataTargetDefinitions/TargetSnowflake';
import { TargetOneLake } from 'modules/SourceTarget/components/SelectDataTarget/DataTargetDefinitions/TargetOneLake';
import { DefinitionsCollapse } from './SchemaDefinitionsCollapse';
import { RiverySwitch, SwitchComplexLabel } from 'components/Form';
import { IRiverExtractMethod } from 'modules/SourceTarget/store';
import { EXTRACT_METHOD } from '../../../form/form.consts';
import { useController } from 'react-hook-form';
import { TargetAzureBlob } from 'modules/SourceTarget/components/SelectDataTarget/DataTargetDefinitions/TargetAzureBlob';
import { useCallback } from 'react';
import { useGetTarget } from 'modules/Datasources/useLogicTargets';
import { useIsCustomQuery } from 'modules/SourceTarget/components/form';

function CollapseWrapper({ children, type, showCollapse = true }) {
  return showCollapse ? (
    <DefinitionsCollapse type={type}>
      <Flex gap={4} flexDir="column">
        {children}
      </Flex>
    </DefinitionsCollapse>
  ) : (
    <Flex gap={4} flexDir="column">
      {children}
    </Flex>
  );
}

export function TargetDefinitions({ formApi }) {
  const source = formApi?.watch('river.properties.source');
  const target = formApi?.watch('river.properties.target');
  const isBlueprint = ['Blueprint', 'blueprint_copilot', 'blueprint'].includes(
    source.name,
  );
  const isCustomQuery = useIsCustomQuery();

  const { field: extractMethod } = useController({
    name: EXTRACT_METHOD,
    control: formApi.control,
  });

  const includeSnapshotTable =
    !storageTargets.includes(target.name) &&
    extractMethod.value === IRiverExtractMethod.LOG;

  const selectedTarget = useGetTarget(target?.name);
  const includeSetTargetOrder =
    selectedTarget?.target_settings?.include_set_target_order;

  const hasTargetSpecificDefinitions = Boolean(
    SelectedTargetDefinitions?.[target?.name],
  );

  // For custom query, check if there's any content to show
  // (excluding table prefix which is hidden for custom query)
  const hasContentForCustomQuery =
    includeSnapshotTable ||
    includeSetTargetOrder ||
    isBlueprint ||
    hasTargetSpecificDefinitions;

  // Don't render anything if custom query and no content to show
  if (isCustomQuery && !hasContentForCustomQuery) {
    return null;
  }

  return (
    <CollapseWrapper type="target" showCollapse={!isCustomQuery}>
      <Flex gap={4} flexDir="column">
        <RenderGuard condition={includeSnapshotTable}>
          <SnapshotTableDefinitions formApi={formApi} />
        </RenderGuard>
        <RenderGuard condition={includeSetTargetOrder}>
          <SetTargetOrderField formApi={formApi} />
        </RenderGuard>
        <RenderGuard condition={isBlueprint}>
          <BlueprintDefinitions formApi={formApi} />
        </RenderGuard>
        <RenderGuard condition={!isBlueprint && !isCustomQuery}>
          <TablePrefixField formApi={formApi} />
        </RenderGuard>

        <RenderGuard condition={hasTargetSpecificDefinitions}>
          {SelectedTargetDefinitions[target?.name]}
        </RenderGuard>
      </Flex>
    </CollapseWrapper>
  );
}

function BlueprintDefinitions({ formApi }) {
  const schemas = formApi?.watch('river.properties.schemas');
  const table =
    schemas?.no_schema &&
    Object.keys(schemas.no_schema)?.find(
      table_name => table_name !== 'undefined',
    );
  return (
    <Flex flexDir="column" gap={4}>
      <TargetTableName
        formApi={formApi}
        name={`river.properties.schemas.no_schema.${table}.target_table`}
        isBlueprint
      />
    </Flex>
  );
}

function SnapshotTableDefinitions({ formApi }) {
  return (
    <HStack>
      <RiverySwitch
        api={formApi}
        name="river.properties.source.cdc_settings.include_snapshot_tables"
        label={
          <SwitchComplexLabel
            label="Include Log Snapshot Tables"
            description="For each updated table in its latest version, there will be a CDC table that includes all snapshot changes.."
          />
        }
        leftLabel
        formControlStyle={{ alignItems: 'baseline' }}
        ml="auto"
        defaultChecked={true}
      />
    </HStack>
  );
}

function SetTargetOrderField({ formApi }) {
  const { field: targetAdditionalSettings } = useController({
    name: 'river.properties.target.additional_settings',
    control: formApi.control,
  });

  const onSwitchChange = useCallback(
    ({ target }) => {
      targetAdditionalSettings.onChange({
        ...targetAdditionalSettings.value,
        set_target_order: target.checked,
      });
    },
    [targetAdditionalSettings],
  );

  return (
    <RiverySwitch
      leftLabel
      label={
        <SwitchComplexLabel
          label="Set Target Order"
          description="Maintains the existing column order in your BigQuery table according to the target database."
        />
      }
      formControlStyle={{ alignItems: 'baseline' }}
      isChecked={Boolean(targetAdditionalSettings?.value?.set_target_order)}
      onChange={onSwitchChange}
    />
  );
}

const SelectedTargetDefinitions = {
  [TargetTypesV1.SNOWFLAKE]: <TargetSnowflake />,
  [TargetTypesV1.ONELAKE]: <TargetOneLake />,
  [TargetTypesV1.BIG_QUERY]: <TargetBigQuery />,
  [TargetTypesV1.REDSHIFT]: <TargetRedshift />,
  [TargetTypesV1.ATHENA]: <TargetAthena />,
  [TargetTypesV1.AZURE_SQL]: <TargetAzureSQL />,
  [TargetTypesV1.POSTGRES]: <TargetPostgres />,
  [TargetTypesV1.AZURE_SQL_DWH]: <TargetAzureSynapse />,
  [TargetTypesV1.DATABRICKS]: <TargetDatabricks />,
  [TargetTypesV1.AMAZON_S3]: <TargetS3 />,
  [TargetTypesV1.AZURE_BLOB]: <TargetAzureBlob />,
  [TargetTypesV1.KNOWLEDGE_HUB]: <TargetKnowledgeHub />,
};
