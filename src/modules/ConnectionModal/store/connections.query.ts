import { IConnection } from 'api/types';
import { createRiveryApi } from 'store/createRiveryApi';

// const convertOIDarrToString = (testIds: any[]) =>
//   testIds?.map(pluck('id')).join(',');

const CONNECTIONS_ENDPOINT = 'connections';

export const connectionsApi = createRiveryApi
  .enhanceEndpoints({
    addTagTypes: ['Connections', 'Connection'],
  })
  .injectEndpoints({
    endpoints: builder => ({
      getConnection: builder.query<IConnection, string>({
        providesTags: ['Connection'],
        query: (_id: string) => ({
          url: CONNECTIONS_ENDPOINT,
          params: { _id },
        }),
        keepUnusedDataFor: 0,
        transformResponse: (response: IConnection[]) => {
          return response?.[0];
        },
      }),
      getConnectionDetails: builder.query<any, any>({
        providesTags: ['Connection'],
        query: ({ create_connection, token }) => ({
          url: 'connection/get_details',
          params: { state: create_connection },
        }),
      }),
      getConnectionRelatedRivers: builder.query<any, any>({
        providesTags: ['Connection'],
        query: ({ connection }) => ({
          url: 'connections/rivers',
          params: { _id: connection },
        }),
      }),
    }),
  });

export const {
  useGetConnectionQuery,
  useLazyGetConnectionQuery,
  useLazyGetConnectionRelatedRiversQuery,
  useGetConnectionDetailsQuery,
} = connectionsApi;
