import { getQueryParams } from 'hooks/router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePaginationReset } from './usePaginationReset';

export const defaultPagination = {
  pageIndex: 0,
  pageSize: 20,
};

function hasPaginationUpdates(values, state) {
  return Object.entries(values).some(
    ([key, value]) => state[key] !== value && (state[key] || value),
  );
}

export function withoutPaginationDefaults(
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

export function usePaginationApi({ handlers, onQueryParamsChange, onChange }) {
  const [paginationData, setPaginationData] = useState<Record<string, any>>(
    initializeQueryParams,
  );

  useParamsSync({
    paginationData,
    onChange,
  });

  const { sortBy, sortOrder } = paginationData;
  const sort = useMemo(
    () =>
      (sortBy || sortOrder) && {
        sortBy,
        sortOrder,
      },
    [sortBy, sortOrder],
  );

  const onPagination = useCallback(
    values => {
      setPaginationData(state => {
        if (!values) {
          requestAnimationFrame(() => {
            onChange(defaultPagination);
            onQueryParamsChange(emptyObj);
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
            onQueryParamsChange(valuesWithoutDefaults);
            onChange(newState);
          });
          return newState;
        } else {
          return state;
        }
      });
    },
    [setPaginationData, onChange, onQueryParamsChange, handlers],
  );

  const reset = usePaginationReset(handlers, paginationData, onPagination);

  return { onPagination, reset, sort, paginationData };
}

// HELPERS
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

const emptyObj = {};
function asNumStr(value) {
  const modVal = value || Number(value);
  if (isNaN(modVal)) {
    return value;
  } else {
    return value.toString();
  }
}

function useParamsSync({ paginationData, onChange }) {
  useEffect(() => {
    if (Object.keys(paginationData).length > 0) {
      onChange(paginationData);
    }
  }, [onChange, paginationData]);
}
