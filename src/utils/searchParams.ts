import queryString from 'query-string';

export const parseSearchParams = (url = undefined) =>
  queryString.parse(url ?? window.location.search, {
    parseBooleans: true,
    parseNumbers: true,
  }) as Record<string, any>;

export const createSearchParam = (
  props: Record<string, any>,
  useString = false,
) => {
  const params = parseSearchParams();
  const combinedParams = { ...params, ...props };
  return removeParams(
    useString ? stringifyParams(combinedParams) : combinedParams,
  );
};

export const stringifyParams = params => queryString.stringify(params);

const emptyValues = ['', 'null'];
export const removeEmptyParams = (search: URLSearchParams) => {
  const paramsToRemove = [];
  search.forEach((value, key) => {
    if (emptyValues.some(emptyValue => value === emptyValue)) {
      paramsToRemove.push(key);
    }
  });
  paramsToRemove.forEach(param => search.delete(param));
  return search;
};

export const removeParams = (
  params: Record<string, any> | string,
  paramsToRemove: string[] = [],
) => {
  const search = new URLSearchParams(params);
  removeEmptyParams(search);
  paramsToRemove.forEach(param => search.delete(param));
  search.sort();

  return search.toString();
};

export const removeQueryParams = (
  params: Record<string, any>,
  paramsToRemove: string[] = [],
) => {
  const newParams = Object.entries(params).reduce((acc, [key, value]) => {
    const valid =
      !value || paramsToRemove.includes(key) ? {} : { [key]: value };
    return { ...acc, ...valid };
  }, {});
  return stringifyParams(newParams);
};

export const pickQueryParams = (paramsToPick: string[] = []) => {
  const search = parseSearchParams();
  const newParams = Object.entries(search).reduce((acc, [key, value]) => {
    const valid = !value || paramsToPick.includes(key) ? { [key]: value } : {};
    return { ...acc, ...valid };
  }, {});
  return stringifyParams(newParams);
};

export const upsertSearchParam = (
  param: string,
  value: string,
  unique = true,
) => {
  const search = new URLSearchParams(window.location.search);
  if (unique) {
    search.delete(param);
  }
  search.append(param, value);
  search.sort();
  return search.toString();
};

export const upsertSearchParams = (
  params: Record<string, any>,
  unique = true,
) => {
  const search = new URLSearchParams(window.location.search);
  Object.entries(params).forEach(([key, value]) => {
    if (!value) {
      search.delete(key);
      return;
    }
    if (unique) {
      search.delete(key);
    }
    search.append(key, value);
  });
  search.sort();
  return search.toString();
};

export const hasRequiredParams = (
  requiredParams: string[],
  params: Record<string, any>,
) => {
  const paramKeys = Object.keys(params);
  return requiredParams.every(param => paramKeys.includes(param));
};

export const parseUrlSearchParams = (url: string) =>
  url && parseSearchParams(url.split('?')?.[1]);
