import { TableItemProps } from './table.types';

export function TargetColumnName({
  column: {
    getProps: { modifiedColumnsMap },
  },
  row: { original },
}: TableItemProps) {
  const modifiedColumn = modifiedColumnsMap.get(original.name);
  const name = Boolean(modifiedColumn?.alias)
    ? modifiedColumn.alias
    : original.name;
  return name;
}
