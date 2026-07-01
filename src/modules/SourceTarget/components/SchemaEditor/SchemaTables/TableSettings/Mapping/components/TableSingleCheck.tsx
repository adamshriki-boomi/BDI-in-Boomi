import { RiveryCheckbox } from 'components/Form';
import { useCallback } from 'react';
import { useIsStorageTarget } from 'modules/SourceTarget/components/form';
import { TableItemProps } from './table.types';

export function TableSingleCheck({
  column: {
    getProps: { modifiedColumnsMap, updateColumn, isDisabled },
  },
  row: { original },
}: TableItemProps) {
  const modifiedColumn = modifiedColumnsMap?.get(original.name);
  const isChecked = modifiedColumn
    ? Boolean(modifiedColumn?.is_selected)
    : original?.is_selected ?? true;

  const isStorage = useIsStorageTarget();

  const onChange = useCallback(() => {
    updateColumn(original.name, {
      ...original,
      is_selected: !Boolean(isChecked),
    });
  }, [updateColumn, original, isChecked]);
  return (
    <RiveryCheckbox
      aria-label={`select table`}
      name={`column-is_selected`}
      label={null}
      isChecked={isChecked}
      onChange={onChange}
      isDisabled={isDisabled || isStorage}
    />
  );
}

export function SingleCheck({
  column: {
    getProps: { state, onSelect, onUnselect },
  },
  row: { original },
}: TableItemProps) {
  const isChecked = (state as string[])?.includes(original.name);
  const onChange = useCallback(() => {
    const value = !Boolean(isChecked);
    if (value) {
      onSelect(original.name);
    } else {
      onUnselect(original.name);
    }
  }, [isChecked, onSelect, onUnselect, original.name]);

  return (
    <RiveryCheckbox
      aria-label={`select column ${original.name}`}
      name={`column-is_selected`}
      label={null}
      isChecked={isChecked}
      onChange={onChange}
    />
  );
}
