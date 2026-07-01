import { nanoid } from '@reduxjs/toolkit';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getSignedFile } from 'api/endpoints/files.api';
import { BlockTypes } from 'api/types';
import { uploadFile } from 'components/Form';

export const DRAFT_FILE_PREFIX = 'draft-';

export const generateDraftId = () => `${DRAFT_FILE_PREFIX}${nanoid()}`;

interface FileContentState {
  content: string;
  dirty?: boolean;
}

interface FileContentUpdate extends FileContentState {
  id: string;
}

export interface FileSaveContent extends FileContentUpdate {
  type: string;
  name: string;
}

export const remoteFileApi = createApi({
  reducerPath: 'remoteFileApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/logicode_file' }),
  // tagTypes: ['remoteFiles'],
  endpoints: builder => {
    return {
      getRemoteFileById: builder.query<FileContentState, string>({
        keepUnusedDataFor: 0,
        queryFn: async fileId => {
          const hasId = fileId && !fileId?.startsWith(DRAFT_FILE_PREFIX);
          const result = {
            data: {
              dirty: false,
              content: hasId
                ? await getSignedFile(`/logicode_file/${fileId}`, true)
                : '',
            },
          };
          return result;
        },
      }),

      updateRemoteFileDraftById: builder.mutation<
        FileContentState,
        FileContentUpdate
      >({
        queryFn: ({ content, id }) => {
          return { data: { content, id } };
        },
        async onQueryStarted({ id, ...patch }, { dispatch }) {
          /**
           * @meir-rio i've been here before - if you did that because the tags invalidation didn't work,
           * well - the solution is: adding the api to the middleware.
           * the new "createRiveryApi" is added to the middleware.
           * i didn't migrated this file to the new createRiveryApi because:
           * i see all endpoints are using custom queryFn -
           * which means probably the base-url was not in use expect from the getRemoteFileById - lets discuss that
           */
          const payload = remoteFileApi.util.updateQueryData(
            'getRemoteFileById',
            id,
            draft => {
              if (Object.keys(patch).some(key => draft[key] !== patch[key])) {
                Object.assign(draft, patch, { dirty: true });
              }
            },
          );
          dispatch(payload);
        },
      }),

      updateRemoteFileById: builder.mutation<
        FileContentUpdate,
        Partial<FileSaveContent> & Pick<FileSaveContent, 'content' | 'name'>
      >({
        // invalidatesTags: ['remoteFiles'],
        queryFn: async ({
          content,
          name,
          type = BlockTypes.PYTHON,
        }: {
          content: string;
          name: string;
          type: BlockTypes;
        }) => {
          const file = new File([content], name, { type: 'text/plain' });
          const { file_cross_id: id } = await uploadFile(file, type);
          return { data: { id, dirty: false, content } };
        },
      }),
    };
  },
});

export const {
  useGetRemoteFileByIdQuery,
  useUpdateRemoteFileDraftByIdMutation,
  useUpdateRemoteFileByIdMutation,
} = remoteFileApi;
