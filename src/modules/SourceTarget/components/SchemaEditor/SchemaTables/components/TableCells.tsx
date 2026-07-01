import { TagLabel } from '@chakra-ui/react';
import { ExtractMethod, IncrementalType, TargetLoading } from 'api/types';
import { Flex, RenderGuard, Tag, Text } from 'components';
import { SelectFormGroup } from 'components/Form';
import { useIsInNewS2TRiver } from 'modules/RiverRightBar';
import { CDCTableStatus } from 'modules/SourceTarget/components/form/form.consts';
import {
  IncrementColumn,
  IReport,
  IReportRow,
  ITable,
} from 'modules/SourceTarget/store';
import { useEffect } from 'react';
import { compare, pluck } from 'utils/array.utils';
import { convertDateToISO } from 'utils/date.utils';
import {
  useMainFormColumnsDefinitions,
  useSchemaTable,
  useSttFormContext,
  useTableField,
  useTablePropField,
} from '../../../form';
import { useGetSchemaTable } from '../rows.state.api';
import { EditableIncrementalType } from '../TableSettings/components';
// No longer need SharedTableDataContext

export interface ITableRow<OriginalType> extends Record<string, any> {
  row: Record<string, any> & { original: OriginalType };
}

export const useIsCustomColumn = (table, original) => {
  const incrementalField = table?.incremental_field;
  return (
    incrementalField &&
    !original?.increment_columns?.some(
      column => column.name === incrementalField,
    )
  );
};

/**
 * guard component to allow render in 'selected' mode only
 */
export function TableEditGuard({
  condition = true,
  children,
  row,
  column: { getProps },
}) {
  const { isPredefined, sourceType: source } = useMainFormColumnsDefinitions();
  const { schemaName, tableName } = useGetSchemaTable(
    row.original,
    source,
    isPredefined,
  );
  const { value: table } = useTableField(schemaName, tableName);
  return Boolean(table?.is_selected) && condition ? children : null;
}

export function ExtractMethodSelect(
  props: ITableRow<ITable> | IReportRow<IReport>,
) {
  const {
    column: {
      getProps: { isDisabled },
    },
    row: { original },
  } = props;
  const { table, update } = useTableDataHook(props);
  const noIncrement = original?.no_increment;
  const incrementRequired = original?.increment_required;
  const selectedValue =
    (noIncrement ? ExtractMethod.ALL : table?.extract_method) ??
    ExtractMethod.ALL;
  const method = extractMethodOptions.find(compare('value', selectedValue));

  return (
    <TableEditGuard {...(props as any)}>
      <RenderGuard
        condition={!isDisabled && !noIncrement && !incrementRequired}
        fallback={
          <span aria-label={`${table?.name} extract method text`}>
            <Text>{method?.label}</Text>
          </span>
        }
      >
        <SelectFormGroup
          options={extractMethodOptions}
          controlId={`select ${table?.name} extract method`}
          onChange={option => {
            return update({
              ...table,
              extract_method: option.value as any,
              ...(option.value === 'all' && {
                incremental_field: null,
                incremental_type: null,
                running_number: null,
                epoch: null,
                date_range: null,
                start_value: undefined,
                end_value: undefined,
              }),
            });
          }}
          formatOptionLabel={({ label }) => (
            <Text textTransform="capitalize">{label}</Text>
          )}
          value={method}
          chakra
          size="sm"
        />
      </RenderGuard>
    </TableEditGuard>
  );
}

// Returns the column to auto-select: the only option if there's one, or the one marked is_default.
function resolveAutoSelectColumn(options, baseOptions) {
  if (options?.length === 1) return options[0];
  return baseOptions.find(col => col.is_default);
}

// Builds the initial date_range from increment_defaults. Returns undefined if already set or no time_period defined.
function buildDefaultDateRange(incrementDefaults, existingDateRange) {
  const { time_period, relative_delta, last_days_back } =
    incrementDefaults ?? {};
  if (existingDateRange || !time_period) return undefined;
  if (time_period === 'date_range') {
    const startDate = new Date();
    if (relative_delta) startDate.setDate(startDate.getDate() - relative_delta);
    return {
      time_period: 'custom',
      start_date: convertDateToISO(startDate),
      end_date: null,
      days_back: last_days_back || 0,
      utc_offset: 0,
    };
  }
  return { time_period, utc_offset: 0, days_back: 0 };
}

