import { useCallback } from 'react';
import { createRiveryApiV1AccountEnv } from 'store/createRiveryApi';

export const blueprintsApi = createRiveryApiV1AccountEnv
  .enhanceEndpoints({
    addTagTypes: ['Blueprints'],
  })
  .injectEndpoints({
    endpoints: builder => ({
      getBlueprintReports: builder.query<
        any,
        { recipe_id: string; connection_id?: string }
      >({
        providesTags: ['Blueprints'],
        query: ({ recipe_id, connection_id }) => {
          const baseUrl = `/recipes/${recipe_id}/reports`;
          return {
            url: !connection_id
              ? baseUrl
              : `${baseUrl}?connection_id=${connection_id}`,
          };
        },
      }),
      getBlueprintColumns: builder.query<
        any,
        {
          recipe_id: string;
          report_id: string;
          connection_id?: string;
          target_type?: string;
        }
      >({
        providesTags: ['Blueprints'],
        query: ({ recipe_id, report_id, connection_id, target_type }) => {
          const baseUrl = `/recipes/${recipe_id}/columns?report_id=${report_id}&target_type=${target_type}`;
          return {
            url: !connection_id
              ? baseUrl
              : `${baseUrl}&connection_id=${connection_id}`,
            params: { items_per_page: 1000 },
          };
        },
      }),
    }),
  });

export const {
  useGetBlueprintReportsQuery,
  useGetBlueprintColumnsQuery,
  useLazyGetBlueprintColumnsQuery,
  useLazyGetBlueprintReportsQuery,
} = blueprintsApi;

export const useGetBlueprintsColumnsTrigger = ({
  recipe_id,
  report_id,
  connection_id = null,
  target_type = null,
}) => {
  const [trigger, result] = useLazyGetBlueprintColumnsQuery();
  const getBlueprintColumns = useCallback(async () => {
    const response = await trigger({
      recipe_id,
      report_id,
      connection_id,
      target_type,
    });
    return response.data;
  }, [trigger, recipe_id, report_id, connection_id, target_type]);

  return { getBlueprintColumns, ...result };
};

export const useGetBlueprintsReportsTrigger = ({ recipe_id }) => {
  const [trigger, result] = useLazyGetBlueprintReportsQuery();
  const getBlueprintReports = useCallback(
    async connection_id => {
      const response = await trigger({
        recipe_id,
        connection_id,
      });
      return response.data;
    },
    [trigger, recipe_id],
  );

  return { getBlueprintReports, ...result };
};
