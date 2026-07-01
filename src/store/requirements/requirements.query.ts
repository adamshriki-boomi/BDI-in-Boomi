import { API } from 'api';
import { createRiveryApiV1 } from 'store/createRiveryApi';
export const REDUCER_KEY = 'requirements';

export const requirementsApi = createRiveryApiV1.injectEndpoints({
  endpoints: builder => {
    return {
      getRequirements: builder.query<string, void>({
        queryFn: async () => {
          const data = await API.requirements.fetch();
          return { data };
        },
      }),
    };
  },
});

export const { useGetRequirementsQuery } = requirementsApi;
