import { Text } from 'components';
import { RowIndex } from '../../components/RowIndex';
import { SourceName } from '../../components/SourceName';
import { TableSingleCheck } from '../../components/TableSingleCheck';
import { TargetColumnName } from '../../components/TargetColumnName';
import { TableMultiCheck } from '../TableMultiCheck';

const styleProps = { justifyContent: 'left', px: 4, py: 0 };
export const headerProps = {
  justifyContent: 'left',
  px: 4,
  py: 2,
};

export const baseColumns: any[] = [
  {
    Header: ' ',
    Cell: RowIndex,
    id: 'the_index',
    weight: 'min-content',
    styleProps: {
      borderRight: '1px solid var(--chakra-colors-gray-300)',
    },
  },
  {
    Header: TableMultiCheck,
    id: 'is_selected',
    Cell: TableSingleCheck,
    weight: 'min-content',
  },
  {
    Header: () => <Text pl={8}>Source Column Name / Expression</Text>,
    accessor: 'name',
    Cell: SourceName,
    weight: 'min-content',
    headerProps,
    styleProps,
  },
  {
    Header: 'Target Column Name',
    id: 'alias',
    accessor: 'alias',
    Cell: TargetColumnName,
    weight: 'auto',
    sortType: 'string',
    headerProps,
    styleProps,
  },
  {
    Header: 'Type',
    accessor: 'type',
    weight: 'auto',
    headerProps,
    styleProps,
  },
];
