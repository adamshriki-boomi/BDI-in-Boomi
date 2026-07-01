import { RiveryDate } from 'api/types';
import { createRiveryApi } from 'store/createRiveryApi';

const ENDPOINT = 'admin';
export interface ITokenData {
  expiration_date: RiveryDate;
  insert_time: RiveryDate;
  last_used_at: RiveryDate;
  scopes: Record<number, string[]>;
  token_id: string;
  token_name: string;
  update_time: RiveryDate;
  updated_by: string;
  updated_by_name: string;
  user: string;
}

export const tokensApi = createRiveryApi
  .enhanceEndpoints({
    addTagTypes: ['AccountTokens', 'TokenScopes'],
  })
  .injectEndpoints({
    endpoints: builder => ({
      getTokens: builder.query<ITokenData[], string>({
        providesTags: ['AccountTokens'],
        query: () => ({
          url: `${ENDPOINT}/list_tokens`,
        }),
      }),
      getScopes: builder.query({
        providesTags: ['TokenScopes'],
        query: () => ({
          url: `${ENDPOINT}/scopes`,
        }),
      }),
      revokeToken: builder.mutation<
        {
          message: string;
          type: string;
        },
        string
      >({
        query: id => ({
          url: `${ENDPOINT}/revoke_token`,
          method: 'POST',
          body: { token: { jti: id } },
        }),
        invalidatesTags: ['AccountTokens'],
      }),
      createToken: builder.mutation<
        {
          message: string;
          token_id: string;
        },
        { scopes: string[]; token_name: string }
      >({
        query: ({ scopes, token_name }) => ({
          url: `${ENDPOINT}/token`,
          method: 'POST',
          body: { scopes, token_name },
        }),
        invalidatesTags: ['AccountTokens'],
      }),
    }),
  });

export const {
  useGetTokensQuery,
  useGetScopesQuery,
  useRevokeTokenMutation,
  useCreateTokenMutation,
} = tokensApi;
