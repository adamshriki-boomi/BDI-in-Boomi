import { DecimalField } from '../../../components/DecimalFields';
import { DistRadio } from '../../../components/DistributionCheck';
import {
  baseColumns,
  headerProps,
} from '../../components/AllColumns/commonColumns';
import { EditColumn } from '../../components/EditColumn';
import { SortOrder } from '../../components/SortOrder';

export const columns: any[] = [
  ...baseColumns,
  {
    Header: 'Length',
    accessor: 'length',
    Cell: DecimalField,
    weight: 'minmax(100px, max-content)',
    headerProps,
  },
  {
    Header: 'Precision',
    accessor: 'precision',
    Cell: DecimalField,
    weight: 'minmax(100px, min-content)',
    headerProps,
  },
  {
    Header: 'Scale',
    accessor: 'scale',
    Cell: DecimalField,
    weight: 'minmax(100px, min-content)',
    headerProps,
  },
  {
    Header: 'Dist.',
    accessor: 'is_dist_key',
    Cell: DistRadio,
    styleProps: { justifyContent: 'center' },
    sortType: 'number',
    weight: '60px',
    headerProps,
  },
  {
    Header: 'Sort',
    accessor: 'sort_order',
    Cell: SortOrder,
    styleProps: { justifyContent: 'center' },
    sortType: 'number',
    weight: 'minmax(80px, min-content)',
    headerProps,
  },
  {
    Header: '',
    id: 'edit-column',
    Cell: EditColumn,
    weight: 'min-content',
  },
];
