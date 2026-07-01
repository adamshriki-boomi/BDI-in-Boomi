import { RiveryCheckbox } from 'components/Form';
import {
  baseColumns,
  headerProps,
} from '../../components/AllColumns/commonColumns';
import { EditColumn } from '../../components/EditColumn';
import { Partition } from '../../components/Partition';
import { TableItemProps } from '../../components/table.types';

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
    accessor: 'partition',
    Cell: Partition,
    styleProps: { justifyContent: 'center' },
    sortType: 'number',
    weight: 'auto',
    headerProps: { ...headerProps, justifyContent: 'center' },
  },
  {
    Header: 'Bucket',
    accessor: 'bucket',
    Cell: Bucket,
    styleProps: { justifyContent: 'center' },
    weight: 'auto',
    headerProps: { ...headerProps, justifyContent: 'center' },
  },
  {
    Header: '',
    id: 'edit-column',
    Cell: EditColumn,
    weight: 'min-content',
  },
];

export function Bucket({
  row: { original },
  column: {
    getProps: { updateColumn },
  },
}: TableItemProps & any) {
  return (
    <RiveryCheckbox
      name={`${original.name}-bucket`}
      label=""
      isChecked={original.bucket}
      onChange={({ target }) =>
        updateColumn(original.name, { ...original, bucket: target.checked })
      }
    />
  );
}
