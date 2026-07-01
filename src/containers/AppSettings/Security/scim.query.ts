import { createRiveryApiV1 } from 'store/createRiveryApi';

interface Token {
  account_id: string;
  scim_service_url: string;
  token: number;
}

interface TokenStatus {
  account_id: string;
  scim_service_url: string;
  is_enabled: boolean;
}

export const teamsActionsApi = createRiveryApiV1
  .enhanceEndpoints({
    addTagTypes: ['Token'],
  })
  .injectEndpoints({
    endpoints: builder => ({
      generateToken: builder.mutation<Token, { account: string }>({
        query: ({ account }) => ({
          url: `accounts/${account}/scim_provisioning`,
          method: 'PUT',
        }),
      }),
      getToken: builder.query<TokenStatus, { account: string }>({
        providesTags: ['Token'],
        query: ({ account }) => ({
          url: `accounts/${account}/scim_provisioning`,
        }),
      }),

      deleteToken: builder.mutation<TokenStatus, { account: string }>({
        query: ({ account }) => ({
          url: `accounts/${account}/scim_provisioning`,
          method: 'DELETE',
        }),
        invalidatesTags: ['Token'],
      }),
    }),
  });

export const {
  useGetTokenQuery,
  useGenerateTokenMutation,
  useDeleteTokenMutation,
} = teamsActionsApi;
