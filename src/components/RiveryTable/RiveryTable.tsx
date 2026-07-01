import { FlexProps, GridProps, HStack, StackProps } from '@chakra-ui/react';
import { Box, Flex, GridBox, Text } from 'components';
import { RiverySwitch } from 'components/Form/components';
import React, {
  ElementType,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  useFilters,
  useGlobalFilter,
  usePagination,
  useTable,
} from 'react-table';
import { useEffectOnce, useUpdateEffect } from 'react-use';
import { displayDate, patternDate } from 'utils/date.utils';
import { FooterGroups } from './FooterGroups';
import { InfiniteGrid } from './InfiniteGrid';
import { TablePaginationContext } from './PaginatedRiveryTable';
import './RiveryTable.scss';
import { TableInlineHeader } from './TableInlineHeader';
import { TablePaginationFooter } from './TablePaginationFooter';
import { TableRowHeaders } from './TableRowHeaders';
import { TableRows } from './TableRows';

export interface RiveryTableProps {
  columns: any;
  data: any;
  'data-pendo-id'?: string;
  showFooter?: boolean;
  inline?: boolean;
  noPagination?: boolean;
  fixedPageSize?: boolean;
  compact?: boolean;
  extraControls?: any;
  globalFilter?: any;
  contentProps?: StackProps;
  wrapperProps?: FlexProps;
  tableProps?: GridProps;
  entityType?: string;
  getSubRows?: any;
  useSortBy?: any;
  useExpanded?: any;
  paginationConfig?: any;
  onPagination?: (state: any) => any;
  totalShowing?: number;
  totalRows?: number;
  loader?: any;
  filter?: string;
  sort?: any;
  setFilters?: (value: any) => any;
  onGlobalFilterChange?: (value: any) => any;
  registerHandlers?: (value: any) => any;
  title?: ReactNode;
  onPageCountChange?: (value: any) => any;
  recordNotFound?: ElementType<any>;
  noRecords?: ElementType<any>;
  rowHandlers?: any;
  headerHandlers?: any;
  isGallery?: boolean;
  emptyResultsMsg?: ReactNode;
  noItemsMsg?: ReactNode;
  showDefaultFilter?: boolean;
  /**
   * required (!) if there are multiple grids in a view, iterator-components should have unique keys
   */
  ariaLabel?: string;
  useIdAsIndex?: boolean;
  /**
   * sets table's inner scroll to auto
   */
  customFilterColumns?: string[];
  filterLabel?: string;
  filterInputProps?: Record<string, any>;
  clearFilters?: ReactNode;
  /**
   * for infinite scroll - invokes function when scroll reached end of container (using InfiniteGrid)
   */
  onScrollEnd?: () => any;
  /**
   * any custom data/functions that should be avialable
   * on a table's instance in any cell's props
   * ref: https://react-table-v7.tanstack.com/docs/examples/editable-data
   */
  tableCustomProps?: Record<string, any>;
  variant?: 'border';
}

const toColumnsLayout = headers =>
  headers?.some(({ weight }) => weight)
    ? headers
        .map(({ weight = 1 }) => (isFinite(weight) ? `${weight}fr` : weight))
        .join(' ')
    : `repeat(${headers?.length}, 1fr)`;

const defaultPaginationConfig = {
  autoResetPage: false,
  autoResetGlobalFilter: false,
  autoResetFilters: false,
};

