import { useCallback } from 'react';
import { createRiveryApiV1AccountEnv } from 'store/createRiveryApi';
import { ColumnsResponse } from './types';

type getColumnsArgs = {
  connectionId: string;
  schema_name: string;
  table_id: string;
  target_type: string;
  column_name?: string;
};
export const columnsApi = createRiveryApiV1AccountEnv
  .enhanceEndpoints({
    addTagTypes: ['Mapping'],
  })
  .injectEndpoints({
    endpoints: builder => ({
      getColumns: builder.query<ColumnsResponse, getColumnsArgs>({
        providesTags: ['Mapping'],
        query: ({ connectionId, table_id, schema_name, target_type }) => ({
          url: `connections/${connectionId}/columns`,
          params: {
            table_id,
            schema_name,
            target_type,
            items_per_page: 1000,
          },
        }),
      }),
    }),
  });

export const { useGetColumnsQuery, useLazyGetColumnsQuery } = columnsApi;

export const useGetColumnsTrigger = (args: getColumnsArgs) => {
  const [trigger, result] = useLazyGetColumnsQuery();
  const getColumns = useCallback(async () => {
    const response = await trigger({
      ...args,
    });
    return response.data;
  }, [trigger, args]);

  return { getColumns, ...result };
};
