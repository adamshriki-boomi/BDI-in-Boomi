import { IDataSource, IDataSourceConnection, IDataSourceV1 } from 'api/types';
import { extractItems } from 'containers/Activities';
import { ICollectionResponse } from 'containers/Activities/store/activities.types';
import { FetchDataSourcePayload } from 'modules/ConnectionModal';
import dataConnectorAgentConnection from 'modules/SourceTarget/components/DataConnectorAgent';
import { createRiveryApi, createRiveryApiV1 } from 'store/createRiveryApi';
import { compare, pluck } from 'utils/array.utils';

export enum LabelsSources {
  SOON = 'coming_soon',
  ALPHA = 'alpha',
  ENABLED = 'enabled',
}

export const dsApi = createRiveryApi
  .enhanceEndpoints({
    addTagTypes: ['Datasources', 'Sections'],
  })
  .injectEndpoints({
    endpoints: builder => ({
      getDataSource: builder.query<
        IDataSourceConnection,
        FetchDataSourcePayload
      >({
        providesTags: ['Datasources'],
        query: ({ connectionType }) => ({
          url: `datasource_types/all`,
          params: { connection_type: connectionType },
        }),
        transformResponse: (response: IDataSource[], meta, arg) => {
          const { dataSourceId } = arg;
          const res = response?.flatMap(
            pluck('section_datasources'),
          ) as IDataSourceConnection[];
          const { _id, ...ds } = response?.[0]?.section_name
            ? res?.find(compare('_id' as any, dataSourceId)) || undefined
            : (response?.[0] as any);
          return { ...ds, id: _id }; //changing _id to id because new api uses id
        },
      }),
      getAllDataSources: builder.query<any, any>({
        providesTags: ['Datasources'],
        query: (segment = null) => {
          const params = { items_per_page: 400 };
          return {
            url: 'data_source_types',
            params: segment ? { segment, ...params } : params,
          };
        },
        transformResponse: (response: ICollectionResponse<any>) =>
          response?.items || [], //change to extractItems after db will be replaced,
      }),
      getAllSections: builder.query<any, any>({
        providesTags: ['Sections'],
        query: (segment = null) => {
          const params = { items_per_page: 400 };
          return {
            url: 'data_source_sections',
            params: segment ? { ...params, segment } : params,
          };
        },
        transformResponse: extractItems,
      }),
    }),
  });
export const dsApiV1 = createRiveryApiV1
  .enhanceEndpoints({
    addTagTypes: ['Datasources', 'Sections'],
  })
  .injectEndpoints({
    endpoints: builder => ({
      getAllDataSources: builder.query<IDataSourceV1[], any>({
        providesTags: ['Datasources'],
        keepUnusedDataFor: Infinity,
        query: (segment = null) => {
          const params = { items_per_page: 400 };
          return {
            url: 'data_source_types',
            params: segment ? { segment, ...params } : params,
          };
        },
        transformResponse: (response: ICollectionResponse<any>, meta, arg) => {
          const items = response?.items || [];

          // If segment is "source", add dataConnectorAgentConnection
          if (arg === 'source') {
            return [dataConnectorAgentConnection, ...items];
          }

          return items;
        },
      }),
      getAllSections: builder.query<any, any>({
        providesTags: ['Sections'],
        keepUnusedDataFor: Infinity,
        query: (segment = null) => {
          const params = { items_per_page: 400 };
          return {
            url: 'data_source_sections',
            params: segment ? { ...params, segment } : params,
          };
        },
        transformResponse: extractItems,
      }),
    }),
  });

export const { useGetDataSourceQuery } = dsApi;
export const { useGetAllDataSourcesQuery, useGetAllSectionsQuery } = dsApiV1;
