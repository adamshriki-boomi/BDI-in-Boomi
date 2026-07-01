import { Text } from 'components';
import { TableItemProps } from './table.types';

export function SortOrder({
  value,
  row: { original },
  column: {
    getProps: { modifiedColumnsMap },
    id,
  },
}: TableItemProps & any) {
  const customValue = modifiedColumnsMap.get(original.name);
  const displayValue = customValue?.[id] ?? value;

  return (
    <Text aria-label={`cluster ${original.name} ${displayValue}`}>
      {displayValue ?? '-'}
    </Text>
  );
}
