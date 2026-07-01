import { chakra } from '@chakra-ui/react';
import { Flex, RenderGuard } from 'components';
import {
  CustomSelectForm,
  Input,
  InputLabel,
  RadioGroup,
} from 'components/Form';
import { Overlay } from 'modules/SourceTarget/components/OverlayDiv';
import {
  SQLDialects,
  SQLDialectsValues,
} from 'modules/SourceTarget/components/SelectDataTarget/DataTargetSettings/TargetBigQuery';
import { useEffect, useMemo } from 'react';
import { useEffectOnce } from 'react-use';
import { useTableSettings, useTableSettingsFormContext } from '../form.hooks';
import { CommonTableSettings } from './commonSettings';

export enum SplitTypes {
  no_split = "Don't Split",
  record_insert_timestamp = 'TimeStamp',
  expression = 'Expression',
}

export const SplitTablesOptions = {
  [SplitTypes.no_split]: 'no_split',
  [SplitTypes.record_insert_timestamp]: 'record_insert_timestamp',
  [SplitTypes.expression]: 'expression',
};

export const SplitTablesValues = {
  no_split: SplitTypes.no_split,
  record_insert_timestamp: SplitTypes.record_insert_timestamp,
  expression: SplitTypes.expression,
};

export const splitTableRadioOptions = Object.entries(SplitTablesOptions).map(
  ([label, value]) => ({
    label,
    value,
    ariaLabel: `${label}-button`,
  }),
);

// Keep local alias for backward compatibility
const options = splitTableRadioOptions;

export function BigQuerySettings({ targetDefinition }) {
  const { value: partitionType } = useTableSettings(
    'additional_target_settings.partition_type',
  );
  const { value: sqlDialect } = useTableSettings(
    'additional_target_settings.sql_dialect',
  );
  const hasSelectedPartition = useMemo(
    () => partitionType === 'TIMESTAMP',
    [partitionType],
  );
  const mergeMethods =
    sqlDialect === SQLDialectsValues.STANDARD
      ? {
          merge_method: 'table.additional_target_settings.merge_method',
        }
      : {};
  const fieldNames = {
    loading_method: 'table.additional_target_settings.target_loading',
    ordered_merge_key: 'table.additional_target_settings.is_ordered_merge_key',
    order_expression: 'table.additional_target_settings.order_expression',
    ...mergeMethods,
  };
  return (
    <CommonTableSettings
      targetDefinition={targetDefinition}
      fieldNames={fieldNames}
      beforeOverrideOptions={
        <>
          <SplitTables isDisabled={hasSelectedPartition} />
          <SQLSettings targetSqlDialect={targetDefinition?.sql_dialect} />
        </>
      }
    />
  );
}

function SQLSettings({ targetSqlDialect }) {
  const { value: sqlDialect, update: updateSql } = useTableSettings(
    'additional_target_settings.sql_dialect',
  );

  useEffectOnce(() => {
    if (!sqlDialect) {
      if (!targetSqlDialect) {
        updateSql(SQLDialectsValues.STANDARD);
      } else {
        updateSql(targetSqlDialect);
      }
    }
  });

  return (
    <Flex gap={4} pt={2} flexDir="column">
      <SQLDialects onChange={updateSql} value={sqlDialect} />
    </Flex>
  );
}

function SplitTables({ isDisabled }) {
  const { value, update } = useTableSettings(
    'additional_target_settings.split_tables',
  );

  const { value: interval, update: updateInterval } = useTableSettings(
    'additional_target_settings.split_interval',
  );
  const { value: sqlDialect } = useTableSettings(
    'additional_target_settings.sql_dialect',
  );
  const formApi = useTableSettingsFormContext();
  useEffect(() => {
    if (value === SplitTablesValues.record_insert_timestamp && !interval) {
      updateInterval('daily');
    }
  }, [interval, updateInterval, value]);
  const splitExists = value && value !== 'no_split';
  return (
    <RenderGuard
      condition={splitExists || sqlDialect === SQLDialectsValues.LEGACY}
    >
      <Flex flexDir="column" gap={2} py={2} position="relative">
        <RenderGuard condition={isDisabled}>
          <Overlay />
        </RenderGuard>
        <InputLabel variant="semibold" label="Split Tables By" />
        <chakra.fieldset disabled={isDisabled}>
          <RadioGroup
            label=""
            name="split tables"
            values={options}
            checked={(value as any) ?? 'no_split'}
            onChange={v => update(v)}
          />
        </chakra.fieldset>
        {value === SplitTablesOptions.TimeStamp && (
          <CustomSelectForm
            options={splitOptions}
            api={formApi}
            name="table.additional_target_settings.split_interval"
            controlId="split interval"
            isMulti={false}
          />
        )}
        {value === SplitTablesOptions.Expression && (
          <Input
            label={SplitTypes.expression}
            hideLabel
            api={formApi}
            name="table.additional_target_settings.split_data"
            placeholder="Enter Expression"
            chakra
            required={value === SplitTablesValues.expression}
          />
        )}
      </Flex>
    </RenderGuard>
  );
}

export const splitIntervalOptions = [
  { label: 'Hourly', value: 'hourly' },
  { label: 'Daily', value: 'daily' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Yearly', value: 'yearly' },
];

// Keep local alias for backward compatibility
const splitOptions = splitIntervalOptions;

export const partitionGranularityOptions = [
  { label: 'Hour', value: 'HOUR' },
  { label: 'Day', value: 'DAY' },
  { label: 'Month', value: 'MONTH' },
  { label: 'Year', value: 'YEAR' },
];
