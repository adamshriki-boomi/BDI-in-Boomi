import { API } from 'api';
import { onDeleteV1 } from 'api/api.proxy';
import { EditEnvironment, IAddEnvironment, IEnvironment } from 'api/types';
import { createRiveryApiV1 } from 'store/createRiveryApi';
import { fetchAllPages } from 'utils/query.utils';
export const REDUCER_KEY = 'environments';

const ENDPOINT = 'environments';
export const environmentsApi = createRiveryApiV1
  .enhanceEndpoints({
    addTagTypes: ['Environments'],
  })
  .injectEndpoints({
    endpoints: builder => {
      return {
        getEnvironments: builder.query<IEnvironment[], string>({
          queryFn: async (arg, { getState }, extraOptions, baseQuery) => {
            const state: any = getState();
            const { selectedAccountId } = state.core;
            try {
              const data = await fetchAllPages<IEnvironment>(
                baseQuery,
                `/accounts/${selectedAccountId}/${ENDPOINT}?${arg}`,
              );
              return { data };
            } catch (error) {
              return { error };
            }
          },
          providesTags: ['Environments'],
        }),
        getEnvironmentsTotals: builder.query<
          IEnvironment[],
          { selectedAccountId; envId }
        >({
          query: ({ envId, selectedAccountId }) => ({
            url: `/accounts/${selectedAccountId}/${ENDPOINT}/${envId}/totals`,
          }),
        }),
        addEnvironment: builder.mutation<IEnvironment, IAddEnvironment>({
          query: ({
            selectedAccountId,
            name,
            color,
            description,
            is_default,
          }) => ({
            url: `/accounts/${selectedAccountId}/${ENDPOINT}`,
            method: 'POST',
            body: {
              name,
              color,
              description,
              is_default,
            },
          }),
          invalidatesTags: ['Environments'],
        }),
        editEnvironment: builder.mutation<IEnvironment, EditEnvironment>({
          query: ({
            selectedAccountId,
            id,
            environment_name,
            color,
            description,
            is_default,
          }) => ({
            url: `/accounts/${selectedAccountId}/${ENDPOINT}/${id}`,
            method: 'PUT',
            body: {
              ...(environment_name && { environment_name }),
              ...(color && { color }),
              ...(description && { description }),
              ...(is_default && { is_default }),
            },
          }),
          invalidatesTags: ['Environments'],
        }),
        deleteEnvironment: builder.mutation<any, { id: string }>({
          queryFn: async (query, { getState }) => {
            const state: any = getState();
            const { selectedAccountId } = state.core;
            const { id } = query;
            try {
              const { data }: any = await onDeleteV1(
                false,
                `/accounts/${selectedAccountId}/${ENDPOINT}/${id}`,
              );
              let pollingStatus = ['R', 'W'].includes(data.status)
                ? await API.metadata.pollMetadataV1(data.operation_id)
                : data;

              while (['R', 'W'].includes(pollingStatus.status)) {
                const { operation_id } = pollingStatus;
                pollingStatus = await new Promise(resolve =>
                  setTimeout(
                    resolve,
                    1000,
                    API.metadata.pollMetadataV1(operation_id),
                  ),
                );
              }
              if (pollingStatus.status === 'D') {
                return pollingStatus.result;
              }
              if (pollingStatus.status === 'E') {
                return { error: pollingStatus.error_message };
              }
            } catch (error) {
              return { error };
            }
          },
          invalidatesTags: ['Environments'],
        }),
      };
    },
  });

export const {
  useGetEnvironmentsQuery,
  useLazyGetEnvironmentsQuery,
  useLazyGetEnvironmentsTotalsQuery,
  useAddEnvironmentMutation,
  useEditEnvironmentMutation,
  useDeleteEnvironmentMutation,
} = environmentsApi;
