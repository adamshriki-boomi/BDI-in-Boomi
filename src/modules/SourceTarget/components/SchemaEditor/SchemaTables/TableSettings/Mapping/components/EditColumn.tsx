import { ChevronRight, Icon, TooltipIconButton } from 'components';
import { TableItemProps } from './table.types';

export function EditColumn({
  row: { original },
  column: {
    onOpenEditor,
    openEditor,
    getProps: { modifiedColumnsMap, isDisabled },
  },
}: TableItemProps) {
  const isExpanded = openEditor?.name === original?.name;

  return (
    <TooltipIconButton
      bg="transparent"
      tooltip="View More"
      icon={<Icon as={ChevronRight} boxSize={5} />}
      aria-label={`edit column ${original.name}`}
      borderRadius="full"
      isDisabled={isDisabled}
      onClick={() => {
        if (isExpanded) {
          onOpenEditor(undefined);
        } else {
          onOpenEditor(
            modifiedColumnsMap.get(original.name) ?? (original as any),
          );
        }
      }}
    />
  );
}
