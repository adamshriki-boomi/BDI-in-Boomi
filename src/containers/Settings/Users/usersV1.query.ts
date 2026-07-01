import { IUser } from 'api/types';
import { IPrivilegedUserBody } from 'containers/Settings/Users/users.query';
import { createRiveryApiV1 } from 'store/createRiveryApi';
import { stringifyParams } from 'utils/searchParams';

const GET_USER_PATH = (account_id, user_id) =>
  `accounts/${account_id}/users/${user_id}`;

interface IUserUpdateData {
  step: Record<string, string>;
  user_id: string;
  account_id: string;
}

interface UsersResponse {
  next_page: string;
  previous_page: string;
  page: number;
  current_page_size: number;
  total_items: number;
  account_id: string;
  items: IUser[];
}

const stringifyUrlParams = (url, params) => `${url}?${stringifyParams(params)}`;
const createUsersQuery =
  () =>
  ({ account_id, ...params }) => {
    return {
      url: stringifyUrlParams(`accounts/${account_id}/users`, {
        ...params,
      }),
      invalidatesTags: ['Users'],
    };
  };

export const userActionsApi = createRiveryApiV1
  .enhanceEndpoints({
    addTagTypes: ['Users', 'User'],
  })
  .injectEndpoints({
    endpoints: builder => ({
      getUsers: builder.query<UsersResponse, null>({
        providesTags: ['Users'],
        query: createUsersQuery(),
      }),
      getSingleUser: builder.query<IUser, { user_id; account_id }>({
        providesTags: ['User'],
        query: ({ user_id, account_id }) => ({
          url: GET_USER_PATH(account_id, user_id),
          // invalidatesTags: ['Users'],
        }),
        keepUnusedDataFor: 0,
      }),
      getSingleUserPermissions: builder.query<IUser, { user_id; account_id }>({
        query: ({ user_id, account_id }) => ({
          url: `${GET_USER_PATH(account_id, user_id)}/permissions`,
        }),
        keepUnusedDataFor: 0,
      }),
      getUserOnboarding: builder.query<IUser, { user_id; account_id }>({
        providesTags: ['Users'],
        query: ({ user_id, account_id }) => ({
          url: `${GET_USER_PATH(account_id, user_id)}/onboarding`,
        }),
      }),
      updateUserOnboarding: builder.mutation<IUser, IUserUpdateData>({
        query: ({ account_id, user_id, step }) => ({
          url: `accounts/${account_id}/users/${user_id}/onboarding`,
          method: 'POST',
          body: step,
        }),
        invalidatesTags: ['Users'],
      }),
      updateUserSource: builder.mutation<
        IUser,
        { account_id; user_id; source }
      >({
        query: ({ account_id, user_id, source }) => ({
          url: `accounts/${account_id}/users/${user_id}/source`,
          method: 'POST',
          body: { source },
        }),
        invalidatesTags: ['Users'],
      }),
      addPrivilegedUser: builder.mutation<
        IUser,
        { account_id: string } & IPrivilegedUserBody
      >({
        query: ({ account_id, ...body }) => ({
          url: `accounts/${account_id}/users/privileged`,
          method: 'POST',
          body,
        }),
        invalidatesTags: ['Users', 'User'],
      }),
    }),
  });

export const {
  useGetUserOnboardingQuery: useGetUserQuery,
  useGetSingleUserQuery,
  useGetSingleUserPermissionsQuery,
  useGetUsersQuery,
  useUpdateUserOnboardingMutation,
  useUpdateUserSourceMutation,
  useAddPrivilegedUserMutation,
} = userActionsApi;
