import { ExtractMethod, IncrementalType, SourceTypes } from 'api/types';
import { HStack, RiveryInfoTooltip, Text } from 'components';
import { useFormContext } from 'react-hook-form';
import { CellValue, SystemVersionCellValue } from './components/CellValue';
import { TableTargetName } from './components/EditableInput';
import {
  ExtractMethodSelect,
  IncrementalFieldSelect,
  IncrementalTypeSelect,
  StatusCell,
  TableLoadingMode,
  useIncrementColumnDef,
  useTableDataHook,
} from './components/TableCells';
import { TableName } from './components/TableName';
import { TableSingleCheck } from './components/TableSingleCheck';
import { TablesMultiCheck } from './components/TablesMultiCheck';

const endValueConditionId = 'endValue';
const startValueConditionId = 'startValue';

const headerProps = {
  fontWeight: 'medium',
  sx: {
    zIndex: '1 !important',
  },
};

const styleProps = { minH: '46px!important', py: '0px!important' };

const commonColumns = [
  {
    Header: TablesMultiCheck,
    Cell: TableSingleCheck,
    id: 'selected',
    weight: '60px',
    headerProps: {
      position: 'sticky',
      left: 0,
      zIndex: 2,
    },
    styleProps: { ...styleProps, position: 'sticky', left: 0, zIndex: 1 },
  },
  {
    Header: 'Table',
    accessor: 'id',
    Cell: TableName,
    sortBy: 'name',
    sortType: 'string',
    headerProps: {
      position: 'sticky',
      left: '60px',
      zIndex: 2,
    },
    weight: 'minmax(200px, 450px)',
    styleProps: {
      ...styleProps,
      position: 'sticky',
      left: '60px',
      zIndex: 1,
      pr: '50px',
      background: 'white',
    },
  },
  {
    Header: 'Target Table',
    id: 'table-target',
    Cell: TableTargetName,
    weight: 'minmax(200px, 1fr)',
    sortType: 'string',
    headerProps,
    styleProps: { ...styleProps, pr: '50px' },
  },
];

export const cdcColumns: any[] = [
  ...commonColumns,
  {
    Header: 'Loading Mode',
    id: 'target_loading',
    Cell: TableLoadingMode,
    weight: 'minmax(max-content, 1fr)',
    sortType: 'string',
    headerProps,
    styleProps: { ...styleProps, textTransform: 'capitalize' },
  },
  {
    Header: 'Status',
    id: 'status',
    Cell: StatusCell,
    weight: 'minmax(max-content, 1fr)',
    sortType: 'string',
    headerProps,
    styleProps,
  },
];

export const systemVersioningColumns: any[] = [
  ...commonColumns,
  {
    Header: 'Date Range',
    accessor: 'start_value',
    Cell: SystemVersionCellValue,
    /** this is used in StartValueCellWrapper */
    condition: startValueConditionId,
    weight: 'minmax(150px, auto)',
    headerProps,
    styleProps,
  },
  {
    Header: 'Loading Mode',
    id: 'target_loading',
    Cell: TableLoadingMode,
    weight: 'minmax(max-content, 1fr)',
    sortType: 'string',
    headerProps,
    styleProps: { ...styleProps, textTransform: 'capitalize' },
  },
  {
    Header: 'Status',
    id: 'status',
    Cell: StatusCell,
    weight: 'minmax(max-content, 1fr)',
    sortType: 'string',
    headerProps,
    styleProps,
  },
];

