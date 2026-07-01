import { getDataV1, postDataV1 } from 'api/api.proxy';
import { PollingStatus } from 'api/endpoints/files.api';
import { useCallback } from 'react';
import { createRiveryApiV1AccountEnv } from 'store/createRiveryApi';
import { omitEmptyKeys } from 'utils/array.utils';
import { fetchAllPages } from 'utils/query.utils';
import { alphaNumericValidation } from 'utils/validations';
import { IDataframe } from './dataframes.types';
export const REDUCER_KEY = 'dataframes';

const ENDPOINT = 'dataframes';
const MAX_LENGTH = 40;
export const dataframeApi = createRiveryApiV1AccountEnv
  .enhanceEndpoints({
    addTagTypes: ['Dataframes'],
  })
  .injectEndpoints({
    endpoints: builder => {
      return {
        getDataframes: builder.query<IDataframe[], void>({
          queryFn: async (arg, api, extraOptions, baseQuery) => {
            try {
              const data = await fetchAllPages<IDataframe>(baseQuery, ENDPOINT);
              return { data };
            } catch (error) {
              return { error };
            }
          },
          providesTags: ['Dataframes'],
        }),
        deleteDataframe: builder.mutation<void, string>({
          query: dataframeId => ({
            url: `${ENDPOINT}/${dataframeId}`,
            method: 'DELETE',
          }),
          invalidatesTags: ['Dataframes'],
        }),
        createDataframe: builder.mutation<IDataframe, Partial<IDataframe>>({
          query: body => ({
            url: ENDPOINT,
            method: 'POST',
            body: normalizeDataFrame(body),
          }),
          invalidatesTags: ['Dataframes'],
        }),
        updateDataframe: builder.mutation<
          IDataframe,
          Pick<IDataframe, 'connection_settings' | 'name' | 'retention'>
        >({
          query: body => ({
            url: `${ENDPOINT}/${body?.name}`,
            method: 'PUT',
            body: normalizeDataFrame(body),
          }),
          invalidatesTags: ['Dataframes'],
        }),
        // clearDataFrame: builder.mutation<void, string>({
        //   query: dataframeId => ({
        //     url: `${ENDPOINT}/${dataframeId}/clear`,
        //     method: 'PUT',
        //   }),
        // }),
      };
    },
  });

export const {
  useGetDataframesQuery,
  useCreateDataframeMutation,
  useDeleteDataframeMutation,
  useUpdateDataframeMutation,
  // useClearDataFrameMutation,
} = dataframeApi;

/**
 * removes 'connection_settings' if it's empty
 */
const normalizeDataFrame = (dataFrame: Partial<IDataframe>) => {
  return omitEmptyKeys<IDataframe>(dataFrame, ['connection_settings']);
};

export const lettersNumberUnderscoreRegex = /^\w+$/gim;
/**
 * validates a data frame name according to:
 * - nameExists
 * - containsInvalidChars
 * @returns isInvalid(name: string) => string, returns false if Valid
 */
export const useDataFrameNameValidator = () => {
  const { data } = useGetDataframesQuery();
  return useCallback(
    (name: string) => {
      const re = new RegExp(`^${name.replace(/\\+$/, '')}$`, 'i');
      const errors = [
        {
          code: 'nameExists',
          invalid: Boolean(data.find(({ name }) => name.match(re))),
        },
        {
          code: 'tooLong',
          invalid: Boolean(name?.length > MAX_LENGTH),
        },
        {
          code: 'containsInvalidChars',
          invalid: !Boolean(name?.match(alphaNumericValidation)),
        },
      ];
      const error = errors.find(subject => Boolean(subject.invalid));
      return error ? error.code : false;
    },
    [data],
  );
};

export function clearCheckStatus(operationId, onComplete) {
  getDataV1(true, `/operations/${operationId}`)
    .then(data => {
      if (data?.status === 'W' || data?.status === 'R') {
        setTimeout(() => clearCheckStatus(operationId, onComplete), 2000);
        return;
      }
      if (data?.status === 'D') {
        onComplete(PollingStatus.COMPLETED, 'Process');
      }
    })
    .catch(() => onComplete(PollingStatus.FAILED, 'Process'));
}

export function clearDataframe(dataframeId, onComplete) {
  postDataV1(true, `/dataframes/${dataframeId}/clear`)
    .then(data => {
      clearCheckStatus(data?.operation_id, onComplete);
    })
    .catch(() => onComplete(PollingStatus.FAILED, 'Process'));
}
