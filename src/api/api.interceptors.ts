import { api, apiV1 } from 'api/api.proxy';
import { StatusCodes } from 'api/endpoints/common.api';
import { AxiosInstance, AxiosResponse } from 'axios';
import { Storage } from './storage';

export const defineStoreAuth = (api: AxiosInstance, url: string) =>
  api.interceptors.response.use((response: AxiosResponse) => {
    if (
      response?.status === StatusCodes.SUCCESS &&
      response?.config?.url?.includes(url)
    ) {
      setAPISAuthorizations(response.data.token);
    }
    return response;
  });

// save login info
export const defineStoreLogin = (api: AxiosInstance, url: string) =>
  api.interceptors.response.use((response: AxiosResponse) => {
    if (
      response?.status === StatusCodes.SUCCESS &&
      response?.config?.url?.includes(url)
    ) {
      Storage.store(Storage.Keys.LOGIN, response.data, true);
    }
    return response;
  });

/**
 * when token is expired, 403 is returned from server. these should happen:
 * 1. retry asking token
 * 2. logout if not successful
 */

export function setAPISAuthorizations(token: string) {
  setAuthorization(api, token);
  setAuthorization(apiV1, token);
}

function setAuthorization(api: AxiosInstance, token: string) {
  const prefixToken =
    api.defaults.baseURL.indexOf('/v1') >= 0 && !token?.startsWith('Bearer')
      ? 'Bearer '
      : '';
  api.defaults.headers.authorization = `${prefixToken}${token}`;
}
