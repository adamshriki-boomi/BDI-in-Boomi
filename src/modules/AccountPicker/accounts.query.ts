import { IQualityTest } from 'modules/QualityTests';
import { createRiveryApiV1 } from 'store/createRiveryApi';

export const accountsV1Api = createRiveryApiV1
  .enhanceEndpoints({
    addTagTypes: ['Accounts'],
  })
  .injectEndpoints({
    endpoints: builder => ({
      getAccounts: builder.query<any, any>({
        providesTags: ['Accounts'],
        query: ({ queryString, token }) => ({
          url: `/accounts?${queryString}`,
          headers: { Authorization: `Bearer ${token}` },
        }),
      }),
      getAccountsNextPage: builder.query<any, any>({
        providesTags: ['Accounts'],
        query: ({ url, token }) => ({
          url,
          headers: { Authorization: `Bearer ${token}` },
        }),
      }),
      deleteAccount: builder.mutation<IQualityTest, string>({
        query: id => ({
          url: `/accounts/${id}?are_you_sure=true`,
          method: 'DELETE',
        }),
        invalidatesTags: ['Accounts'],
      }),
    }),
  });

export const {
  useGetAccountsQuery,
  useGetAccountsNextPageQuery,
  useDeleteAccountMutation,
} = accountsV1Api;
