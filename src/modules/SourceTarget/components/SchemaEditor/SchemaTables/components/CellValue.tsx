import { IncrementalType } from 'api/types';
import { RenderGuard } from 'components';
import { InputNumber } from 'components/Form/components/Input/InputNumber';
import { IntervalTypes, ITable } from 'modules/SourceTarget/store';
import { useTablePropField } from '../../../form';
import { DateTimePopover } from './DateTimePopover';
import {
  ITableRow,
  TableEditGuard,
  useTableDataHook,
  hasNonNullValues,
} from './TableCells';
import { convertDateToISO } from 'utils/date.utils';
import { useEffect } from 'react';

export function CellValue(props: ITableRow<ITable>) {
  const { table } = useTableDataHook(props);

  let intervalType: IntervalTypes;
  if (table?.incremental_type) {
    intervalType = table.incremental_type;
  } else if (hasNonNullValues(table?.date_range)) {
    intervalType = IncrementalType.DATETIME;
  } else if (hasNonNullValues(table?.epoch)) {
    intervalType = IncrementalType.EPOCH;
  } else if (hasNonNullValues(table?.running_number)) {
    intervalType = IncrementalType.RUNNING_NUMBER;
  }

  const Component = ValueComponents?.[intervalType] ?? null;

  const hasIncrementalConfig = Boolean(
    table?.incremental_type ||
      table?.epoch ||
      table?.running_number ||
      table?.date_range,
  );

  return Component ? (
    <TableEditGuard condition={hasIncrementalConfig} {...(props as any)}>
      <Component {...props} fieldName={IntervalTypeFieldPath?.[intervalType]} />
    </TableEditGuard>
  ) : null;
}

export function SystemVersionCellValue(props: ITableRow<ITable>) {
  const { tableData } = useTableDataHook(props?.cell);
  const isSelected = Boolean(tableData?.is_selected);
  const { source, isPredefined } =
    props?.cell?.column?.getProps?.riverProperties || {};
  const { value: dateRange, update: updateDateRange } = useTablePropField(
    props?.cell?.row?.original,
    'date_range',
    source,
    isPredefined,
  );

  useEffect(() => {
    if (isSelected && (!dateRange || !(dateRange as any)?.start_date)) {
      updateDateRange({
        time_period: 'custom',
        start_date: convertDateToISO(new Date('1900-01-01T00:00:00.000Z')),
        end_date: null,
        days_back: 0,
        utc_offset: 0,
        include_end_value: false,
        split_time_intervals: {},
        update_increment_on_failures: false,
      });
    }
  }, [isSelected, dateRange, updateDateRange]);

  const Component = ValueComponents?.datetime ?? null;

  return Component ? (
    <RenderGuard condition={isSelected}>
      <Component
        {...props}
        fieldName={IntervalTypeFieldPath?.datetime}
        onlyCustom={true}
      />
    </RenderGuard>
  ) : null;
}

export function TableNumber({ fieldName, row, column }) {
  const { source, isPredefined } = column.getProps.riverProperties;
  const { value, update } = useTablePropField(
    row.original,
    `${fieldName}.${column.id}` as any,
    source,
    isPredefined,
  );

  const { value: startValue } = useTablePropField(
    row.original,
    `${fieldName}.start_value` as any,
    source,
    isPredefined,
  );
  return (
    <InputNumber
      min={
        column.condition === 'startValue' || !startValue
          ? 0
          : (startValue as number)
      }
      value={value as any}
      size="sm"
      onChange={v => {
        if (!v) {
          update(null);
        }
        update(JSON.parse(v));
      }}
      aria-label={`${row.original.id} ${column.id}`}
      // {...(!value && { borderColor: 'red.200' })}
    />
  );
}

const ValueComponents: Record<IntervalTypes, any> = {
  runningnumber: TableNumber,
  date: () => 'date',
  datetime: DateTimePopover,
  epoch: TableNumber,
  row_version: () => 'row v',
};

const IntervalTypeFieldPath: Record<IntervalTypes, any> = {
  runningnumber: 'running_number',
  date: null,
  datetime: null,
  epoch: 'epoch',
  row_version: null,
};
