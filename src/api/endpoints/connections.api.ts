import {
  AWSDetailsResponse,
  FileZoneResponse,
  IConnection,
  IConnectionKeyPair,
  IConnectionType,
  ISingleKeyPair,
  OID,
  PullTestConnectionResult,
  TestResponse,
} from 'api/types';
import { getCrossId } from 'utils/api.sanitizer';
import {
  extractData,
  extractErrorData,
  getData,
  patch,
  post,
  postBody,
  putData,
} from '../api.proxy';

const getApiUrl = (path = '') => `/connections${path}`;
const getConnections = (path: string, params = {}) =>
  getData(getApiUrl(path), params);
const postConnections = (path: string, body = {}) =>
  postBody(getApiUrl(path), body);

// API
export const list = (): Promise<IConnection> => {
  return getConnections('/list');
};

export const fetchConnectionByType = (
  connection_type: string,
): Promise<IConnectionType[]> => {
  return getConnections('', { connection_type });
};

export const test = (
  connection_type: string,
  props: IConnection,
): Promise<TestResponse> => {
  return postBody(getApiUrl('/test'), {
    connection_type,
    is_test_connection: true,
    file_type: 'json',
    ...props,
  });
};

export const testConnection = (id: string): Promise<TestResponse> => {
  return getData(`connections/test?id=${id}`);
};

export const pullTestConnection = (
  id: string,
): Promise<PullTestConnectionResult> => {
  return getData('pull_test_connection', { id });
};

// TODO define type
// type GetCredentialsResponse = {};
export const getCredentials = (auth: Partial<OAuth2Response>): Promise<any> => {
  return postBody('get_credentials', auth);
};

export type OAuth2Response = {
  pull_id: string;
  auth_uri: string;
  oauth_token: string;
  message?: string;
};
export const fetchOAuth = (params): Promise<OAuth2Response> => {
  return post('oauth2request', params)
    .then(extractData)
    .catch(extractErrorData);
};

export const postShareLink = (connectionType: string, email: string) => {
  return post(getApiUrl(`/share_creation_by_email/${connectionType}`), {
    email,
  });
};

export const shareCreationLink = (
  connectionType: string,
): Promise<{ url: string }> => {
  return getConnections(`/share_creation_link/${connectionType}`);
};

type CreateFileResponse = {
  is_key_file: boolean;
  key_file_name: string;
};

export const createFile = (data): Promise<CreateFileResponse> => {
  return postBody(getApiUrl('/create/file'), data).then(
    response => response?.key_file_name,
  );
};

export interface CreateConnectionResponse {
  cross_id: OID;
  status_code: number;
  message: string;
  _id: OID;
  connection_name: string;
}
export const createConnection = async (
  data: Record<string, any>,
): Promise<CreateConnectionResponse> => {
  return await putData(getApiUrl('/create/data'), data);
};
export const updateConnection = async (
  data: Record<string, any>,
): Promise<CreateConnectionResponse> => {
  return await patch(getApiUrl(), data, { params: { _id: getCrossId(data) } });
};

export const getFileZoneConnections = async (
  connectionType: string,
): Promise<FileZoneResponse> => {
  return await getData(`target_ids/fz/${connectionType}`);
};

export const getKeyPairs = async (
  connection_type: string,
): Promise<IConnectionKeyPair[]> => {
  return await getConnections(`/key_pairs`, { connection_type });
};

export const getKeyPair = async (id: string): Promise<ISingleKeyPair> => {
  return await getConnections(`/key_pair`, { id });
};

export const createKeyPair = async ({
  connectionType: connection_type,
  ...rest
}): Promise<ISingleKeyPair> => {
  return await postConnections(`/key_pair`, { connection_type, ...rest });
};

export const getAWSDetailsCall = async (
  source = 's3',
): Promise<AWSDetailsResponse> => {
  return await getData(getApiUrl(`/externalId/${source}`));
};
