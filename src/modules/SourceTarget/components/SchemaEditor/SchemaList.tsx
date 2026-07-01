import { getDataV1 } from 'api/api.proxy';
import {
  Flex,
  Icon,
  InfiniteScrollComponent,
  RdsSchema,
  RdsSchemaSelected,
  RiveryButton,
  Text,
} from 'components';
import { TableFilter } from 'components/RiveryTable/TableFilter';
import { useCallback, useEffect, useState } from 'react';
import { SchemaItem } from '../../store/schemas.types';
import { useSchemaField } from '../form';
import { useGetSchemaTableNameCaption } from '../../hooks';

interface SchemaListProps {
  onChange: (schema: SchemaItem) => any;
  selectedSchema: string;
  reloadSchemas: any;
  data: any;
  searchValue: string;
  setQuery: (val: string) => void;
}
export function SchemaList({
  selectedSchema,
  onChange,
  reloadSchemas,
  data,
  searchValue,
  setQuery,
}: SchemaListProps) {
  const { schemaNameCaption } = useGetSchemaTableNameCaption();
  const [schemas, setSchemas] = useState<Record<string, any>>({
    schemas: null,
    next_page: null,
  });
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (data?.items?.length) {
      setSchemas({ schemas: data.items, next_page: data.next_page });
    }
  }, [data, searchValue]);

  useEffect(() => {
    if (data && !Boolean(data.items.length) && !searchValue) {
      reloadSchemas(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const fetchMoreSchemas = useCallback(async () => {
    setFetching(true);
    await getDataV1(false, schemas.next_page).then(response => {
      if (response?.items) {
        setSchemas(state => {
          const currState = [...state.schemas];
          const schemas = currState.concat(response.items);
          return { schemas, next_page: response.next_page };
        });
      }
      setFetching(false);
    });
  }, [schemas.next_page]);
  return (
    <>
      <TableFilter
        placeholder={`Search ${schemaNameCaption}...`}
        name={`search ${schemaNameCaption}`}
        chakra
        mb="2"
        value={searchValue}
        onFilterChange={val => {
          setQuery(val);
        }}
      />
      <InfiniteScrollComponent
        ariaLabel="sub rivers runs list"
        list={schemas.schemas}
        hasMore={Boolean(schemas?.next_page)}
        fetchMoreData={() => !fetching && fetchMoreSchemas()}
        component={({ item, index }) => (
          <SchemaRow
            value={item}
            isSelected={item.name === selectedSchema}
            onClick={onChange}
          />
        )}
        rowHeight={26}
      />
    </>
  );
}
interface SchemaCheckboxProps {
  value: SchemaItem;
  onClick: (schema: SchemaItem) => any;
  isSelected: boolean;
}
export function SchemaRow({ value, isSelected, onClick }: SchemaCheckboxProps) {
  const schemaName = value.name;
  const displayName = value.display_name ?? schemaName;
  const { value: schema } = useSchemaField(schemaName);

  const tables: any[] = schema ? Object.values(schema) : undefined;
  const hasTables = Boolean(tables);
  const totalTables = hasTables && Object.keys(tables)?.length;
  const selectedTables =
    totalTables > 0 &&
    Object.values(tables).filter(table => Boolean(table?.is_selected));

  const totalSelectedTables = selectedTables?.length ?? 0;
  const isChecked = totalSelectedTables > 0;

  return (
    <RiveryButton
      w="full"
      h="26px"
      size="sm"
      flex="1"
      justifyContent="flex-start"
      borderRadius={0}
      isActive={isSelected}
      colorScheme={isChecked ? 'checked' : 'unset'}
      variant="tree"
      onClick={() => onClick(value)}
      data-group
      leftIcon={
        <Icon as={isChecked ? RdsSchemaSelected : RdsSchema} boxSize="18px" />
      }
      label={
        <Flex justify="space-between" w="full">
          <Text>{displayName}</Text>
          <Flex gap="2px" className="tree-extra-info">
            <Text>{numberFormatter.format(totalSelectedTables)}</Text>
            <Text>/</Text>
            <Text>{value?.tables_count}</Text>
          </Flex>
        </Flex>
      }
      aria-label={displayName}
    />
  );
}

const numberFormatter = Intl.NumberFormat('en-US', {
  minimumIntegerDigits: 1,
});
