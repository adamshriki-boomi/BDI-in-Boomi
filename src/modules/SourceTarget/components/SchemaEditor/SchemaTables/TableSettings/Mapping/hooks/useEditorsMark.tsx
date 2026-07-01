import { Icon } from '@chakra-ui/react';
import { CheckmarkSolid, OutlinedSuccess } from 'components';
import { useEffect, useMemo, useState } from 'react';
import { useColumns } from './useColumns';

export const useEditorsMark = (editors, editorType) => {
  const { columns } = useColumns();
  const initialState = useMemo(
    () =>
      Object.keys(editors).reduce((acc, key) => {
        acc[key] = false;
        return acc;
      }, {}),
    [editors],
  );
  const [selectedMark, setSelectedMark] = useState(initialState);
  const keyTypes = Object.keys(editors).map(value => ({
    disabled: value !== 'All Columns' && columns?.length === 0,
    label: value,
    value,
    children: value !== 'All Columns' && (
      <Icon
        as={selectedMark[value] ? CheckmarkSolid : OutlinedSuccess}
        boxSize="14px"
        mr={2}
        color={selectedMark[value] ? 'background-selected' : 'gray.300'}
      />
    ),
  }));

  useEffect(() => {
    if (columns?.length > 0) {
      if (columns.find(column => column.is_key)) {
        setSelectedMark({ ...selectedMark, 'Match Key': true });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columns?.length]);

  return { selectedMark, setSelectedMark, keyTypes };
};
