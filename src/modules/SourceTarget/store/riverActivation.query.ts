import { API } from 'api';
import { postDataV1 } from 'api/api.proxy';
import { createRiveryApiV1AccountEnv } from 'store/createRiveryApi';

// interface ICDC {
//   config: {
//     last_updated: string;
//     datasource_type: string;
//     binlog_file: string;
//     binlog_position: string;
//     gtid: string;
//   };
// }

const postActivationRequest = (query, errorAssertion: () => void = null) => {
  if (errorAssertion) errorAssertion();
  const result = postDataV1(true, `/rivers/${query.crossId}/activate_river`);
  return result;
};

const postDisableRequest = (query, errorAssertion: () => void = null) => {
  if (errorAssertion) errorAssertion();
  const result = postDataV1(true, `/rivers/${query.crossId}/disable_river`);
  return result;
};

export const riverActivateApi = createRiveryApiV1AccountEnv
  .enhanceEndpoints({
    addTagTypes: ['RiverActivation'],
  })
  .injectEndpoints({
    endpoints: builder => ({
      enableRiver: builder.mutation<any, Record<string, any>>({
        queryFn: async (query, { getState }) => {
          const pollingHandle = await postActivationRequest(query);
          let pollingStatus = ['R', 'W'].includes(pollingHandle.status)
            ? await API.metadata.pollMetadataV1(pollingHandle.operation_id)
            : pollingHandle;
          if (['R', 'W'].includes(pollingStatus.status)) {
            const { operation_id } = pollingStatus;
            pollingStatus = await new Promise(resolve =>
              resolve(API.metadata.pollMetadataV1(operation_id)),
            );
            return {
              data: {
                ...pollingStatus,
                operation_id: pollingHandle.operation_id,
              },
            };
          } else {
            const message: string = pollingStatus.detail;
            return {
              error: {
                status: pollingStatus.status,
                message,
                data: undefined,
              },
            };
          }
        },
      }),
      disableRiver: builder.mutation<any, Record<string, any>>({
        queryFn: async (query, { getState }) => {
          const pollingHandle = await postDisableRequest(query);
          let pollingStatus = ['R', 'W'].includes(pollingHandle.status)
            ? await API.metadata.pollMetadataV1(pollingHandle.operation_id)
            : pollingHandle;
          if (['R', 'W'].includes(pollingStatus.status)) {
            const { operation_id } = pollingStatus;
            pollingStatus = await new Promise(resolve =>
              resolve(API.metadata.pollMetadataV1(operation_id)),
            );
            return {
              data: {
                ...pollingStatus,
                operation_id: pollingHandle.operation_id,
              },
            };
          } else {
            const message: string = pollingStatus.detail;
            return {
              error: {
                status: pollingStatus.status,
                message,
                data: undefined,
              },
            };
          }
        },
      }),
    }),
  });

export const { useEnableRiverMutation, useDisableRiverMutation } =
  riverActivateApi;
