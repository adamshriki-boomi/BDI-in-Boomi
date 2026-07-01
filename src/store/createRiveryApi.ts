import {
  BaseQueryFn,
  createApi,
  FetchArgs,
  fetchBaseQuery,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';
import { withHeaderAuthorization } from 'api/headers';
import { getDataByDomainFromEnvFile } from 'utils/api.sanitizer';
import { getMatchUrl } from './core/core.effects';

export enum VersionsApi {
  v0 = 0,
  v1 = 1,
}

export const getV1Path = (ifFull = true, url = '') => {
  if (!ifFull) {
    return url;
  }
  const match = getMatchUrl();
  return `/accounts/${match?.params?.account}/environments/${match?.params?.env}${url}`;
};

export const getV1Url = () => {
  const baseUrl = getDataByDomainFromEnvFile('VITE_API_BASE_URL');
  return baseUrl ?? import.meta.env.VITE_API_BASE_URL_DEFAULT;
};

export const createRiveryApi = createApi({
  // reducerPath is api by default
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders: withHeaderAuthorization(),
  }),
  endpoints: () => ({}),
});
export const createRiveryApiV1 = createApi({
  reducerPath: 'v1',
  baseQuery: fetchBaseQuery({
    baseUrl: getV1Url(),
    prepareHeaders: withHeaderAuthorization(true),
  }),
  endpoints: () => ({}),
});

const apiV1BaseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, WebApi, extraOptions) => {
  const baseUrl = `${getV1Url()}${getV1Path(true)}`;
  const rawBaseQuery = fetchBaseQuery({
    baseUrl,
    prepareHeaders: withHeaderAuthorization(true),
  });
  return rawBaseQuery(args, WebApi, extraOptions);
};

export const createRiveryApiV1AccountEnv = createApi({
  reducerPath: 'v1full',
  baseQuery: apiV1BaseQuery,
  endpoints: () => ({}),
});
