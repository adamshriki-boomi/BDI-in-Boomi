import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { apiV1, getDataV1 } from 'api/api.proxy';
import { getMatchUrl } from 'store/core/core.effects';
import { createRiveryApiV1AccountEnv } from 'store/createRiveryApi';
import { stringifyParams } from 'utils/searchParams';

// TODO: fix this usage
function getPrefixAccount() {
  const match = getMatchUrl();
  return `/accounts/${match?.params?.account}/environments/${match?.params?.env}/`;
}

interface IBlueprint {
  cross_id: string;
  environment_id: string;
  account_id: string;
  created_by: string;
  created_at: Date;
  name: string;
  updated_at: Date;
  updated_by: string;
  file_cross_id: string;
  description: string;
}

interface BlueprintsResponse {
  next_page: string;
  previous_page: string;
  page: number;
  current_page_size: number;
  total_items: number;
  account_id: string;
  items: IBlueprint[];
}

interface IBlueprintFile {
  filename: string;
  presigned_url: string;
  last_updated_at: Date;
  cross_id: string;
  last_updated_by: string;
}

interface IChatStatus {
  id: string;
  status: string;
  yaml: string;
  variables_to_populate: string[];
  prompt: string;
}

const stringifyUrlParams = (url, params) => `${url}?${stringifyParams(params)}`;
const createBlueprintsQuery =
  () =>
  ({ account_id, ...params }) => {
    return {
      url: stringifyUrlParams(`/recipes`, {
        ...params,
      }),
      invalidatesTags: ['Blueprints'],
    };
  };

