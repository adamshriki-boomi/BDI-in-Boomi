import { createRiveryApiV1AccountEnv } from 'store/createRiveryApi';

interface DatasourcePropertiesArgs {
  datasourceId: string;
  [key: string]: any;
}

interface DatasourcePropertiesResponse {
  datasource_id: string;
  inputs: any[];
}

export const genericSourceSettingsApi = createRiveryApiV1AccountEnv
  .enhanceEndpoints({
    addTagTypes: ['GenericSourceSettings'],
  })
  .injectEndpoints({
    endpoints: builder => ({
      getDatasourceProperties: builder.query<
        DatasourcePropertiesResponse,
        DatasourcePropertiesArgs
      >({
        keepUnusedDataFor: 300,
        providesTags: ['GenericSourceSettings'],
        query: ({ datasourceId, ...params }) => ({
          url: '/data_source_properties/properties',
          params: {
            datasource_id: datasourceId,
            ...params,
          },
        }),
      }),
    }),
  });

export const { useGetDatasourcePropertiesQuery } = genericSourceSettingsApi;
