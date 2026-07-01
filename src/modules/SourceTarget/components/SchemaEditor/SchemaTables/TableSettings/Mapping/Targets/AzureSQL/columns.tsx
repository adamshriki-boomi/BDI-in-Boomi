import { baseColumns } from '../../components/AllColumns/commonColumns';
import { EditColumn } from '../../components/EditColumn';

export const columns: any[] = [
  ...baseColumns,
  {
    Header: 'Mode',
    Cell: ({ value }) => value ?? 'NULLABLE',
    accessor: 'mode',
    weight: 'auto',
  },
  {
    Header: '',
    id: 'edit-column',
    Cell: EditColumn,
    weight: 'min-content',
  },
];
