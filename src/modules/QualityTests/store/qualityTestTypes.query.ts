import { useMemo } from 'react';
import { createRiveryApi } from 'store/createRiveryApi';
import { IQualityTestType } from './qualityTestTypes.types';

export const qualityTestTypesApi = createRiveryApi
  .enhanceEndpoints({
    addTagTypes: ['QualityTestType'],
  })
  .injectEndpoints({
    endpoints: builder => ({
      getTestTypes: builder.query<IQualityTestType[], void>({
        query: () => 'data_quality_test_types',
        providesTags: ['QualityTestType'],
      }),
    }),
  });

export const { useGetTestTypesQuery } = qualityTestTypesApi;

export function useTestTypesMap() {
  const { data } = useGetTestTypesQuery();
  return useMemo(() => {
    return data?.reduce(
      (map, test) => map.set(test._id, test) && map,
      new Map(),
    );
  }, [data]);
}
