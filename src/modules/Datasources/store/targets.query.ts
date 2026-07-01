import { IDataTarget } from 'api/types';
import { extractItems } from 'containers/Activities';
import { createRiveryApiV1 } from 'store/createRiveryApi';

export const targetsApi = createRiveryApiV1
  .enhanceEndpoints({
    addTagTypes: ['Targets'],
  })
  .injectEndpoints({
    endpoints: builder => ({
      getTargetTypes: builder.query<IDataTarget[], void>({
        providesTags: ['Targets'],
        query: () => {
          const params = { items_per_page: 400 };
          return {
            url: 'target_types',
            params,
          };
        },
        transformResponse: extractItems,
      }),
    }),
  });

export const { useGetTargetTypesQuery } = targetsApi;
