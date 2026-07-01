import {
  AccountId,
  ICheckRunPayload,
  ICreateRiverType,
  IRiver,
  IRiverRunResult,
  OID,
  RiveryId,
} from 'api/types';
import { getV1Path } from 'store/createRiveryApi';
import { getOId } from 'utils/api.sanitizer';
import {
  apiV1,
  extractData,
  extractErrorData,
  getData,
  getDataV1,
  onDeleteV1,
  patch,
  post,
  postBody,
  postDataV1,
  putData,
} from '../api.proxy';
const RIVERS_URL = `/rivers`;
export const getRiversData = (path = '', params = {}) =>
  getData(`${RIVERS_URL}${path}`, params);

// GET REQUESTS
export const list = () => {
  return getRiversData('/list');
};

export const listActionRivers = () => {
  return post(`${RIVERS_URL}/list`, { river_type: 'actions' }).then(
    extractData,
  );
};

export const listOne = (params: RiveryId) => {
  return post(`${RIVERS_URL}/list`, params).then(extractData);
};
export const lisVariables = (riverId: string) => {
  return getDataV1(
    true,
    `${RIVERS_URL}/${riverId}/variables`,
    {
      items_per_page: 500,
    },
    {},
    false,
  )
    .then(data => data?.items)
    .catch(error => {
      throw error?.response || error;
    });
};

export const copy = (params: RiveryId): Promise<IRiver> => {
  return post(`${RIVERS_URL}/copy`, {
    ...params,
  }).then(extractData);
};

export const copyToAccount = (
  river: RiveryId,
  account: AccountId,
): Promise<IRiver> => {
  return post(`${RIVERS_URL}/copy-different-account`, {
    ...river,
    ...account,
    is_cross_id: true,
  }).then(extractData);
};

export const deleteOne = (
  data: RiveryId,
): Promise<{ data: string; status: '200' | string }> => {
  return onDeleteV1(true, `${RIVERS_URL}/${data?._id}`).then(extractData);
};

export const modify = (
  data: IRiver,
): Promise<{ data: string; status: '200' | string }> => {
  return patch(`${RIVERS_URL}/modify`, data);
};

// creates new river
export const create = (
  data: IRiver,
): Promise<{ data: string; status: '200' | string }> => {
  const { cross_id, _id, ...payload } = data;
  return putData(`${RIVERS_URL}/modify`, payload);
};

export const run = (cross_id: OID): Promise<IRiverRunResult> => {
  return postBody(`run`, { cross_id });
};

export const runV1 = (cross_id: OID): Promise<any> => {
  return postDataV1(true, `/rivers/${getOId(cross_id)}/run`);
};

const waitingCheckRun = {
  waiting: true,
  account: null,
  total: null,
  runs: null,
  current: null,
  env_id: null,
  _id: null,
  is_subrivers: false,
  river_id: null,
};

export const checkRun = async (
  runResult: ICheckRunPayload,
): Promise<IRiverRunResult> => {
  const res = await postBody(`check_run`, runResult);
  if (res && !Boolean(Object.values(res).length)) {
    return waitingCheckRun;
  }
  return res;
};

type CancelRunResponse = {
  message?: string;
  canceled: string[];
};
export const cancelRun = (payload): Promise<CancelRunResponse> => {
  return postBody(`run/cancel`, payload);
};

export const cancelRunV1 = ({ cross_id, ...rest }) => {
  return apiV1
    .post(getV1Path(true, `/rivers/${cross_id}/cancel_run`), {
      ...rest,
    })
    .then(extractData)
    .catch(extractErrorData);
};

export const riverTypes = (): Promise<ICreateRiverType[]> => {
  return getData('river_types/list');
};
