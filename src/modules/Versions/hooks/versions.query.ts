import { createRiveryApiV1AccountEnv } from 'store/createRiveryApi';
import { IRiverVersionData, IVersionsResponse } from './versions.types';

type getVersionConfig = {
  crossId: string;
  versionId: string;
};
export const riverApi = createRiveryApiV1AccountEnv
  .enhanceEndpoints({
    addTagTypes: ['Versions'],
  })
  .injectEndpoints({
    endpoints: builder => ({
      getRiverVersions: builder.query<IVersionsResponse, string>({
        providesTags: ['Versions'],
        query: crossId => `rivers/${crossId}/versions?items_per_page=100`,
      }),
      getRiverVersion: builder.query<IRiverVersionData, getVersionConfig>({
        providesTags: ['Versions'],
        query: ({ crossId, versionId }) =>
          `rivers/${crossId}/versions/${versionId}`,
      }),
    }),
  });

export const { useGetRiverVersionsQuery, useGetRiverVersionQuery } = riverApi;
