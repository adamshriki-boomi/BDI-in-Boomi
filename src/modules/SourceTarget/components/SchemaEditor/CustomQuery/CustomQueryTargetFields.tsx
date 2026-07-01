import { DistributionMethodTypes, SplitTables, TargetTypesV1 } from 'api/types';
import { Flex, RenderGuard, Text } from 'components';
import { CustomSelectForm, Input, SelectFormGroup } from 'components/Form';
import { distributionMethodOptions } from 'containers/River/Targets/TargetRedshift';
import { DistributionMethod as AzureSynapseDistributionMethod } from 'modules/SourceTarget/components/SelectDataTarget/DataTargetSettings/TargetAzureSynapse';
import {
  SQLDialects,
  SQLDialectsValues,
} from 'modules/SourceTarget/components/SelectDataTarget/DataTargetSettings/TargetBigQuery';
import { ReactNode, useEffect, useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useEffectOnce } from 'react-use';
import { compare } from 'utils/array.utils';
import {
  splitIntervalOptions,
  SplitTablesValues,
  SplitTypes,
} from '../SchemaTables/TableSettings/TableTarget/BigQuerySettings';
import { escapeCharactersOptions } from '../SchemaTables/TableSettings/TableTarget/SnowflakeSettings';
import { escapeCharactersOptions as oneLakeEscapeCharactersOptions } from '../SchemaTables/TableSettings/TableTarget/OneLakeSettings';

/**
 * Custom Query Target Fields - renders target-specific fields based on target type
 */
export function CustomQueryTargetFields({
  targetName,
}: {
  targetName?: string;
}) {
  const TargetComponent = targetName
    ? CustomQueryTargetFieldsMap[targetName]
    : null;

  return (
    <RenderGuard condition={Boolean(TargetComponent)}>
      {TargetComponent}
    </RenderGuard>
  );
}

/**
 * Map of target types to their Custom Query specific field components
 */
const CustomQueryTargetFieldsMap: Record<string, ReactNode> = {
  [TargetTypesV1.SNOWFLAKE]: <SnowflakeCustomQueryFields />,
  [TargetTypesV1.ONELAKE]: <OneLakeCustomQueryFields />,
  [TargetTypesV1.BIG_QUERY]: <BigQueryCustomQueryFields />,
  [TargetTypesV1.REDSHIFT]: <RedshiftCustomQueryFields />,
  [TargetTypesV1.AZURE_SQL_DWH]: <AzureSynapseCustomQueryFields />,
};

// ============== SNOWFLAKE ==============
function SnowflakeCustomQueryFields() {
  const formApi = useFormContext();
  const value = useWatch({
    control: formApi.control,
    name: 'river.properties.target.single_table_settings.escape_character',
  });

  return (
    <Flex flexDir="column">
      <Text color="primary" textStyle="M7">
        Support Escape Character
      </Text>
      <SelectFormGroup
        optional
        label="Escape characters allow special characters in strings to be interpreted as literal characters, rather than as control characters."
        options={escapeCharactersOptions}
        controlId="escape character"
        onChange={option => {
          formApi.setValue(
            'river.properties.target.single_table_settings.escape_character',
            option?.value ?? '',
            { shouldDirty: true },
          );
        }}
        value={escapeCharactersOptions.find(compare('value', value))}
        chakra
        isClearable
        backspaceRemovesValue
        aria-label="escape-character"
      />
    </Flex>
  );
}

// ============== ONELAKE ==============
function OneLakeCustomQueryFields() {
  const formApi = useFormContext();
  const value = useWatch({
    control: formApi.control,
    name: 'river.properties.target.single_table_settings.escape_character',
  });

  return (
    <Flex flexDir="column">
      <Text color="primary" textStyle="M7">
        Support Escape Character
      </Text>
      <SelectFormGroup
        optional
        label="Escape characters allow special characters in strings to be interpreted as literal characters, rather than as control characters."
        options={oneLakeEscapeCharactersOptions}
        controlId="escape character"
        onChange={option => {
          formApi.setValue(
            'river.properties.target.single_table_settings.escape_character',
            option?.value ?? '',
            { shouldDirty: true },
          );
        }}
        value={oneLakeEscapeCharactersOptions.find(compare('value', value))}
        chakra
        isClearable
        backspaceRemovesValue
        aria-label="escape-character"
      />
    </Flex>
  );
}

