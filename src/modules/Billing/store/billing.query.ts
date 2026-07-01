import { createRiveryApiV1 } from 'store/createRiveryApi';

const ENDPOINT = 'plans';

export const plansApi = createRiveryApiV1
  .enhanceEndpoints({
    addTagTypes: ['Plans'],
  })
  .injectEndpoints({
    endpoints: builder => {
      return {
        getPlans: builder.query<any, void>({
          query: () => ({
            url: ENDPOINT,
          }),
          providesTags: ['Plans'],
        }),
      };
    },
  });

export const { useGetPlansQuery } = plansApi;
