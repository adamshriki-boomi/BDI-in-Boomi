import { getData, getDataV1, postDataV1, putData } from '../api.proxy';

export enum MetadataType {
  DATASETS = 'datasets',
  DATABASES = 'databases',
  CATALOGS = 'catalogs',
  SCHEMAS = 'schemas',
  BUCKETS = 'buckets',
  RESULTS = 'results',
  TEST_BLUEPRINT = 'preview_data',
  CONTAINERS = 'containers',
  GET_RESULTS = 'get_results',
  WORKSPACES = 'workspaces',
  LAKEHOUSES = 'lakehouses',
  KNOWLEDGE_BASES = 'knowledge_bases',
  REPOSITORIES = 'repositories',
}

export const getMetadata = (
  data,
  type: MetadataType,
  errorAssertion: () => void = null,
) => {
  if (errorAssertion) errorAssertion();
  const result = putData(`/pull/${type}`, data);
  return result;
};

export const getMetadataV1 = (data, errorAssertion: () => void = null) => {
  if (errorAssertion) errorAssertion();
  const result = postDataV1(true, `/pull_requests`, data);
  return result;
};

export const pollMetadata = id => getData('/pull', { id });

export const pollMetadataV1 = id => getDataV1(true, `/operations/${id}`);

type ResultsResponse = {
  error_message: string;
  run_id: string;
  compiled_query: string;
  results: Record<string, any>[];
  query_limit: number;
};
export const getResults = (id: string): Promise<ResultsResponse> => {
  return getData(`${MetadataType.RESULTS}/${id}`);
};