// ============== REDSHIFT ==============
function RedshiftCustomQueryFields() {
  const formApi = useFormContext();
  const value = useWatch({
    control: formApi.control,
    name: 'river.properties.target.single_table_settings.distribution_method',
  });

  return (
    <SelectFormGroup
      optional
      label="Distribution Method"
      options={distributionMethodOptions}
      controlId="distribution method"
      onChange={option => {
        formApi.setValue(
          'river.properties.target.single_table_settings.distribution_method',
          option?.value ?? '',
          { shouldDirty: true },
        );
      }}
      value={distributionMethodOptions.find(compare('value', value))}
      chakra
      isClearable
      backspaceRemovesValue
      defaultValue={distributionMethodOptions[0]}
    />
  );
}

// ============== AZURE SYNAPSE ==============
function AzureSynapseCustomQueryFields() {
  const formApi = useFormContext();
  const value = useWatch({
    control: formApi.control,
    name: 'river.properties.target.single_table_settings.distribution_method',
  });

  useEffectOnce(() => {
    if (!value) {
      formApi.setValue(
        'river.properties.target.single_table_settings.distribution_method',
        DistributionMethodTypes.ROUND_ROBIN,
        { shouldDirty: true },
      );
    }
  });

  return (
    <AzureSynapseDistributionMethod
      onChange={option => {
        formApi.setValue(
          'river.properties.target.single_table_settings.distribution_method',
          option?.value ?? '',
          { shouldDirty: true },
        );
      }}
      value={value}
    />
  );
}

// ============== BIGQUERY ==============
function BigQueryCustomQueryFields() {
  const formApi = useFormContext();
  const splitTables = useWatch({
    control: formApi.control,
    name: 'river.properties.target.single_table_settings.split_tables',
  });
  const partitionType = useWatch({
    control: formApi.control,
    name: 'river.properties.target.single_table_settings.partition_type',
  });

  const hasSelectedSplit = useMemo(
    () => ![undefined, null, 'no'].includes(splitTables as SplitTables),
    [splitTables],
  );

  const hasSelectedPartition = useMemo(
    () => partitionType === 'TIMESTAMP',
    [partitionType],
  );

  return (
    <Flex flexDir="column" gap={4}>
      <BigQuerySplitTables isDisabled={hasSelectedPartition} />
      <BigQuerySQLSettings isDisabled={hasSelectedSplit} />
    </Flex>
  );
}

function BigQuerySplitTables({ isDisabled }: { isDisabled: boolean }) {
  const formApi = useFormContext();
  const splitTables = useWatch({
    control: formApi.control,
    name: 'river.properties.target.single_table_settings.split_tables',
  });
  const splitInterval = useWatch({
    control: formApi.control,
    name: 'river.properties.target.single_table_settings.split_interval',
  });

  useEffect(() => {
    if (
      splitTables === SplitTablesValues.record_insert_timestamp &&
      !splitInterval
    ) {
      formApi.setValue(
        'river.properties.target.single_table_settings.split_interval',
        'daily',
        { shouldDirty: true },
      );
    }
  }, [splitInterval, splitTables, formApi]);

  return (
    <Flex flexDir="column" gap={2} position="relative">
      {splitTables === SplitTables.RECORD && (
        <CustomSelectForm
          options={splitIntervalOptions}
          api={formApi}
          name="river.properties.target.single_table_settings.split_interval"
          controlId="split interval"
          isMulti={false}
        />
      )}
      {splitTables === SplitTables.FORMULA && (
        <Input
          label={SplitTypes.expression}
          hideLabel
          api={formApi}
          name="river.properties.target.single_table_settings.split_data"
          placeholder="Enter Expression"
          chakra
          required={splitTables === SplitTablesValues.expression}
        />
      )}
    </Flex>
  );
}

function BigQuerySQLSettings({ isDisabled }: { isDisabled: boolean }) {
  const formApi = useFormContext();
  const sqlDialect = useWatch({
    control: formApi.control,
    name: 'river.properties.target.single_table_settings.sql_dialect',
  });

  useEffectOnce(() => {
    if (!sqlDialect) {
      formApi.setValue(
        'river.properties.target.single_table_settings.sql_dialect',
        SQLDialectsValues.STANDARD,
        { shouldDirty: true },
      );
    }
  });

  return (
    <Flex gap={4} flexDir="column">
      <SQLDialects
        onChange={v =>
          formApi.setValue(
            'river.properties.target.single_table_settings.sql_dialect',
            v,
            { shouldDirty: true },
          )
        }
        value={sqlDialect}
      />
    </Flex>
  );
}