export function RiveryTable({
  columns,
  data,
  globalFilter,
  getSubRows,
  extraControls = null,
  showFooter = false,
  inline = false,
  noPagination = false,
  fixedPageSize = false,
  compact = false,
  wrapperProps = null,
  tableProps = null,
  contentProps = null,
  useSortBy,
  useExpanded,
  entityType = 'Items',
  paginationConfig = defaultPaginationConfig,
  onPagination,
  loader = null,
  totalRows,
  totalShowing = undefined,
  filter = '',
  sort = undefined,
  setFilters = undefined,
  onGlobalFilterChange = undefined,
  registerHandlers = undefined,
  onPageCountChange = undefined,
  rowHandlers = undefined,
  headerHandlers = undefined,
  title = '',
  recordNotFound: RecordNotFound = null,
  noRecords: NoRecords = null,
  isGallery = false,
  emptyResultsMsg = null,
  noItemsMsg = null,
  showDefaultFilter = true,
  ariaLabel,
  //Due to row indexing issues - when removing check variable manager filter and variables table inline edit
  useIdAsIndex = true,
  filterLabel = null,
  filterInputProps = null,
  customFilterColumns = [],
  clearFilters = null,
  onScrollEnd = null,
  tableCustomProps = null,
  variant = null,
  'data-pendo-id': pendoId,
}: RiveryTableProps) {
  const customGlobalFilterFunction = useCallback(
    (rows, ids, query) => {
      return rows.filter(row =>
        customFilterColumns.some(column =>
          row?.values[column]?.toLowerCase().includes(query.toLowerCase()),
        ),
      );
    },
    [customFilterColumns],
  );
  const tableConfig = useMemo(() => {
    return {
      columns,
      data,
      globalFilter: Boolean(customFilterColumns.length)
        ? customGlobalFilterFunction
        : globalFilter,
      getSubRows,
      autoResetExpanded: false,
      paginateExpandedRows: !useExpanded,
      sortTypes,
      ...paginationConfig,
      ...tableCustomProps,
      // stateReducer: (newState, action, prevState) => {
      //   console.log('state update: ', action, newState === prevState);
      //   return newState;
      // },
    };
  }, [
    columns,
    data,
    customFilterColumns,
    customGlobalFilterFunction,
    globalFilter,
    getSubRows,
    useExpanded,
    paginationConfig,
    tableCustomProps,
  ]);

  const tableExtras = useMemo(
    () =>
      [
        useFilters,
        useGlobalFilter,
        useSortBy,
        useExpanded,
        usePagination,
      ].filter(Boolean),
    [useSortBy, useExpanded],
  );

  const {
    getTableProps,
    headers,
    prepareRow,
    page,
    rows,
    preExpandedRows,
    // pagination
    canPreviousPage,
    canNextPage,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize, filters },
    // filters
    setGlobalFilter: tableGlobalFilter,
    // setFilter,
    setAllFilters,
    footerGroups,
    // toggleSortBy,
    setSortBy,
  } = useTable<any>(tableConfig, ...tableExtras);

  useEffect(() => {
    onPageCountChange && onPageCountChange(pageCount);
  }, [pageCount, onPageCountChange]);
  const setGlobalFilter = args => {
    gotoPage(0);
    onGlobalFilterChange ? onGlobalFilterChange(args) : tableGlobalFilter(args);
  };
  useEffect(() => {
    if (registerHandlers) {
      registerHandlers({
        setAllFilters,
        gotoPage,
        setPageSize,
        setSortBy,
      });
    }
  }, [registerHandlers, setAllFilters, gotoPage, setPageSize, setSortBy]);

  useEffect(() => {
    if (setFilters) {
      setFilters(filters);
    }
  }, [filters, setFilters]);

  useEffect(() => {
    onPagination && onPagination({ pageIndex, pageSize });
  }, [pageIndex, pageSize, onPagination]);
  const columnsLayout = toColumnsLayout(headers);
  useEffect(() => {
    if (noPagination && data && !onPagination) {
      setPageSize(data.length + 1);
    }
  }, [data, noPagination, onPagination, setPageSize]);
  useEffectOnce(() => {
    if (sort) {
      const column = headers.find(({ sortBy }) => sortBy === sort.sortBy);
      if (column) {
        setSortBy([{ id: column.id, desc: sort.sortOrder === 'desc' }]);
      }
    }
  });

  const sortColumn = headers.find(({ isSorted, sortBy }) => isSorted && sortBy);

  const sortOrder = sortColumn && (sortColumn?.isSortedDesc ? 'desc' : 'asc');

  useUpdateEffect(() => {
    if (onPagination) {
      if (
        sort?.sortBy !== sortColumn?.sortBy ||
        sort?.sortOrder !== sortOrder
      ) {
        onPagination({
          sortBy: sortColumn?.sortBy,
          sortOrder,
        });
      }
    }
  }, [sortColumn, sort, sortOrder]);

  const displayTotalShowing = totalShowing ?? (preExpandedRows ?? rows).length;
  const displayTotalRows = totalRows || data?.length;
  const hasRecords = page?.length > 0;
  const noRecordAvailableInSearch =
    !hasRecords &&
    //Checking to see if there are any filters on besides the main filter
    (filter !== '' || Boolean(paginationConfig.initialState?.filters?.length));
  const noRecordsToDisplay =
    !hasRecords &&
    filter === '' &&
    //Checking to see if other filters were activated
    !Boolean(paginationConfig.initialState?.filters?.length);
  const countDisplay = useMemo(() => {
    return (
      <CountDisplay
        displayTotalShowing={displayTotalShowing}
        displayTotalRows={displayTotalRows}
        entityType={entityType}
        pageSize={pageSize}
        page={pageIndex}
        totalRows={totalRows}
      />
    );
  }, [
    displayTotalRows,
    displayTotalShowing,
    entityType,
    pageIndex,
    pageSize,
    totalRows,
  ]);

  const [tableMessage, setTableMessage] = useState(null);

  const callouts = [
    noRecordAvailableInSearch && RecordNotFound,
    noRecordsToDisplay && NoRecords,
  ].filter(Boolean);

  useEffect(() => {
    if (
      (noRecordsToDisplay && NoRecords) ||
      (noRecordAvailableInSearch && RecordNotFound)
    ) {
      setTimeout(() => setTableMessage(callouts), 500);
    }
  }, [
    NoRecords,
    RecordNotFound,
    callouts,
    noRecordAvailableInSearch,
    noRecordsToDisplay,
  ]);

  const GridContainer = onScrollEnd ? InfiniteGrid : GridBox;
  const gridContainerProps = onScrollEnd ? { onScrollEnd } : {};

  return (
    <Flex
      flexDirection="column"
      overflow="hidden"
      height="full"
      {...wrapperProps}
      data-pendo-id={pendoId}
    >
      {inline ? null : (
        <>
          {title ? <TableTitle title={title} /> : null}
          <TableInlineHeader
            showDefaultFilter={showDefaultFilter}
            headers={headers}
            filter={filter}
            filterLabel={filterLabel}
            filterInputProps={filterInputProps}
            onFilterChange={setGlobalFilter}
            clearFilters={clearFilters}
            entityType={entityType}
          >
            {extraControls}
          </TableInlineHeader>
        </>
      )}
      <Flex
        flexDir="column"
        alignItems="start"
        grow={1}
        w="100%"
        overflow="hidden"
        borderRadius={4}
        h="100%"
        {...variants?.[variant]}
        {...contentProps}
      >
        <GridContainer
          {...gridContainerProps}
          w="100%"
          aria-label={ariaLabel}
          display={isGallery ? 'flex' : 'grid'}
          flexWrap={isGallery ? 'wrap' : 'unset'}
          gridRowGap="1px"
          maxHeight="full"
          py={isGallery ? '1' : 'unset'}
          bg={!isGallery ? 'white' : 'inherit'}
          {...getTableProps({
            style: {
              '--columnsLayout': columnsLayout,
              '--columns': headers.length,
            },
          })}
          sx={{
            '.disabled-row': {
              opacity: 0.6,
              '&.actions-cell': {
                opacity: 1,
                bgColor: 'var(--chakra-colors-disabledTableRow) !important',
              },
            },
          }}
          overflow="auto"
          gridTemplateColumns="var(--columnsLayout, repeat(var(--columns, 1), auto))"
          {...tableProps}
        >
          {isGallery ? null : (
            <TableRowHeaders
              id={ariaLabel}
              headers={headers}
              isCustom={headerHandlers?.isCustom}
              displayTotalShowing={displayTotalShowing}
            />
          )}
          <TableRows
            id={ariaLabel}
            rows={page}
            prepareRow={prepareRow}
            onRowClick={rowHandlers?.onRowClick}
            isRowSelected={rowHandlers?.isRowSelected}
            isRowDisabled={rowHandlers?.isRowDisabled}
            isCustomPadding={rowHandlers?.isCustomPadding}
            markFirstRow={rowHandlers?.markFirstRow}
            useIdAsIndex={useIdAsIndex}
          />

          {!loader && data?.length === 0 ? (
            <>
              {tableMessage?.map((Callout: any) => (
                <TableCallout key={`callout-${ariaLabel}`}>
                  <Callout />
                </TableCallout>
              ))}
            </>
          ) : null}
          <TableInlineMessage message={!displayTotalRows && noItemsMsg} />
          <TableInlineMessage
            message={
              displayTotalRows && !displayTotalShowing && emptyResultsMsg
            }
          />
          {showFooter ? <FooterGroups groups={footerGroups} /> : null}
        </GridContainer>
        {loader}
      </Flex>
      {noPagination ? null : (
        <TablePaginationFooter
          isFixedPageSize={fixedPageSize}
          gotoPage={gotoPage}
          previousPage={previousPage}
          nextPage={nextPage}
          canPreviousPage={canPreviousPage}
          canNextPage={canNextPage}
          pageCount={pageCount}
          pageIndex={pageIndex}
          pageSize={pageSize}
          entityType={entityType}
          onPageSizeChange={setPageSize}
          compact={compact}
          countDisplay={countDisplay}
        />
      )}
    </Flex>
  );
}

