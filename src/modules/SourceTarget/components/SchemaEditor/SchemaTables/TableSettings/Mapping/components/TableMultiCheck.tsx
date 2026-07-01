import { RiveryCheckbox } from 'components/Form';
import { useCallback } from 'react';
import { useIsStorageTarget } from 'modules/SourceTarget/components/form';
import { TableItemProps } from './table.types';

export function TableMultiCheck({
  column: {
    getProps: { updateManyWithIndividualProps, isDisabled },
    ...table
  },
  ...rest
}: TableItemProps) {
  const isChecked = (table as any).preFilteredRows?.every(row => {
    return row?.original?.is_selected !== false;
  });
  const isIndeterminate =
    (table as any).preFilteredRows?.some(row => {
      return row?.original?.is_selected !== false;
    }) && !isChecked;

  const isStorage = useIsStorageTarget();

  const onChange = useCallback(
    ({ target }) => {
      const rowsToUpdate = (table as any)?.preFilteredRows || [];

      if (rowsToUpdate.length === 0) return;

      // Create updates array with individual properties for each column
      const updates = rowsToUpdate.map(row => ({
        name: row?.original?.name,
        props: {
          ...row?.original,
          is_selected: Boolean(target.checked),
        },
      }));

      // Use the new batch update function that preserves individual properties
      updateManyWithIndividualProps(updates);
    },
    [table, updateManyWithIndividualProps],
  );

  return (
    <RiveryCheckbox
      aria-label={`select all tables`}
      name={`all-column-is_selected`}
      label={null}
      isChecked={isChecked}
      onChange={onChange}
      isDisabled={isDisabled || isStorage}
      isIndeterminate={isIndeterminate}
    />
  );
}
