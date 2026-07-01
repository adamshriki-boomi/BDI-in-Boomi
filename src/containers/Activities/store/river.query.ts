import { IRiver } from 'api/types';
import { createRiveryApi } from 'store/createRiveryApi';
import { createRiverId } from 'utils/api.sanitizer';

export const riverApi = createRiveryApi
  .enhanceEndpoints({
    addTagTypes: ['River'],
  })
  .injectEndpoints({
    endpoints: builder => ({
      fetchRiver: builder.query<IRiver, string>({
        providesTags: ['River'],
        query: crossId => ({
          url: `rivers/list`,
          method: 'POST',
          body: { ...createRiverId(crossId), force: true },
        }),
      }),
    }),
  });

export const { useFetchRiverQuery } = riverApi;
