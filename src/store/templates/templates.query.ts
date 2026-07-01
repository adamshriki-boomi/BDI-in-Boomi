import { getSignedFile } from 'api/endpoints/files.api';
import { createRiveryApiV1 } from 'store/createRiveryApi';

const ENDPOINT = 'logicode_file/template';

export const templatesApi = createRiveryApiV1.injectEndpoints({
  endpoints: builder => {
    return {
      getTemplates: builder.query<string, void>({
        queryFn: async () => {
          const data = await getSignedFile(ENDPOINT);
          return { data };
        },
      }),
    };
  },
});

export const { useGetTemplatesQuery } = templatesApi;