function CountDisplay({
  displayTotalShowing,
  displayTotalRows,
  entityType,
  page,
  pageSize,
  totalRows,
}) {
  const lastIndex =
    Math.min((page + 1) * pageSize, totalRows) ?? displayTotalRows;
  return isNaN(displayTotalShowing) ? null : (
    <Text color="font-secondary" ml={2}>
      {displayTotalShowing === displayTotalRows
        ? `${displayTotalRows.toLocaleString('en')} ${entityType}`
        : `${displayTotalShowing.toLocaleString('en')} - ${
            !isNaN(lastIndex)
              ? lastIndex.toLocaleString('en')
              : displayTotalShowing.toLocaleString('en')
          } of ${displayTotalRows.toLocaleString('en')} ${entityType}`}
    </Text>
  );
}
function TableTitle({ title }) {
  return (
    <HStack justifyContent="space-between" py={4}>
      <Text fontWeight="bold">{title}</Text>
    </HStack>
  );
}
function TableInlineMessage({ message, ...rest }) {
  return message ? (
    <Flex
      alignItems="center"
      justifyContent="center"
      p="2"
      bg="white"
      gridColumn="1/-1"
      color="font-secondary"
      {...rest}
    >
      {message}
    </Flex>
  ) : null;
}

const TableCallout = ({ children }) => {
  return (
    <Box p="2" bg="white" gridColumn="1/-1">
      {children}
    </Box>
  );
};

