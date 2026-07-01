import {
  Center,
  Flex,
  HStack,
  Icon,
  PageOverlaySpinner,
  RdsSchema,
  RenderGuard,
  RiveryTable,
  Text,
} from 'components';
import { RadioGroup } from 'components/Form';
import { TableFilter } from 'components/RiveryTable/TableFilter';
import { BasicPagination } from 'components/RiveryTable/TablePagination';
import { useGetSchemaTableNameCaption } from 'modules/SourceTarget/hooks';
import { useSttExtractMethod } from 'modules/SourceTarget/components/form';
import { getFilterTablesDisclaimer } from './components/TableDisclaimer';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSortBy } from 'react-table';
import { useDebouncedValue } from '../useDebouncedValue';

interface PaginationParams {
  next_page: string;
  previous_page: string;
}
interface RTKQueryTableProps {
  /* rtk-query interface hook */
  useApiQuery: (params: { searchValue?: string } & TablesParams & unknown) => {
    data: { items: any[] } & PaginationParams;
    isFetching: boolean;
    refetch?: () => void;
    [key: string]: any;
  };
  /* params are sent into the rtk query with the pagination params  */
  apiParams: Record<string, any>;
  /* rivery table columns interface */
  columns: any[];
  resetPaginationKey?: string;
  total?: number;
  /* ids of selected tables for the current schema, used for "show selected" filter */
  selectedTableIds?: string[];
}
/**
 * table with `useRtkQuery` interface
 * each cell gets the `setParams` function which updates the params that
 * are sent to the `useRtkQuery`
 */
export function RtkQueryTable({
  useApiQuery,
  apiParams,
  columns,
  //Number of records
  total = undefined,
  selectedTableIds,
  //A key that will reset the pagination when changed
  //this is useful when the data is changed and the pagination should be reset
  resetPaginationKey,
}: RTKQueryTableProps) {
  const { finalValue: searchValue, value, setQuery } = useDebouncedValue();
  const { schemaNameCaption, tableNameCaptionPlural } =
    useGetSchemaTableNameCaption();
  const extractMethod = useSttExtractMethod();
  const { params, setParams, setNext, setPrev, resetPages } = useParams(
    apiParams,
    resetPaginationKey,
  );
  const { data, isFetching, isError, error } = useApiQuery({
    params: {
      ...params,
      ...apiParams,
      ...(searchValue && { searchValue }),
    },
    setParams,
  });
  const columnsWithApi = columns.map(column => ({
    ...column,
    getProps: { ...column.getProps, setParams, params },
  }));

  const showAll = useCallback(
    () =>
      setParams(state => ({
        ...state,
        showSelectedTables: {
          ...state.showSelectedTables,
          [apiParams?.schema_name]: undefined,
        },
      })),
    [apiParams?.schema_name, setParams],
  );

  const showSelected = useCallback(() => {
    setParams(state => ({
      ...state,
      showSelectedTables: {
        ...state.showSelectedTables,
        [apiParams?.schema_name]: selectedTableIds,
      },
    }));
  }, [apiParams?.schema_name, selectedTableIds, setParams]);
  return (
    <>
      <Flex
        width="full"
        justifyContent="space-between"
        gap="2"
        position="relative"
      >
        <HStack>
          <TableFilter
            placeholder={`Search ${tableNameCaptionPlural}`}
            name={`search ${tableNameCaptionPlural}`}
            chakra
            width="max-content"
            value={value}
            mb="0"
            onFilterChange={val => {
              setQuery(val);
              resetPages();
            }}
          />
          <RenderGuard condition={!!data}>
            <SelectedToggle
              showAll={showAll}
              showSelected={showSelected}
              showingSelected={
                params?.showSelectedTables?.[apiParams?.schema_name]?.length > 0
              }
              hasSelected={selectedTableIds?.length > 0}
            />
          </RenderGuard>
          {data && getFilterTablesDisclaimer(extractMethod)}
        </HStack>
        <BasicPagination
          onNext={setNext}
          onPrevious={setPrev}
          nextPage={data?.next_page}
          prevPage={data?.previous_page}
          //Temp hardecoded solution, we currently fetch 100 records per page
          isNextDisabled={total <= 100}
          //If there is no next and no prev page in params this means we are on the first page - so no previous page.
          isPrevDisabled={!params?.nextPage && !params?.prevPage}
        />
      </Flex>
      {isError ? (
        <Center flexDir="column" gap={2} color="font-secondary">
          <Icon as={RdsSchema} boxSize="40px" color="error" />
          <Text textStyle="R5" textAlign="center" color="error">
            Error loading {tableNameCaptionPlural}
          </Text>
          <Text textStyle="R7" textAlign="center" color="font-secondary">
            {error?.data?.message ||
              error?.message ||
              'Please try reloading or check your connection settings'}
          </Text>
        </Center>
      ) : data && !isFetching ? (
        // <Box h="100%" overflow="auto" position="relative">
        <RiveryTable
          ariaLabel="tables list"
          entityType={tableNameCaptionPlural}
          columns={columnsWithApi}
          data={data.items}
          noPagination
          useSortBy={useSortBy}
          title={null}
          showDefaultFilter={false}
        />
      ) : (
        // </Box>
        <Center flexDir="column" gap={2} color="font-secondary">
          <Icon as={RdsSchema} boxSize="40px" color="icon-disabled" />
          <Text textStyle="R5" textAlign="center">
            Select a {schemaNameCaption} from the left panel to load the Tables
          </Text>
        </Center>
      )}
      {isFetching ? <PageOverlaySpinner /> : null}
    </>
  );
}

const createPagination = () => ({
  prevPage: undefined,
  nextPage: undefined,
  include_ids: undefined,
});
export type TablesParams = {
  nextPage?: string;
  prevPage?: string;
  include_ids?: string;
} & Record<string, any>;
const useParams = (apiParams, resetPaginationKey) => {
  const _apiParamsRef = useRef(apiParams);

  const [_params, setParams] = useState<TablesParams>();

  const setNext = useCallback((nextPage, include_ids) => {
    setParams(p => ({ ...p, nextPage, include_ids, prevPage: undefined }));
  }, []);

  const setPrev = useCallback((prevPage, include_ids) => {
    setParams(p => ({ ...p, prevPage, include_ids, nextPage: undefined }));
  }, []);

  const resetPages = useCallback(() => {
    setParams(p => ({ ...p, ...createPagination() }));
  }, []);

  useEffect(() => resetPages(), [resetPages, resetPaginationKey]);

  _apiParamsRef.current = apiParams;

  return { params: _params, setParams, setNext, setPrev, resetPages };
};
function SelectedToggle({
  showAll,
  showSelected,
  showingSelected,
  hasSelected,
}) {
  return (
    <RadioGroup
      aria-label="selected-toggle"
      name="selected-toggle"
      values={[
        { label: 'Selected', value: 'selected', disabled: !hasSelected },
        { label: 'All', value: 'all' },
      ]}
      checked={showingSelected ? 'selected' : 'all'}
      onChange={value => {
        if (value === 'selected') {
          showSelected();
        } else {
          showAll();
        }
      }}
      size="base"
    />
  );
}
