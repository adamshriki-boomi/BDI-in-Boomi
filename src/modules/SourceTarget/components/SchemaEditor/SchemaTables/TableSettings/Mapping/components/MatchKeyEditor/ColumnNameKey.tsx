import { Icon, KeyIcon } from 'components';
import { TableItemProps } from '../table.types';

export function ColumnNameKey({
  value,
  row: { original },
  column: {
    getProps: { modifiedColumnsMap },
  },
}: TableItemProps) {
  const isKey = original?.is_key;
  const customValue = modifiedColumnsMap.get(original.name);
  const expression = customValue?.expression;
  const isExpression = Boolean(expression);

  return (
    <>
      <Icon
        as={KeyIcon}
        color={isKey ? 'yellow.300' : 'gray.500'}
        aria-label={`key ${value}`}
        mr="4"
        boxSize="4"
      />
      {value} {isExpression ? `(${expression})` : null}
    </>
  );
}
