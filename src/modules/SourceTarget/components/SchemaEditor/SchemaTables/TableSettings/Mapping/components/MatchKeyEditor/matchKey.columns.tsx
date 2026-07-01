import { Flex } from 'components';
import { RowIndex } from '../RowIndex';
import { SingleCheck } from '../TableSingleCheck';
import { ColumnNameKey } from './ColumnNameKey';
import { ExpressionName } from './ExpressionName';

const headerProps = {
  fontWeight: 'medium',
};

export const columns: any[] = [
  {
    Header: ' ',
    Cell: RowIndex,
    id: 'the_index',
    weight: 'min-content',
  },
  {
    Header: 'Choose Columns to move to Match Key',
    id: 'is_selected',
    Cell: CheckboxControl,
    weight: 'min-content',
    headerProps,
  },
  {
    Header: '',
    id: 'tag',
    accessor: 'name',
    Cell: ExpressionName,
    weight: 'auto',
    headerProps,
  },
];

export const matchKeyColumns = [
  {
    Header: '',
    id: 'is_selected',
    Cell: SingleCheck,
    weight: 'min-content',
  },
  {
    Header: 'Match Key Columns',
    accessor: 'name',
    Cell: ColumnNameKey,
    weight: 'auto',
    headerProps,
  },
  {
    Header: '',
    id: 'tag',
    Cell: ExpressionName,
    weight: 'auto',
  },
];

function CheckboxControl(props) {
  return (
    <Flex as="label" alignItems="center" gap="4" cursor="pointer">
      <SingleCheck {...props} />
      {props.row.original?.name}
    </Flex>
  );
}
