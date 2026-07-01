import { api, apiV1, extractData, getDataV1, post } from 'api/api.proxy';
import { getMatchUrl } from 'store/core/core.effects';

export const postBody = (...args) =>
  post
    .apply(api, args)
    .then(extractData)
    .catch(error => error?.response);

export const retryAction = _id => postBody('/retry', { _id });

export const downloadlog = (riverId, runId, isBlueprint = false) => {
  const match = getMatchUrl();
  const baseUrl = `/accounts/${match?.params?.account}/environments/${match?.params?.env}`;
  const downloadLogsUrl = `${baseUrl}/rivers/${riverId}/runs/${runId}/logs${
    isBlueprint ? '?additional_subsystem=recipe-service' : ''
  }`;

  return apiV1
    .get(downloadLogsUrl)
    .then(res => {
      return {
        data: res?.data,
        status: res?.status,
      };
    })
    .catch(e => {
      throw e.response.data;
    });
};

export const downloadStepLog = (river, runId, stepId, iteration) => {
  const params = iteration ? { iteration_number: iteration } : {};
  return getDataV1(
    true,
    `/rivers/${river}/runs/${runId}/logic_steps/${stepId}/logs`,
    params,
  );
};