export const columns: any[] = [
  ...commonColumns,
  {
    Header: ExtractMethodHeader,
    accessor: 'extract_method',
    Cell: ExtractMethodSelect,
    weight: 'auto',
    headerProps,
    styleProps,
  },
  {
    Header: 'Incremental Field',
    accessor: 'incremental.field',
    Cell: IncrementalFieldSelect,
    weight: 'auto',
    headerProps,
    styleProps,
  },
  {
    Header: 'Incremental Type',
    accessor: 'incremental.type',
    Cell: IncrementalTypeSelect,
    weight: 'auto',
    headerProps,
    styleProps,
  },
  {
    Header: 'Start Value',
    accessor: 'start_value',
    Cell: CellValue,
    CellWrapper: StartValueCellWrapper,
    /** this is used in StartValueCellWrapper */
    condition: startValueConditionId,
    weight: 'minmax(160px, auto)',
    headerProps,
    styleProps,
  },
  {
    Header: 'End Value',
    accessor: 'end_value',
    Cell: CellValue,
    CellWrapper: EndValueCellWrapper,
    /** this is used in EndValueCellWrapper */
    condition: endValueConditionId,
    weight: 'minmax(160px, auto)',
    headerProps,
    styleProps,
  },
  {
    Header: 'Loading Mode',
    id: 'target_loading',
    Cell: TableLoadingMode,
    weight: '200px',
    sortType: 'string',
    headerProps,
    styleProps: { ...styleProps, textTransform: 'capitalize' },
  },
];

const EditableIncrementalType = (rowId: string): boolean => {
  const formApi = useFormContext();
  const table = formApi.watch(`river.properties.schemas.no_schema.${rowId}`);
  // If incremental_type exists, check if it's DATETIME
  if (table?.incremental_type !== undefined) {
    return table.incremental_type === IncrementalType.DATETIME;
  }

  // If date_range exists with values
  if (table?.date_range) {
    return true;
  }

  // If epoch or running_number exists with values
  if (table?.epoch || table?.running_number) {
    return false;
  }

  // Default case
  return true;
};

// Cell Helpers
function EndValueCellWrapper(props) {
  const { cell } = props;
  let shouldHide = useConditionalRender(cell, endValueConditionId);
  const isMongo = cell?.column?.getProps?.source === SourceTypes.MONGO;
  if (isMongo) {
    //TODO change in the future when we have more non RDBMS
    shouldHide = EditableIncrementalType(cell.row.original.id);
  }
  const { table } = useTableDataHook(cell);
  const isNonIncremental = table?.extract_method !== ExtractMethod.INCREMENTAL;
  if (isNonIncremental) {
    const { children, ...restProps } = props;
    return <HStack {...restProps} />;
  }
  return shouldHide ? null : <HStack {...props} />;
}

function StartValueCellWrapper({ cell, children, ...props }) {
  let shouldExpand = useConditionalRender(cell, startValueConditionId);
  const isMongo = cell?.column?.getProps?.source === SourceTypes.MONGO;
  if (isMongo) {
    //TODO change in the future when we have more non RDBMS
    shouldExpand = EditableIncrementalType(cell.row.original.id);
  }
  const { table } = useTableDataHook(cell);
  const isNonIncremental = table?.extract_method !== ExtractMethod.INCREMENTAL;
  if (isNonIncremental) return <HStack {...props} />;
  return (
    <HStack {...props} gridColumn={shouldExpand ? '7 / span 2' : null}>
      {children}
    </HStack>
  );
}

const useConditionalRender = (cell, conditionValue) => {
  const formApi = useFormContext();
  const { table } = useTableDataHook(cell);
  const column = useIncrementColumnDef(cell);
  const isLastColumn = cell.column.condition === conditionValue;
  // If we have a standard column, use its type
  let intervalType = table?.incremental_type ?? column?.incremental_type;
  // If column is custom columns, get type from the form
  if (!column) {
    const rowId = cell?.row?.original?.id;
    const schemaName = cell?.row?.original?.schema_name;
    const tableValues = formApi.watch(
      `river.properties.schemas.${schemaName}.${rowId}`,
    );
    intervalType = tableValues?.incremental_type;
  }

  // Check if it should hide based on interval type
  const shouldHide =
    intervalType === IncrementalType.DATETIME ||
    intervalType === 'date' ||
    table?.date_range;
  return isLastColumn && shouldHide;
};

function ExtractMethodHeader() {
  return (
    <HStack>
      <Text>Extract Method</Text>
      <RiveryInfoTooltip
        buttonProps={{ minW: 0 }}
        iconStyle={{ boxSize: 3 }}
        description={`The “All” option loads all data from a source to the target. The “Incremental” option loads new/updated data, with optional settings for including end values and specifying date ranges, accessible in all Boomi Data Integration modes.`}
      />
    </HStack>
  );
}
