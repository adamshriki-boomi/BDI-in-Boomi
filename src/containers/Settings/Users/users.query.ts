import { IUser, OID } from 'api/types';
import { Roles, splitFullName } from 'containers/Settings/Users/users.helpers';
import { createRiveryApi } from 'store/createRiveryApi';

const ENDPOINT = 'users_management';

export interface ICreateUser {
  role: { account: string; environments: Record<string, string>[] };
  allow_login_google: boolean;
  allow_login_password: boolean;
  user_email: string;
  user_name: string;
  is_admin: boolean;
  super_admin?: boolean;
  super_admin_creator?: boolean;
  global_operator?: boolean;
}

/** Body for POST /v1/accounts/:account_id/users/privileged (matches AddPrivilegedUserInput) */
export interface IPrivilegedUserBody {
  user_email: string;
  first_name: string;
  last_name: string;
  user_name?: string;
  is_super_admin: boolean;
  is_super_admin_creator: boolean;
  is_global_operator: boolean;
}

export function buildPrivilegedUserPayload(
  data: Pick<
    ICreateUser,
    | 'user_email'
    | 'user_name'
    | 'super_admin'
    | 'super_admin_creator'
    | 'global_operator'
  >,
  isSuperAdminCreator: boolean,
): IPrivilegedUserBody {
  const { first_name, last_name } = splitFullName(data.user_name ?? '');
  return {
    user_email: data.user_email,
    first_name,
    last_name,
    user_name: data.user_name?.trim() || undefined,
    is_super_admin: Boolean(data.super_admin),
    is_super_admin_creator: isSuperAdminCreator
      ? Boolean(data.super_admin_creator)
      : false,
    is_global_operator: Boolean(data.global_operator),
  };
}

/** Use POST .../users/privileged when internal account and at least one privileged role is selected (API requires this). */
export function shouldUsePrivilegedUserEndpoint(
  isSuperAdminsAccount: boolean,
  formData: Pick<
    ICreateUser,
    'super_admin' | 'super_admin_creator' | 'global_operator'
  >,
): boolean {
  if (!isSuperAdminsAccount) {
    return false;
  }
  return Boolean(
    formData.super_admin ||
      formData.super_admin_creator ||
      formData.global_operator,
  );
}

interface IEditUser {
  _id: OID;
  is_active?: boolean;
  terminate_current_sessions?: boolean;
  role?: { account: string; environments: Record<string, string>[] };
  allow_login_google?: boolean;
  allow_login_password?: boolean;
  user_email?: string;
  user_name?: string;
  is_admin?: boolean;
  super_admin?: boolean;
}

interface ICretaeUserResponse {
  message: string;
  success: boolean;
  status_code: number;
}

function pickEnvs(environments) {
  const userEnvironments = Object.keys(environments).filter(
    key => environments[key] === Roles.NO_ACCESS,
  );
  userEnvironments.forEach(function (key) {
    delete environments[key];
  });
}

export function createUserPayload(data: ICreateUser, isSuperAdminCreator) {
  if (!isSuperAdminCreator) {
    delete data.super_admin;
  }
  pickEnvs(data.role.environments);
  if (data.is_admin || data.super_admin) {
    data.role.account = 'admin';
    delete data.role.environments;
  }
  delete data.is_admin;
  return data;
}

export const userActionsApi = createRiveryApi
  .enhanceEndpoints({
    addTagTypes: ['Users'],
  })
  .injectEndpoints({
    endpoints: builder => ({
      getUsers: builder.query<IUser[], null>({
        providesTags: ['Users'],
        query: () => ({
          url: `${ENDPOINT}/users`,
        }),
      }),
      editUser: builder.mutation<ICretaeUserResponse, IEditUser>({
        query: ({
          role,
          allow_login_google,
          allow_login_password,
          user_email,
          user_name,
          is_active,
          super_admin,
          _id,
          terminate_current_sessions,
        }) => ({
          url: `${ENDPOINT}/update_user`,
          method: 'PATCH',
          body: {
            role,
            allow_login_google,
            allow_login_password,
            user_email,
            user_name,
            is_active,
            super_admin,
            terminate_current_sessions,
            _id,
          },
        }),
        invalidatesTags: ['Users'],
      }),
      inviteUser: builder.mutation<ICretaeUserResponse, ICreateUser>({
        query: ({
          role,
          allow_login_google,
          allow_login_password,
          user_email,
          user_name,
          super_admin,
        }) => ({
          url: `${ENDPOINT}/invite_user`,
          method: 'POST',
          body: {
            role,
            allow_login_google,
            allow_login_password,
            user_email,
            user_name,
            super_admin,
          },
        }),
        invalidatesTags: ['Users'],
      }),
      deleteUser: builder.mutation<any, { _id; cross_account_delete }>({
        query: ({ _id, cross_account_delete }) => ({
          url: `${ENDPOINT}/delete_user`,
          method: 'POST',
          body: {
            cross_account_delete,
            _id,
          },
        }),
        invalidatesTags: ['Users'],
      }),
      resetPasswordAdmin: builder.mutation<any, { user_email }>({
        query: ({ user_email }) => ({
          url: `${ENDPOINT}/reset_user_password`,
          method: 'POST',
          body: {
            user_email,
          },
        }),
        invalidatesTags: ['Users'],
      }),
      reInviteUser: builder.mutation<any, { _id }>({
        query: ({ _id }) => ({
          url: `${ENDPOINT}/re_invite_user`,
          method: 'POST',
          body: {
            _id,
          },
        }),
        invalidatesTags: ['Users'],
      }),
    }),
  });

export const {
  useGetUsersQuery,
  useEditUserMutation,
  useInviteUserMutation,
  useDeleteUserMutation,
  useResetPasswordAdminMutation,
  useReInviteUserMutation,
} = userActionsApi;
