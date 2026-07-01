import queryString from 'query-string';
import { useCallback, useEffect, useMemo } from 'react';
import { useHistory } from 'react-router-dom';
import { usePrevious, useSearchParam } from 'react-use';

function setParam(push, key: string, value: any) {
  const { search } = window.location;
  const params = queryString.parse(search);

  if (value || value === 0) {
    const queryValue = params[key];
    if (!(queryValue && Array(queryValue).flat().includes(value.toString()))) {
      push({
        search: queryString.stringify({ ...params, [key]: value }),
      });
    }
  } else if (params[key]) {
    const filtered = queryString.exclude(search, [key]);
    push({ search: filtered });
  }
}

function setParams(push, newParams) {
  const { search } = window.location;
  const params = queryString.parse(search);

  const updateEntries = Object.entries(newParams);
  const keysToUpdate = updateEntries.filter(([key, value]) => {
    if (value || value === 0) {
      const queryValue = params[key];
      return !(
        queryValue && Array(queryValue).flat().includes(value.toString())
      );
    }
    return false;
  });

  const keysToDelete = updateEntries
    .filter(([_, value]) => !value && value !== 0)
    .map(([key]) => key);

  if (keysToUpdate.length || keysToDelete.length) {
    const filteredParams = keysToDelete.length
      ? Object.fromEntries(
          Object.entries(params)
            .filter(([key]) => keysToDelete.includes(key))
            .map(([key]) => [key, undefined]),
        )
      : params;
    const newParams = {
      ...filteredParams,
      ...Object.fromEntries(keysToUpdate),
    };
    if (Object.keys(newParams).length) {
      push({ search: queryString.stringify({ ...params, ...newParams }) });
    }
  }
}

export function useSetQueryParams() {
  const { push } = useHistory();
  return useCallback(updates => setParams(push, updates), [push]);
}

export function useReplaceQueryParams() {
  const { replace } = useHistory();
  return useCallback(updates => setParams(replace, updates), [replace]);
}

export function useQueryParam(key): [string, Function] {
  const { push } = useHistory();
  const paramValue = useSearchParam(key);
  const pushParam = useCallback(
    value => setParam(push, key, value),
    [key, push],
  );

  return useMemo(() => [paramValue, pushParam], [paramValue, pushParam]);
}

export function getQueryParams(keys: string[]): Record<string, any> {
  const { search } = window.location;
  return Object.fromEntries(
    Object.entries(queryString.parse(search)).filter(([key]) =>
      keys.includes(key),
    ),
  );
}

export function useSynchedSearchParam(api: any, name: string) {
  const value = api.watch(name);
  const [paramValue, setParam] = useQueryParam(name);
  const prevParamValue = usePrevious(paramValue);

  useEffect(() => {
    if (prevParamValue && !paramValue) {
      setParam(null);
      if (api.getValues()[name]) {
        api.setValue(name as any, null);
      }
    }
  }, [paramValue, prevParamValue, setParam, name, api]);

  useEffect(() => {
    if (value) {
      setParam(value);
    }
  }, [value, setParam, name]);

  return value;
}
