import { Text, Flex, RenderGuard, HStack, Icon } from 'components';
import { CustomSelectForm } from 'components/Form';
import { DateRange, IntervalTypes } from 'modules/SourceTarget/store';
import * as React from 'react';
import { useTableSettings, useTableSettingsFormContext } from '../form.hooks';
import { RangeValue } from './RangeValue';
import { DateTimePopover } from '../../components/DateTimePopover';
import { IncrementalType } from 'api/types';
import { Box } from '@chakra-ui/react';
import { useWatch } from 'react-hook-form';
import { useToastComponent } from 'hooks/useToast';
import { CloseBgSolid } from 'components/Icons';
import { useDataSourcesSections } from 'modules/Datasources';
import { useMainRiverFormContext } from 'hooks/useMainRiverFormContext';

interface IntervalFieldControlProps {
  type: IntervalTypes;
  formApi: any;
  isBulk?: boolean;
  isCustomColumn?: boolean;
  bulk?: boolean;
}

const intervalTypeLabel: Record<IntervalTypes | any, any> = {
  runningnumber: 'Running Number',
  epoch: 'Epoch',
  datetime: 'Timestamp',
  date: 'Date',
};

export function IntervalFieldControl({
  type,
  formApi,
  isCustomColumn,
  bulk = false,
}: IntervalFieldControlProps) {
  const { warning } = useToastComponent();
  const table = useWatch({ control: formApi.control, name: 'table' });

  const { update: updateIncType } = useTableSettings('incremental_type');

  function onChange(incrementalType: string) {
    const { date_range, epoch, runningnumber, running_number, ...restOfTable } =
      table;
    if (isCustomColumn) {
      //Checking if the user had selected a custom field which has a matching incremental type on either of the tables
      const selectedTables = formApi?.watch('actions.bulkTablesData');
      const matchingColumn = selectedTables?.flatMap(tableArray =>
        tableArray.flatMap(
          currentTable =>
            currentTable?.increment_columns?.filter(
              col => col.name === table?.incremental_field,
            ) || [],
        ),
      )?.[0];

      if (
        matchingColumn?.incremental_type &&
        matchingColumn?.incremental_type !== incrementalType &&
        bulk
      ) {
        warning({
          duration: 30000,
          title: 'Warning',
          description: `At least one of the selected tables has incremental field "${
            table?.incremental_field
          }" with a different incremental type. 
          Consider preserving the existing type: "${
            intervalTypeLabel[matchingColumn?.incremental_type]
          }"`,
        });
      }
    }
    if (incrementalType === IncrementalType.DATETIME) {
      formApi.setValue('table', {
        ...restOfTable,
        incremental_type: incrementalType,
        date_range: date_range || {},
      });
    } else if (incrementalType === IncrementalType.EPOCH) {
      formApi.setValue('table', {
        ...restOfTable,
        incremental_type: incrementalType,
        epoch: epoch || {},
      });
    } else if (incrementalType === IncrementalType.RUNNING_NUMBER) {
      formApi.setValue('table', {
        ...restOfTable,
        incremental_type: incrementalType,
        running_number: runningnumber || {},
      });
    }
    if (!bulk) {
      updateIncType(incrementalType);
    }
  }
  return EditableIncrementalType(table, onChange, false);
}

const DATETIME_OPTION = { label: 'Timestamp', value: IncrementalType.DATETIME };
const EPOCH_OPTION = { label: 'Epoch', value: IncrementalType.EPOCH };
const RUNNING_NUMBER_OPTION = {
  label: 'Running Number',
  value: IncrementalType.RUNNING_NUMBER,
};

const incrementalTypeOptions = [
  DATETIME_OPTION,
  EPOCH_OPTION,
  RUNNING_NUMBER_OPTION,
];

function determineSelectedType(table) {
  if (table?.incremental_type) {
    if (table.incremental_type === IncrementalType.DATETIME)
      return DATETIME_OPTION;
    if (table.incremental_type === IncrementalType.EPOCH) return EPOCH_OPTION;
    if (table.incremental_type === IncrementalType.RUNNING_NUMBER)
      return RUNNING_NUMBER_OPTION;
  }
  if (
    table?.date_range &&
    Object.keys(table.date_range).some(key => table.date_range[key] !== null)
  ) {
    return DATETIME_OPTION;
  }

  if (
    table?.epoch &&
    Object.keys(table.epoch).some(key => table.epoch[key] !== null)
  ) {
    return EPOCH_OPTION;
  }

  if (
    table?.running_number &&
    Object.keys(table.running_number).some(
      key => table.running_number[key] !== null,
    )
  ) {
    return RUNNING_NUMBER_OPTION;
  }
  return null;
}

export function EditableIncrementalType(
  table,
  onChange: (val: string) => void,
  isTableView: boolean = false,
) {
  const selectedType = determineSelectedType(table);

  const s2tForm = useMainRiverFormContext();
  const sourceName = s2tForm.watch('river.properties.source.name');
  const { selectedDataSource } = useDataSourcesSections('source', sourceName);
  const allowedIncrementalTypes: string[] | undefined =
    selectedDataSource?.feature_flags?.custom_increment_field;
  const filteredOptions = Array.isArray(allowedIncrementalTypes)
    ? incrementalTypeOptions.filter(opt =>
        allowedIncrementalTypes.includes(opt.value),
      )
    : incrementalTypeOptions;
  const Component = ValueEditor?.[selectedType?.value];
  return (
    <Flex gap={2}>
      <Box w={200}>
        <CustomSelectForm
          controlId="incremental_type"
          options={filteredOptions}
          label={isTableView ? '' : 'Incremental Type'}
          isMulti={false}
          value={selectedType}
          onChange={(option: { label: string; value: string }) =>
            onChange(option.value)
          }
          size="sm"
        />
      </Box>
      <RenderGuard condition={!isTableView}>
        {Boolean(Component) && <Component />}
      </RenderGuard>
    </Flex>
  );
}

export function IncrementalTypeText({ type }) {
  return intervalTypeLabel?.[type] ?? null;
}

const ValueEditor: Record<
  IntervalTypes,
  () => JSX.Element | React.ReactNode | any
> = {
  runningnumber: () => (
    <RangeValue
      name="running_number"
      start="start_value"
      end="end_value"
      includeEnd="include_end_value"
    />
  ),
  date: DateTime,
  datetime: DateTime,
  epoch: () => (
    <RangeValue
      name="epoch"
      start="start_value"
      end="end_value"
      includeEnd="include_end_value"
    />
  ),
  row_version: () => 'row version',
};

function DateTime() {
  const { value, update } = useTableSettings<DateRange>('date_range');
  const formApi = useTableSettingsFormContext();
  const error = formApi.formState.errors?.table?.date_range?.start_date;

  return (
    <Flex w="full" flexDir="column">
      <Text fontSize="xs">Start Date</Text>
      <DateTimePopover outerValue={value} setValue={update} />
      {error && (
        <HStack color="red.100" fontSize="xs" mt={1}>
          <Icon as={CloseBgSolid} boxSize={4} />
          <Text>{error.message}</Text>
        </HStack>
      )}
    </Flex>
  );
}
