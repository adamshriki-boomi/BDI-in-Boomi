import { HStack, RiveryInfoTooltip, Text } from 'components';
import { IncrementColumn } from 'modules/SourceTarget/store';
import { CellValue } from '../SchemaTables/components/CellValue';
import { TableTargetName } from '../SchemaTables/components/EditableInput';
import {
  ExtractMethodSelect,
  IncrementalFieldSelect,
  IncrementalTypeSelect,
  useIncrementColumnDef,
} from '../SchemaTables/components/TableCells';
import { TableName } from '../SchemaTables/components/TableName';
import { TableSingleCheck } from '../SchemaTables/components/TableSingleCheck';
import { TablesMultiCheck } from '../SchemaTables/components/TablesMultiCheck';

const endValueConditionId = 'endValue';
const startValueConditionId = 'startValue';

const headerProps = {
  fontWeight: 'medium',
};

export const commonColumns = [
  {
    Header: TablesMultiCheck,
    Cell: TableSingleCheck,
    id: 'selected',
    weight: 'min-content',
  },
  {
    Header: 'Report',
    accessor: 'report_id',
    Cell: TableName,
    sortBy: 'report_name',
    sortType: 'string',
    headerProps,
    weight: 'minmax(max-content, 1fr)',
    // weight: 'auto',
  },
  {
    Header: 'Target Table',
    id: 'table-target',
    Cell: TableTargetName,
    // accessor: 'report_name',
    weight: 'minmax(max-content, 1fr)',
    sortType: 'string',
    headerProps,
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
  },
  {
    Header: 'Incremental Field',
    id: 'interval_filed',
    Cell: IncrementalFieldSelect,
    weight: 'auto',
    headerProps,
  },
  {
    Header: 'Incremental Type',
    accessor: 'incremental.type',
    Cell: IncrementalTypeSelect,
    weight: 'auto',
    headerProps,
  },
  {
    Header: 'Start Value',
    accessor: 'start_value',
    Cell: CellValue,
    CellWrapper: StartValueCellWrapper,
    /** this is used in StartValueCellWrapper */
    condition: startValueConditionId,
    weight: 'auto',
    headerProps,
  },
  {
    Header: 'End Value',
    accessor: 'end_value',
    Cell: CellValue,
    CellWrapper: EndValueCellWrapper,
    /** this is used in EndValueCellWrapper */
    condition: endValueConditionId,
    weight: 'auto',
    headerProps,
  },
];

// Cell Helpers
function EndValueCellWrapper({ cell, ...props }) {
  const shouldHide = useConditionalRender(cell, endValueConditionId);
  return shouldHide ? null : <HStack {...props} />;
}

function StartValueCellWrapper({ cell, ...props }) {
  const shouldExpand = useConditionalRender(cell, startValueConditionId);
  return <HStack {...props} gridColumn={shouldExpand ? '7 / span 2' : null} />;
}

const isIntervalTypeDateTime = interval => interval === 'datetime';
const useConditionalRender = (cell, conditionValue) => {
  const column = useIncrementColumnDef(cell);
  return isAllowed(cell.column.condition, conditionValue, column);
};

const isAllowed = (
  condition: string,
  conditionValue,
  column: IncrementColumn,
) => {
  const isLastColumn = condition === conditionValue;
  const shouldHide = isIntervalTypeDateTime(column?.incremental_type);
  return isLastColumn && shouldHide;
};

function ExtractMethodHeader() {
  return (
    <HStack>
      <Text>Extract Method</Text>
      <RiveryInfoTooltip
        buttonProps={{ minW: 0 }}
        iconStyle={{ boxSize: 3 }}
        description={`The “All” option loads all data from a source to the target. The “Incremental” option loads new/updated data, with optional settings for including end values and specifying date ranges, accessible in all modes.`}
      />
    </HStack>
  );
}
