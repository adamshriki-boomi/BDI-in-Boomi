import { Box, useBoolean } from '@chakra-ui/react';
import { Input } from 'components/Form';
import { ISelectedTable } from 'modules/SourceTarget/store';
import { useState } from 'react';
import { useTablePropField } from '../../../form';
import { useTableDataHook } from './TableCells';

interface EditableInputProps {
  onStateChange: (value: boolean) => any;
  value: any;
  name: keyof ISelectedTable;
  [key: string]: any;
}
function EditableInput({
  onStateChange,
  value,
  name,
  ...table
}: EditableInputProps) {
  const { original } = table.row;
  const { source, isPredefined } = table.column?.getProps?.riverProperties;
  const { value: nameValue, update } = useTablePropField<string>(
    original,
    name,
    source,
    isPredefined,
  );
  const displayValue = nameValue || '';
  const [draft, setDraft] = useState(displayValue);

  return (
    <Input
      aria-label={`${original.id} ${name}`}
      value={draft}
      onBlur={() => {
        if (Boolean(draft) && draft !== displayValue) {
          update(draft);
        }
        onStateChange(false);
      }}
      onChange={ev => setDraft(ev.target.value)}
      chakra
      autoFocus
    />
  );
}

export function TableTargetName(table) {
  const { tableData } = useTableDataHook(table);
  const value = tableData?.target_table;
  const isSelected = Boolean(tableData?.is_selected);
  const [inEditMode, editModeApi] = useBoolean();

  return inEditMode ? (
    <EditableInput
      onStateChange={editModeApi.off}
      value={value}
      name="target_table"
      {...table}
    />
  ) : isSelected ? (
    <Box
      aria-label={`${tableData?.target_table} target_table`}
      role="button"
      alignItems="center"
      cursor="text"
      onClick={editModeApi.on}
      h="32px"
      py="6px"
      whiteSpace="nowrap"
      overflow="hidden"
      textOverflow="ellipsis"
      maxW="150px"
      _hover={{
        border: '1px',
        borderColor: 'primary',
        borderRadius: 4,
        px: 1,
        shadow: 'base',
      }}
    >
      {tableData?.target_table || '...'}
    </Box>
  ) : null;
}
