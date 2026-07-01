import { useCallback } from 'react';
import { createRiveryApiV1AccountEnv } from 'store/createRiveryApi';
import { SchemasResponse, TablesResponse } from './schemas.types';
import { getDataV1 } from '../../../api/api.proxy';
import { stringifyParams } from '../../../utils/searchParams';

export type getTableArgs = {
  connectionId: string;
  schema_name: string;
  tableIds?: string[];
  tableName?: string;
  nextPage?: string;
  prevPage?: string;
  include_ids?: string;
  extract_api?: string;
  extractMethod?: string;
};
type getSchemas = {
  connectionId: string;
  schemaName?: string;
  items_per_page?: number;
  riverId?: string;
};
type getBulkTablesArgs = {
  connectionId: string;
  schemas: Array<{
    schemaName: string;
    tableIds: string[];
  }>;
};
export const schemasApi = createRiveryApiV1AccountEnv
  .enhanceEndpoints({
    addTagTypes: ['Schema'],
  })
  .injectEndpoints({
    endpoints: builder => ({
      getSchemas: builder.query<SchemasResponse, getSchemas>({
        providesTags: ['Schema'],
        query: ({
          connectionId,
          schemaName: schema_name = null,
          items_per_page = 20,
          riverId: river_id = null,
        }) => ({
          url: `connections/${connectionId}/schemas`,
          params: {
            items_per_page,
            ...(schema_name && { schema_name }),
            ...(river_id && { river_id }),
          },
        }),
      }),
      getTables: builder.query<TablesResponse, getTableArgs>({
        keepUnusedDataFor: 0,
        providesTags: ['Schema'],
        query: ({
          connectionId,
          schema_name,
          tableIds: tables_ids = undefined,
          tableName: table_name = undefined,
          nextPage: next_page_id = undefined,
          prevPage: previous_page_id = undefined,
          include_ids = undefined,
          extract_api = undefined,
          extractMethod: extract_method = undefined,
        }) => ({
          url: `connections/${connectionId}/tables`,
          params: {
            schema_name,
            tables_ids,
            table_name,
            next_page_id,
            previous_page_id,
            include_ids,
            extract_api,
            ...(extract_method && { extract_method }),
            items_per_page: 100,
          },
        }),
      }),
      getBulkTables: builder.query<Array<TablesResponse>, getBulkTablesArgs>({
        keepUnusedDataFor: 0,
        providesTags: ['Schema'],
        queryFn: async ({ connectionId, schemas }: getBulkTablesArgs) => {
          const tables = [];

          for (const { schemaName, tableIds } of schemas) {
            const params = stringifyParams({
              schema_name: schemaName,
              tables_ids: tableIds.join(','),
            });
            const res = await getDataV1(
              true,
              `/connections/${connectionId}/tables?${params}`,
            );
            tables.push(res?.items);
          }
          return { data: tables };
        },
      }),
    }),
  });

export const {
  useGetSchemasQuery,
  useLazyGetSchemasQuery,
  useGetTablesQuery,
  useLazyGetTablesQuery,
  useGetBulkTablesQuery,
  useLazyGetBulkTablesQuery,
} = schemasApi;

export const useGetSchemasTrigger = (args: getSchemas) => {
  const [trigger, result] = useLazyGetSchemasQuery();
  const getSchemas = useCallback(async () => {
    const response = await trigger({
      ...args,
    });
    return response.data;
  }, [trigger, args]);

  return { getSchemas, ...result };
};

export const useGetTablesTrigger = () => {
  const [trigger, result] = useLazyGetTablesQuery();
  const getTables = useCallback(
    async (args: getTableArgs) => {
      const response = await trigger({
        ...args,
      });
      return response.data;
    },
    [trigger],
  );

  return { getTables, ...result };
};

export const useGetBulkTablesTrigger = () => {
  const [trigger, result] = useLazyGetBulkTablesQuery();
  const getBulkTables = useCallback(
    async (args: getBulkTablesArgs) => {
      const response = await trigger(args);
      return response.data;
    },
    [trigger],
  );

  return { getBulkTables, ...result };
};
