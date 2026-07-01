import { PageOverlaySpinner } from 'components/Loaders/Loader';
import { NoEntities } from 'components/NoResults/NoResults';
import { getQueryParams, useSetQueryParams } from 'hooks/router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useAsyncFn, useDeepCompareEffect, usePrevious } from 'react-use';
import { parseSearchParams } from 'utils/searchParams';
import { Tagger } from '../Tracking/Tagger';
import { RiveryTable, RiveryTableProps } from './RiveryTable';

const initializeQueryParams = () => {
  const params = getQueryParams([
    'pageIndex',
    'pageSize',
    'text',
    'sortBy',
    'sortOrder',
  ]);
  return { ...defaultPagination, ...params };
};
interface PaginatedRiveryTableProps extends Partial<RiveryTableProps> {
  fetchData: (params: any) => any;
  paramIdMap: Record<string, any>;
  masterFilterKey?: string;
}

export function PaginatedRiveryTable({
  fetchData,
  paramIdMap,
  //The key to pass in query params for the selected filter
  masterFilterKey = 'text',
  ...props
}: PaginatedRiveryTableProps) {
  const setQueryParams = useSetQueryParams();
  const [paginationData, setPaginationData] = useState<Record<string, any>>(
    initializeQueryParams,
  );
  const [handlers, registerHandlers] = useState<
    Record<string, Function> | undefined
  >();

  const { pageIndex, pageSize } = paginationData;
  const [{ value, loading }, updateItems] = useAsyncFn(
    async params => {
      const ensurePageIndex = !Boolean(params.pageIndex)
        ? { ...params, pageIndex: 0 }
        : params;
      return await fetchData(ensurePageIndex);
    },
    [fetchData],
  );

  useEffect(() => {
    if (Object.keys(paginationData).length > 0) {
      updateItems(paginationData);
    }
  }, [paginationData, updateItems]);

  const onPagination = useCallback(
    values => {
      setPaginationData(state => {
        if (!values) {
          requestAnimationFrame(() => {
            updateItems(defaultPagination);
            setQueryParams(emptyObj);
          });
          return emptyObj;
        }

        const valuesWithoutDefaults = withoutPaginationDefaults(values, state);
        if (hasPaginationUpdates(valuesWithoutDefaults, state)) {
          const newState = {
            ...state,
            ...valuesWithoutDefaults,
          };
          if (
            !valuesWithoutDefaults.hasOwnProperty('pageIndex') &&
            handlers?.gotoPage
          ) {
            valuesWithoutDefaults.pageIndex = undefined;
            newState.pageIndex = defaultPagination.pageIndex;
            handlers.gotoPage(defaultPagination.pageIndex);
          }
          requestAnimationFrame(() => {
            setQueryParams(valuesWithoutDefaults);
            updateItems(newState);
          });
          return newState;
        } else {
          return state;
        }
      });
    },
    [updateItems, setQueryParams, handlers],
  );

  const pageCount = value?.totalPages ?? 0;

  const tableProps: Partial<RiveryTableProps> | any = useMemo(() => {
    const { ...rest } = props;
    return rest;
  }, [props]);

  const [filters, setFilters] = useState(mapUrlParamsToFilters(paramIdMap));

  const search = window.location.search;
  const prevSearch = usePrevious(search);
  const reset = () => {
    if (handlers) {
      handlers.gotoPage(defaultPagination.pageIndex);
      handlers.setPageSize(defaultPagination.pageSize);
      handlers.setAllFilters(emptyArr);
      handlers.setSortBy(emptyArr);
      const entries = Object.entries(withoutPaginationDefaults(paginationData))
        .filter(([, value]) => Boolean(value) || value === 0)
        .map(([key]) => [key, undefined]);
      if (entries?.length) {
        onPagination(Object.fromEntries(entries));
      }
    }
  };
  if (!search.length && prevSearch?.length) {
    reset();
  }

  useDeepCompareEffect(() => {
    const requiredUpdates = mapToRequiredParams(filters, paramIdMap);
    if (requiredUpdates) {
      onPagination(requiredUpdates);
    }
  }, [paramIdMap, filters, onPagination]);

  const paginationConfig = useMemo(
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

  const onGlobalFilterChange = useCallback(
    value => onPagination({ [masterFilterKey]: value }),
    [masterFilterKey, onPagination],
  );

  const { sortBy, sortOrder } = paginationData;
  const sort = useMemo(
    () =>
      (sortBy || sortOrder) && {
        sortBy,
        sortOrder,
      },
    [sortBy, sortOrder],
  );
  const loader = value === undefined || loading ? <PageOverlaySpinner /> : null;

  const paginationDataWithDefaults = useMemo(
    () => ({ ...defaultPagination, ...paginationData }),
    [paginationData],
  );

  return (
    <TablePaginationContext.Provider
      value={{
        paginationData: paginationDataWithDefaults,
        refresh: () => updateItems(paginationDataWithDefaults),
        reset: (filters?.length || paginationData[masterFilterKey]) && reset,
      }}
    >
      <Tagger tags="rivers-list">
        <RiveryTable
          noRecords={() =>
            Boolean(value) ? (
              <NoEntities entity={tableProps.entityType.slice(0, -1)} />
            ) : null
          }
          {...tableProps}
          loader={loader}
          paginationConfig={paginationConfig}
          onPagination={onPagination}
          data={(!loading && value?.data) || emptyArr}
          totalShowing={value?.totalShowing}
          totalRows={value?.total}
          filter={paginationData[masterFilterKey]}
          sort={sort}
          setFilters={setFilters}
          registerHandlers={registerHandlers}
          onGlobalFilterChange={onGlobalFilterChange}
        />
      </Tagger>
    </TablePaginationContext.Provider>
  );
}

export const defaultPagination = {
  pageIndex: 0,
  pageSize: 20,
};

function mapUrlParamsToFilters(config) {
  const params = parseSearchParams(window.location.search);
  const resultEntries = Object.entries(config)
    .map(([paramKey, filterKey]) => {
      return [filterKey, params[paramKey]];
    })
    .filter(([_, value]) => {
      return value;
    })
    .map(([id, value]) => ({ id, value }));
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

function asNumStr(value) {
  const modVal = value || Number(value);
  if (isNaN(modVal)) {
    return value;
  } else {
    return value.toString();
  }
}

function withoutPaginationDefaults(
  values,
  state: Record<string, any> = defaultPagination,
) {
  return (
    values &&
    Object.fromEntries(
      Object.entries(values).filter(([key, value]) => {
        const valueStr = asNumStr(value);
        const stateStr = asNumStr(state[key]);
        const defaultStr = asNumStr(defaultPagination[key]);

        if (valueStr !== stateStr) {
          return stateStr === undefined ? valueStr !== defaultStr : true;
        }
        return (valueStr || stateStr) !== undefined
          ? valueStr !== defaultStr
          : false;
      }),
    )
  );
}

function hasPaginationUpdates(values, state) {
  return Object.entries(values).some(
    ([key, value]) => state[key] !== value && (state[key] || value),
  );
}

const emptyObj = {};
const emptyArr = [];

export const TablePaginationContext = React.createContext<{
  paginationData: {
    pageIndex?: number;
    pageSize?: number;
  };
  refresh: () => any;
  reset: () => any;
}>({ paginationData: {}, refresh: null, reset: null });
