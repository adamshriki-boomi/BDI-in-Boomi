import { DeleteIcon, Icon, IconButton } from 'components';

interface DeleteColumnProps {
  row: { original: { name: string } };
  column: {
    getProps: {
      removeColumn: (name: string) => void;
      isDisabled?: boolean;
    };
  };
}

/**
 * Delete button column for removing a row from the mapping.
 * Only used in custom query context.
 */
export function DeleteColumn({ row, column }: DeleteColumnProps) {
  const { removeColumn, isDisabled } = column.getProps;
  const columnName = row.original.name;

  const handleDelete = () => {
    removeColumn(columnName);
  };

  return (
    <IconButton
      aria-label={`Delete column ${columnName}`}
      icon={<Icon as={DeleteIcon} boxSize={4} />}
      variant="text"
      size="sm"
      colorScheme="danger"
      onClick={handleDelete}
      isDisabled={isDisabled}
      _active={{ bg: 'transparent' }}
      _focus={{ bg: 'transparent' }}
      _pressed={{ bg: 'transparent' }}
    />
  );
}
