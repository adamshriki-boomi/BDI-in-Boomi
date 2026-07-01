import {
  baseColumns,
  headerProps,
} from '../../components/AllColumns/commonColumns';
import { EditColumn } from '../../components/EditColumn';
import {
  Partition,
  PartitionGranularitySelect,
} from '../../components/Partition';
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
    Header: 'Partition',
    accessor: 'is_partition',
    Cell: Partition,
    styleProps: { justifyContent: 'center' },
    sortType: 'number',
    weight: 'min-content',
    headerProps,
  },
  {
    Header: 'Partition Granularity',
    accessor: 'partition_granularity',
    Cell: PartitionGranularitySelect,
    styleProps: { justifyContent: 'center' },
    sortType: 'number',
    weight: 'min-content',
    headerProps,
  },
  {
    Header: 'Cluster',
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