export const blueprintsApi = createRiveryApiV1AccountEnv
  .enhanceEndpoints({
    addTagTypes: ['Blueprints', 'SingleBlueprint'],
  })
  .injectEndpoints({
    endpoints: builder => ({
      getBlueprintsList: builder.query<BlueprintsResponse, null>({
        providesTags: ['Blueprints'],
        query: createBlueprintsQuery(),
      }),
      getBlueprint: builder.query<IBlueprint, { id: string }>({
        providesTags: ['SingleBlueprint'],
        query: ({ id }) => ({
          url: `/recipes/${id}`,
        }),
      }),
      getBlueprintFile: builder.query<IBlueprintFile, { id: string }>({
        providesTags: ['SingleBlueprint'],
        query: ({ id }) => ({
          url: `/recipes/files/${id}`,
        }),
      }),
      getBlueprintReportInterfaceParameters: builder.query<
        any,
        { file_cross_id: string; report_name: string }
      >({
        providesTags: ['SingleBlueprint'],
        query: ({ file_cross_id, report_name }) => ({
          url: `/recipes/files/${file_cross_id}/reports/${report_name}/interface_parameters`,
        }),
      }),
      getReportsInterfaceParametersBatch: builder.query<
        {
          blueprint_type: any;
          global_params: any;
          reports: Record<string, any>;
        },
        { file_cross_id: string }
      >({
        providesTags: ['SingleBlueprint'],
        query: ({ file_cross_id }) => ({
          url: `/recipes/files/${file_cross_id}/reports/interface_parameters`,
        }),
      }),
      createBlueprint: builder.mutation<
        IBlueprint,
        {
          file_cross_id: string;
          name: string;
          description: string;
          hidden?: boolean;
        }
      >({
        invalidatesTags: ['Blueprints'],
        query: ({ file_cross_id, name, description, hidden = false }) => ({
          url: `/recipes?draft=${hidden}`,
          method: 'POST',
          body: { name, file_cross_id, description },
        }),
      }),
      addBlueprintFile: builder.mutation<any, any>({
        queryFn: async ({
          content,
          hidden = false,
        }: {
          content: string;
          hidden: boolean;
        }) => {
          const file = new File([content], 'temp-name', { type: 'text/plain' });
          const formData = new FormData();
          formData.append('file', file);
          try {
            const data = await apiV1.post(
              `${getPrefixAccount()}recipes/files?draft=${hidden}`,
              formData,
            );
            return data;
          } catch (error) {
            return {
              error: {
                status: error?.response?.status || 500,
                data:
                  error?.response?.data?.detail ||
                  error?.message ||
                  'Unknown error',
              },
            };
          }
        },
      }),
      editBlueprint: builder.mutation<
        void,
        {
          recipe_id: string;
          file_cross_id: string;
          name: string;
          description: string;
        }
      >({
        invalidatesTags: ['Blueprints', 'SingleBlueprint'],
        query: ({ recipe_id, file_cross_id, name, description = '' }) => ({
          url: `/recipes/${recipe_id}`,
          method: 'PUT',
          body: { file_cross_id, name, description },
        }),
      }),
      editBlueprintFile: builder.mutation<any, any>({
        queryFn: async ({
          content,
          name,
          cross_id,
        }: {
          content: string;
          name: string;
          cross_id: string;
        }) => {
          const file = new File([content], name, { type: 'text/plain' });
          const formData = new FormData();
          formData.append('file', file);
          try {
            const data = await apiV1.put(
              `${getPrefixAccount()}recipes/files/${cross_id}`,
              formData,
            );
            return data;
          } catch (error) {
            return {
              error: {
                status: error?.response?.status || 500,
                data:
                  error?.response?.data?.detail ||
                  error?.message ||
                  'Unknown error',
              },
            };
          }
        },
      }),
      deleteBlueprint: builder.mutation<void, { id: string }>({
        invalidatesTags: ['Blueprints'],
        query: ({ id }) => ({
          url: `/recipes/${id}`,
          method: 'DELETE',
        }),
      }),
      testYaml: builder.mutation<any, any>({
        queryFn: async ({ content }: { content: string }) => {
          const file = new File([content], 'temp', { type: 'text/plain' });
          const formData = new FormData();
          formData.append('file', file);
          try {
            const data = await apiV1.post(
              `${getPrefixAccount()}recipes/files/validate`,
              formData,
            );
            return data;
          } catch (error) {
            return {
              error: {
                status: error?.response?.status || 500,
                data:
                  error?.response?.data?.detail ||
                  error?.message ||
                  'Unknown error',
              },
            };
          }
        },
      }),
      copilotChat: builder.mutation<
        any,
        { doc_url: string; report: string; chat_id?: string }
      >({
        query: ({ doc_url, report, chat_id = null }) => ({
          url: '/recipes/chat',
          method: 'POST',
          body: { doc_url, report, chat_id },
        }),
      }),
      copilotChatStatus: builder.query<IChatStatus, { chat_id: string }>({
        query: ({ chat_id }) => ({
          url: `/recipes/chat/${chat_id}/status`,
        }),
      }),
    }),
  });

export const {
  useGetBlueprintsListQuery,
  useGetBlueprintQuery,
  useGetBlueprintFileQuery,
  useGetBlueprintReportInterfaceParametersQuery,
  useGetReportsInterfaceParametersBatchQuery,
  useLazyGetReportsInterfaceParametersBatchQuery,
  useCreateBlueprintMutation,
  useAddBlueprintFileMutation,
  useEditBlueprintMutation,
  useEditBlueprintFileMutation,
  useDeleteBlueprintMutation,
  useTestYamlMutation,
  useCopilotChatMutation,
  useLazyCopilotChatStatusQuery,
} = blueprintsApi;

export const blueprintFilesApi = createApi({
  reducerPath: 'blueprintFilesApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/recipes/files' }),
  endpoints: builder => {
    return {
      getFile: builder.query<any, string>({
        queryFn: async id => {
          const content = await getSignedRecipeFile(
            `/recipes/files/${id}`,
            true,
          );

          const result = {
            data: {
              dirty: false,
              content,
            },
          };
          return result;
        },
      }),
    };
  },
});

export function getSignedRecipeFile(url, isFull = false) {
  return getDataV1(isFull, url).then(data => {
    return data?.presigned_url
      ? fetch(data?.presigned_url).then(v => {
          return v.text();
        })
      : Promise.reject(data);
  });
}

export const { useGetFileQuery, useLazyGetFileQuery } = blueprintFilesApi;
