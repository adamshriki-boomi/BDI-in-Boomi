import {
  baseColumns,
  headerProps,
} from '../../components/AllColumns/commonColumns';
import { EditColumn } from '../../components/EditColumn';
import { SortOrder } from '../../components/SortOrder';

export const columns: any[] = [
  ...baseColumns,
  {
    Header: 'Mode',
    Cell: ({ value }) => value ?? 'NULLABLE',
    accessor: 'mode',
    weight: 'auto',
    headerProps,
  },
  {
    Header: 'Cluster Key',
    accessor: 'cluster_key',
    Cell: SortOrder,
    styleProps: { justifyContent: 'center' },
    sortType: 'number',
    weight: 'min-content',
    headerProps,
  },
  {
    Header: '',
    id: 'edit-column',
    Cell: EditColumn,
    weight: 'min-content',
  },
];