const createOptionPair = (value: any) => ({
  value,
  label: value,
});
export const perPageSelectors = [10, 20, 100].map(createOptionPair);

const TableDateTime = ({ value }) => {
  if (!value) {
    return null;
  }
  return displayDate(value.$date || value, patternDate);
};

const IndexColumn = {
  Header: '#',
  accessor: (_: any, rowIndex: number) => rowIndex + 1,
  Cell: ({ value }) => {
    const {
      paginationData: { pageIndex = 0, pageSize = 0 },
    } = useContext(TablePaginationContext);
    if (pageSize) {
      return value + (pageIndex || 0) * pageSize;
    } else {
      return value;
    }
  },
  weight: 'min-content',
};

function asUniqueSelectColumn({
  header = '',
  accessor = undefined,
  Cell = undefined,
  id = undefined,
  value: selectedValue,
  onChange,
  getName = (v = undefined) => selectedValue,
  getValue = (v = undefined) => v,
}) {
  return {
    Header: header,
    accessor,
    id,
    weight: 'min-content',
    Cell: Cell
      ? ({ value }) => (
          <Cell
            value={value}
            selectedValue={selectedValue}
            onChange={() => onChange(value)}
          />
        )
      : ({ value, row: { original } }) => {
          return (
            <RiverySwitch
              label=""
              name={getName(original)}
              isChecked={getValue(value) === getValue(selectedValue)}
              onChange={({ target: { checked } }) => onChange(value, checked)}
            />
          );
        },
  };
}

const sortTypes = {
  alphanumeric: (
    { original: rowA },
    { original: rowB },
    fieldKey: string,
    isAsc: boolean,
  ) => {
    const { [fieldKey]: valueA } = rowA;
    const { [fieldKey]: valueB } = rowB;
    if (!valueA) {
      return isAsc ? -1 : 1;
    } else if (!valueB) {
      return isAsc ? 1 : -1;
    }
    return valueA
      ?.toString()
      .localeCompare(valueB, undefined, { numeric: true });
  },
};

const variants: Record<string, FlexProps> = {
  border: {
    border: '1px',
    borderRadius: '4px!important',
    borderColor: 'gray.300',
  },
};

export { TableDateTime, IndexColumn, asUniqueSelectColumn };
