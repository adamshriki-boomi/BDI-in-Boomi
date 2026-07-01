import { UseQueryStateResult } from '@reduxjs/toolkit/dist/query/react/buildHooks';
import { PageOverlaySpinner } from 'components/Loaders/Loader';
import { getQueryParams, useReplaceQueryParams } from 'hooks/router';
import { useToastComponent } from 'hooks/useToast';
import queryString from 'query-string';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSortBy } from 'react-table';
import { useDeepCompareEffect, useSearchParam } from 'react-use';
import { RiveryTable, RiveryTableProps } from './RiveryTable';
import { defaultPagination, usePaginationApi } from './usePaginationApi';
import { emptyArr } from './usePaginationReset';

interface PaginatedRiveryTableProps<T> extends Partial<RiveryTableProps> {
  /**
   * rtk-query hook - i.e api.useFetchRiver
   * gets all pagination params from within the table
   */
  useApiQuery: (...params: any) => {
    data: T[];
    total: number;
    totalShowing: number;
    totalPages: number;
    [key: string]: UseQueryStateResult<any, any>;
  };
  paramIdMap: Record<string, any>;
  //Don't show table headers in case there's no data
  hideTableNoData?: boolean;
  //A url param which have to be set in order to display the table
  requiredParam?: string;
  masterFilterKey?: string;
  loadingActions?: boolean;
  refetchOnRefresh?: boolean;
  //Addee this just because of the V1 and V2 missmatch for actions in table, should be removed
  refetchOnChange?: boolean;
}

/**
 * **************  "RagnarTable"  **************
 * (aka Paginated Api Rivery Table)
 * sync search params with api hook
 * using "replace" for any internal params change
 */

export function PaginatedApiRiveryTable<T>({
  useApiQuery,
  paramIdMap,
  hideTableNoData = false,
  requiredParam = null,
  masterFilterKey = 'text',
  loadingActions = false,
  refetchOnRefresh = false,
  refetchOnChange = false,
  ...tableProps
}: PaginatedRiveryTableProps<T>) {
  const [params, setParams] = useState<Record<string, any>>();
  const setQueryParams = useReplaceQueryParams();
  const [handlers, registerHandlers] = useState<
    Record<string, Function> | undefined
  >();
  const { error } = useToastComponent();
  const {
    refetch,
    isLoading,
    isFetching,
    data,
    failedRequest,
    ...queryResult
  } = useApiQuery(params);

  const loading =
    isLoading || isFetching || (!Boolean(data) && !hideTableNoData);

  const { onPagination, reset, sort, paginationData } = usePaginationApi({
    handlers,
    onQueryParamsChange: setQueryParams,
    onChange: setParams,
  });
  const filters = useMapUrlParamsToFilters(paramIdMap);
  // TODO add documentation - what does it do?
  useDeepCompareEffect(() => {
    const requiredUpdates = mapToRequiredParams(filters, paramIdMap);
    if (requiredUpdates) {
      onPagination(requiredUpdates);
    }
  }, [paramIdMap, filters, onPagination]);

  useEffect(() => {
    if (refetchOnChange) {
      refetch();
    }
  }, [refetch, refetchOnChange]);

  const paginationConfig = usePaginationConfig({
    pageCount: queryResult?.totalPages ?? 0,
    pageSize: paginationData.pageSize,
    pageIndex: paginationData.pageIndex,
    filters,
  });

  const onGlobalFilterChange = useCallback(
    value => onPagination({ [masterFilterKey]: value }),
    [masterFilterKey, onPagination],
  );

  const paginationDataWithDefaults = useMemo(() => {
    return { ...defaultPagination, ...paginationData };
  }, [paginationData]);

  useEffect(() => {
    if (failedRequest) {
      error({ description: 'Something went wrong, please try again later' });
    }
  }, [error, failedRequest]);

  const requiredParamValue = useSearchParam(requiredParam);
  if (
    (hideTableNoData &&
      (!Boolean(data) || (!Boolean(data?.length) && !loading))) ||
    (hideTableNoData && requiredParam && !requiredParamValue)
  ) {
    return null;
  }
  const filterValue = getQueryParams([masterFilterKey]);
  return (
    <TablePaginationContext.Provider
      value={{
        paginationData: paginationDataWithDefaults,
        refresh: () => {
          refetchOnRefresh ? refetch() : setParams(paginationDataWithDefaults);
        },
        reset: (filters?.length || paginationData?.[masterFilterKey]) && reset,
      }}
    >
      <RiveryTable
        {...(tableProps as any)}
        noPagination={tableProps?.noPagination && queryResult?.totalPages === 1}
        loader={
          loadingActions || (loading && !failedRequest) ? (
            <PageOverlaySpinner />
          ) : null
        }
        paginationConfig={{
          ...paginationConfig,
          initialState: {
            ...paginationConfig.initialState,
            pageSize:
              tableProps?.paginationConfig?.initialState?.pageSize ??
              paginationConfig.initialState.pageSize,
          },
        }}
        onPagination={onPagination}
        data={(!loading && data) || emptyArr}
        totalShowing={queryResult?.totalShowing}
        totalRows={queryResult?.total}
        filter={
          paginationData[masterFilterKey] ?? filterValue?.[masterFilterKey]
        }
        useSortBy={useSortBy}
        sort={sort}
        registerHandlers={registerHandlers}
        onGlobalFilterChange={onGlobalFilterChange}
      />
    </TablePaginationContext.Provider>
  );
}

// HELPERS
function useMapUrlParamsToFilters(config) {
  const params = queryString.parse(window.location.search);
  const resultEntries = useMemo(
    () =>
      Object.entries(config)
        .map(([paramKey, filterKey]) => [filterKey, params[paramKey]])
        .filter(([_, value]) => value)
        .map(([id, value]) => ({ id, value })),
    [config, params],
  );
  return resultEntries;
}

function mapToRequiredParams(params, config) {
  const reverseConfig = Object.fromEntries(
    Object.entries(config).map(([key, value]) => [value, key]),
  );
  const result = Object.fromEntries(
    Object.entries(config).map(([key]) => [key, undefined]),
  );

  const mappedParams = params
    .filter(({ id }) => reverseConfig[id])
    .map(({ id, value }) => ({ [reverseConfig[id]]: value }));

  return mappedParams.length ? Object.assign(result, ...mappedParams) : result;
}

export const TablePaginationContext = React.createContext<{
  paginationData: {
    pageIndex?: number;
    pageSize?: number;
  };
  refresh: () => any;
  reset: () => any;
}>({ paginationData: {}, refresh: null, reset: null });

function usePaginationConfig({ pageCount, pageSize, pageIndex, filters }) {
  return useMemo(
    () => ({
      pageCount,
      manualPagination: true,
      // manualGlobalFilter: true,
      manualFilters: true,
      manualSortBy: true,
      autoResetPage: false,
      autoResetGlobalFilter: false,
      autoResetFilters: false,
      autoResetSortBy: false,
      initialState: { pageSize, pageIndex, filters },
    }),
    [pageCount, pageSize, pageIndex, filters],
  );
}
