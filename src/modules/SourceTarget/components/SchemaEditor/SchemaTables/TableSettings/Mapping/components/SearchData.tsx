import { Flex } from 'components';
import { TableFilter } from 'components/RiveryTable/TableFilter';
import { useDebouncedValue } from 'modules/SourceTarget/components/SchemaEditor/useDebouncedValue';
import { useEffect } from 'react';
import ReloadTableMetadata from '../../components/ReloadTableMetadata';

export function SearchData({ onFilterColumns, isPredefined }) {
  const { finalValue: searchValue, value, setQuery } = useDebouncedValue();
  useEffect(() => onFilterColumns(searchValue), [onFilterColumns, searchValue]);

  return (
    <Flex alignItems="center" gap={2}>
      <TableFilter
        onFilterChange={val => {
          setQuery(val);
        }}
        placeholder="Search Columns..."
        chakra
        value={value}
      />
      <ReloadTableMetadata />
    </Flex>
  );
}