const extractMethodOptions = [ExtractMethod.ALL, ExtractMethod.INCREMENTAL].map(
  option => ({
    label: option.charAt(0).toUpperCase() + option.slice(1),
    value: option,
  }),
);

function setIncrementalField(
  update,
  table,
  value,
  incrementColumns = [],
  defaultDateRange?,
) {
  const {
    extract_method,
    is_selected,
    name,
    target_table,
    date_range,
    epoch,
    running_number,
    ...rest
  } = table;

  const fieldName = value?.value ?? value;
  const columnDef = incrementColumns.find(col => col.name === fieldName);

  update({
    ...rest,
    extract_method,
    is_selected,
    name,
    target_table,
    incremental_field: fieldName,
    incremental_type: columnDef?.incremental_type ?? undefined,
    ...(defaultDateRange && { date_range: defaultDateRange }),
    ...(table?.modified_columns && {
      modified_columns: table.modified_columns,
    }),
  });
}

export function IncrementalFieldSelect(
  props: ITableRow<ITable> | IReportRow<IReport>,
) {
  const { original } = props.row;
  const { table, update } = useTableDataHook(props);
  const baseOptions = original?.increment_columns ?? [];
  const customColumns: string[] = table?.custom_increment_columns ?? [];
  const customOptions =
    customColumns?.map(name => ({ name }))?.filter(Boolean) ?? [];

  const options = [
    ...baseOptions,
    ...customOptions.filter(c => !baseOptions?.some(o => o?.name === c?.name)),
  ];

  let incrementValue = options.find(
    option => option.name === table?.incremental_field,
  );

  // If value exists but not in options, add it to options
  if (!incrementValue && table?.incremental_field) {
    const missingOption = { name: table.incremental_field };
    options.push(missingOption);
    incrementValue = missingOption;
  }

  useEffect(() => {
    if (
      table?.is_selected &&
      table.extract_method === ExtractMethod.INCREMENTAL &&
      !table.incremental_field
    ) {
      const autoSelectColumn = resolveAutoSelectColumn(options, baseOptions);
      if (autoSelectColumn) {
        const defaultDateRange = buildDefaultDateRange(
          original?.increment_defaults,
          table.date_range,
        );
        setIncrementalField(
          update,
          table,
          autoSelectColumn.name,
          baseOptions,
          defaultDateRange,
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table?.is_selected, table?.extract_method]);

  return (
    <TableEditGuard
      condition={table?.extract_method === ExtractMethod.INCREMENTAL}
      {...(props as any)}
    >
      <SelectFormGroup
        options={options}
        controlId={`select ${original.id} incremental field`}
        onChange={option => {
          const fieldValue = option?.name ?? option;

          if (!fieldValue) {
            const { date_range, epoch, running_number, ...rest } = table;
            update({
              ...rest,
              incremental_field: null,
              incremental_type: undefined,
            });
          } else {
            setIncrementalField(update, table, fieldValue, baseOptions);
          }
        }}
        onAddOption={(name: string) => {
          if (!name) return;
          const nextCustom = Array.from(
            new Set([...(table?.custom_increment_columns ?? []), name]),
          );
          update({
            ...table,
            custom_increment_columns: nextCustom,
            incremental_field: name,
            incremental_type: undefined,
            ...(table?.modified_columns && {
              modified_columns: table.modified_columns,
            }),
          });
        }}
        selectProps={incSelectProps}
        value={incrementValue}
        placeholder="Select..."
        size="sm"
        chakra
        editableCreate
        withCreate
        isCreatable
        isClearable
        components={{ ClearIndicator: null }}
      />
    </TableEditGuard>
  );
}

const incSelectProps = {
  getOptionLabel: pluck<IncrementColumn, string>('name'),
  getOptionValue: pluck<IncrementColumn, string>('name'),
};

export const useIncrementColumnDef = table => {
  const row = table.row?.original;
  const { source, isPredefined } = table?.column?.getProps?.riverProperties;
  const columns = row?.increment_columns;
  const { value } = useTablePropField(
    row,
    'incremental_field',
    source,
    isPredefined,
  );

  return columns.find(compare('name', value));
};

export function hasNonNullValues(obj: any): boolean {
  return (
    obj &&
    obj !== null &&
    typeof obj === 'object' &&
    Object.keys(obj).some(key => obj[key] !== null)
  );
}

export function IncrementalTypeSelect(props: ITableRow<ITable>) {
  const { table, update } = useTableDataHook(props);
  const columnDef = useIncrementColumnDef(props);

  useEffect(() => {
    if (!table?.incremental_type) {
      let inferredType;

      // First priority: check actual saved data
      if (hasNonNullValues(table?.date_range)) {
        inferredType = IncrementalType.DATETIME;
      } else if (hasNonNullValues(table?.epoch)) {
        inferredType = IncrementalType.EPOCH;
      } else if (hasNonNullValues(table?.running_number)) {
        inferredType = IncrementalType.RUNNING_NUMBER;
      }

      // Second priority: use column definition if no data exists
      if (!inferredType && columnDef?.incremental_type) {
        inferredType = columnDef.incremental_type;
      }

      if (inferredType) {
        update({
          ...table,
          incremental_type: inferredType,
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table?.incremental_field, columnDef?.incremental_type]);

  function onChange(incrementalType: string) {
    let updatedTable;
    if (incrementalType === IncrementalType.DATETIME) {
      updatedTable = {
        ...table,
        incremental_type: incrementalType,
        epoch: null,
        running_number: null,
      };
    } else if (incrementalType === IncrementalType.EPOCH) {
      updatedTable = {
        ...table,
        incremental_type: incrementalType,
        date_range: null,
        running_number: null,
      };
    } else if (incrementalType === IncrementalType.RUNNING_NUMBER) {
      updatedTable = {
        ...table,
        incremental_type: incrementalType,
        date_range: null,
        epoch: null,
      };
    }
    update(updatedTable);
  }

  return (
    <TableEditGuard
      condition={
        Boolean(table?.incremental_field) &&
        table?.extract_method === ExtractMethod.INCREMENTAL
      }
      {...(props as any)}
    >
      {EditableIncrementalType(table, onChange, true)}
    </TableEditGuard>
  );
}

const loadingModeValMap = {
  [TargetLoading.APPEND]: 'Append Only',
  [TargetLoading.MERGE]: 'Upsert Merge',
  [TargetLoading.OVERWRITE]: 'Overwrite',
};

export function TableLoadingMode(table) {
  const { loadingMethod, tableData } = useTableDataHook(table);
  return tableData?.is_selected
    ? loadingModeValMap[
        tableData?.additional_target_settings?.target_loading
      ] ?? (
        <Flex gap={1}>
          {loadingModeValMap[loadingMethod]}
          <Text textStyle="I1" textTransform="lowercase">
            (default)
          </Text>
        </Flex>
      )
    : null;
}

const StatusVariantMap = {
  [CDCTableStatus.WAITING_FOR_SYNC]: 'yellow',
  [CDCTableStatus.WAITING_FOR_MIGRATION]: 'yellow',
  [CDCTableStatus.LIVE]: 'green',
  paused: 'purple',
};

export function StatusCell(table) {
  const formApi = useSttFormContext();
  const isNewRiver = useIsInNewS2TRiver();
  const { defaultMigrationOption, tableData } = useTableDataHook(table);
  const tableStatus = tableData?.table_status;
  const targetDefaultStatus = defaultMigrationOption?.includes('SKIP')
    ? CDCTableStatus.WAITING_FOR_SYNC
    : CDCTableStatus.WAITING_FOR_MIGRATION;
  const value =
    !isNewRiver &&
    formApi?.watch('river.metadata.river_status') === 'disabled' &&
    tableData?.table_status === 'live'
      ? 'paused'
      : tableStatus ?? targetDefaultStatus;
  return tableData?.is_selected ? (
    <Tag variant={StatusVariantMap[value]} size="sm">
      <TagLabel textTransform="capitalize">{value.replace(/_/g, ' ')}</TagLabel>
    </Tag>
  ) : null;
}

export const useTableDataHook = (allTable: ITableRow<ITable>) => {
  // Get shared data from props instead of creating individual useWatch subscriptions
  const { loadingMethod, defaultMigrationOption } =
    allTable?.column?.getProps?.riverProperties;

  const { original } = allTable.row;
  const { source, isPredefined } = allTable?.column?.getProps?.riverProperties;
  const { schemaName, tableName } = useGetSchemaTable(
    original,
    source,
    isPredefined,
  );
  const tableData = useSchemaTable(schemaName, tableName);
  const { value: table, update } = useTableField(schemaName, tableName);
  return { tableData, loadingMethod, defaultMigrationOption, table, update };
};
