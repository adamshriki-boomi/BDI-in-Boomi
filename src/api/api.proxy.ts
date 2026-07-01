import axios, { AxiosResponse } from 'axios';
import { getV1Path, getV1Url } from 'store/createRiveryApi';

export const api = axios.create({
  baseURL: `${window.location.origin}/${import.meta.env.VITE_API_PREFIX}`,
  headers: { Accept: 'application/json' },
  withCredentials: true,
});

export const apiV1 = axios.create({
  baseURL: getV1Url(),
  headers: { Accept: 'application/json' },
  withCredentials: true,
});

export const extractData = (response: AxiosResponse) => response?.data;
export const extractErrorData = error => ({
  ...error?.response?.data,
  status: error?.response?.status,
});

export const get = api.get;
export const put = api.put;
export const onDelete = api.delete;
export const post = api.post;
export const remove = api.delete;

export const postBody = (...args) => post.apply(api, args).then(extractData);

export const putData = (...args) =>
  api.put.apply(api, args).then(extractData).catch(extractErrorData);
export const patch = (...args) =>
  api.patch.apply(api, args).then(extractData).catch(extractErrorData);

export const getData = (
  url: string,
  params = {},
  headers = {},
  apiVersion = api,
  extractErrors = true, //use extractErrors false to get error handling outside
) => {
  return apiVersion
    .get(url, {
      headers: { ...headers },
      params: { ...params },
    })
    .then(
      extractData,
      extractErrors
        ? res => extractData(res?.response)
        : e => {
            throw new Error(e);
          },
    );
};

export const onDeleteV1 = (isFull: boolean, url: string, params = {}) => {
  const urlPath = getV1Path(isFull, url);
  return apiV1.delete(urlPath, params);
};

export const getDataV1 = (
  isFull: boolean,
  url: string,
  params = {},
  headers = {},
  extractErrors = true,
) => {
  const urlPath = getV1Path(isFull, url);
  return getData(urlPath, params, headers, apiV1, extractErrors);
};

export const postDataV1 = (isFull: boolean, url: string, params = {}) =>
  apiV1
    .post(getV1Path(isFull, url), {
      ...params,
    })
    .then(extractData)
    .catch(e => extractErrorData(e));

export const postData = (url: string, params: any) =>
  apiV1
    .post(url, {
      params,
    })
    .then(extractData);

export const putDataV1 = (isFull, url: string, params: any) =>
  apiV1
    .put(getV1Path(isFull, url), params)
    .then(extractData)
    .catch(extractErrorData);

export const getDataWithoutCache = (
  url,
  params = {},
  headers = {},
  apiVersion = api,
) => {
  return apiVersion
    .get(url, {
      ...headers,
      params,
    })
    .then(extractData, res => extractData(res?.response));
};
