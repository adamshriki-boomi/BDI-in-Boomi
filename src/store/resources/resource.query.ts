import { ResponseResources } from 'api/types';
import { createRiveryApiV1 } from 'store/createRiveryApi';

const ENDPOINT = 'logicode_resources';
export const resourcesApi = createRiveryApiV1.injectEndpoints({
  endpoints: builder => {
    return {
      getResources: builder.query<ResponseResources, void>({
        query: () => ENDPOINT,
      }),
    };
  },
});

export const { useGetResourcesQuery } = resourcesApi;
