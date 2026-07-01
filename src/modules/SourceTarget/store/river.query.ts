import { useCallback } from 'react';
import { createRiveryApiV1AccountEnv } from 'store/createRiveryApi';
import { omitFromObject } from 'utils/array.utils';
import {
  convertRiverToPayload,
  convertSchemasArrayToObject,
  replaceSchemas,
} from './api.utils';
import { IRiverResponseV1, IRiverV1, IRunResponse } from './types';

const normalizeRiver = (river: IRiverV1) => {
  return omitFromObject(convertRiverToPayload(river), {
    account_id: true,
    cross_id: true,
    environment_id: true,
    environment_name: true,
  });
};
export const riverApi = createRiveryApiV1AccountEnv
  .enhanceEndpoints({
    addTagTypes: ['STTRiver'],
  })
  .injectEndpoints({
    endpoints: builder => ({
      getRiver: builder.query<IRiverV1, string>({
        providesTags: ['STTRiver'],
        query: crossId => `rivers/${crossId}`,
        // transform response of `schemas` and `tables` to key/value
        transformResponse(response: IRiverResponseV1) {
          const schemas = convertSchemasArrayToObject(
            response.properties.schemas,
          );
          return replaceSchemas(response, schemas);
        },
      }),
      getRiverRaw: builder.query<IRiverResponseV1, string>({
        query: crossId => `rivers/${crossId}`,
      }),
      // transform body request's `schemas` and `tables` to arrays before submitting BACK
      updateRiver: builder.mutation<IRiverResponseV1, IRiverV1>({
        query: river => ({
          url: `rivers/${river.cross_id}`,
          method: 'PUT',
          body: normalizeRiver(river),
        }),
        transformResponse: transformResponseToKeyValue,
        // We don't want to invalidate the tags because it will cause a page rerender
        // invalidatesTags: ['STTRiver'],
      }),
      createRiver: builder.mutation<IRiverResponseV1, IRiverV1>({
        query: body => ({
          url: `rivers`,
          method: 'POST',
          body: convertRiverToPayload(body),
        }),
        transformResponse: transformResponseToKeyValue,
        invalidatesTags: ['STTRiver'],
      }),
      runRiver: builder.mutation<IRunResponse, { river_cross_id: string }>({
        query: ({ river_cross_id }) => ({
          url: `rivers/${river_cross_id}/run`,
          method: 'POST',
        }),
      }),
      cancelRun: builder.mutation<
        Record<'details', string>,
        { river_cross_id: string; run_id: string; run_group_id: string }
      >({
        query: ({ river_cross_id, run_group_id }) => ({
          url: `rivers/${river_cross_id}/cancel_run`,
          method: 'POST',
          body: { run_group_id },
        }),
        invalidatesTags: ['STTRiver'],
      }),
    }),
  });

export const {
  useGetRiverQuery,
  useLazyGetRiverQuery,
  useLazyGetRiverRawQuery,
  useUpdateRiverMutation,
  useCreateRiverMutation,
  useRunRiverMutation,
  useCancelRunMutation,
} = riverApi;

export function transformResponseToKeyValue(response: IRiverResponseV1) {
  const schemas = convertSchemasArrayToObject(response.properties.schemas);
  return replaceSchemas(response, schemas);
}

export const useGetRiverTrigger = (id: string) => {
  const [get, result] = useLazyGetRiverQuery();
  const getRiver = useCallback(async () => {
    const response = await get(id);
    return response.data;
  }, [get, id]);

  return { getRiver, ...result };
};
