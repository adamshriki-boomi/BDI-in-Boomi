import { DataQualityTestMeta } from 'api/types';
import { createRiveryApi } from 'store/createRiveryApi';
import { pluck } from 'utils/array.utils';
import {
  IQualityTest,
  IQualityTestCreatePayload,
  IQualityTestUpdatePayload,
  ITestId,
} from './qualityTests.types';

export const convertOIDarrToString = (testIds: DataQualityTestMeta[]) =>
  testIds?.map(pluck('id')).join(',');
const normalizeValuesToString = (value: ITestId) =>
  Array.isArray(value) ? value.join(',') : value;

const ENDPOINT = 'data_quality_tests';

export const qualityTestsApi = createRiveryApi
  .enhanceEndpoints({
    addTagTypes: ['QualityTests'],
  })
  .injectEndpoints({
    endpoints: builder => ({
      getTests: builder.query<IQualityTest[], string>({
        // query: createSlug,
        providesTags: ['QualityTests'],
        query: ids => ({
          url: ENDPOINT,
          params: { ids },
        }),
      }),
      deleteQualityTest: builder.mutation<IQualityTest, string>({
        query: id => ({
          url: `${ENDPOINT}/${id}`,
          method: 'DELETE',
        }),
        invalidatesTags: ['QualityTests'],
      }),
      deleteQualityTests: builder.mutation<IQualityTest, ITestId>({
        query: ids => ({
          url: ENDPOINT,
          method: 'DELETE',
          params: { ids: normalizeValuesToString(ids) },
        }),
        invalidatesTags: ['QualityTests'],
      }),
      updateQualityTest: builder.mutation<
        IQualityTest[],
        IQualityTestUpdatePayload | IQualityTestUpdatePayload[]
      >({
        query: body => ({
          url: ENDPOINT,
          method: 'PUT',
          body,
        }),
        invalidatesTags: ['QualityTests'],
      }),
      createQualityTest: builder.mutation<
        IQualityTestCreatePayload | IQualityTestCreatePayload[],
        IQualityTestCreatePayload | IQualityTestCreatePayload[]
      >({
        query: body => ({
          url: ENDPOINT,
          method: 'POST',
          body,
        }),
        /**
         * because tests are fetched by a list of ids, we need to update the query params of getTests with the new id
         * thus, no need to invalidate tags
         */
      }),
    }),
  });

export const {
  useCreateQualityTestMutation,
  useGetTestsQuery,
  useDeleteQualityTestMutation,
  useUpdateQualityTestMutation,
} = qualityTestsApi;
