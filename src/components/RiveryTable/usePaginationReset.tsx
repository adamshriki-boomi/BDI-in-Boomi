import { useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { usePrevious } from 'react-use';
import {
  defaultPagination,
  withoutPaginationDefaults,
} from './usePaginationApi';

export const emptyArr = [];

export function usePaginationReset(handlers, paginationData, onPagination) {
  const location = useLocation();
  const search = location.search;
  const prevSearch = usePrevious(search);

  // @TODO - was not tested yet..
  const reset = useCallback(() => {
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
  }, [handlers, onPagination, paginationData]);

  if (!search.length && prevSearch?.length) {
    reset();
  }

  return reset;
}
