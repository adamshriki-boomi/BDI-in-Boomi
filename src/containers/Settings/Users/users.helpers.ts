import { getOId } from 'utils/api.sanitizer';
import { useAccount } from 'store/core';

export enum Roles {
  NO_ACCESS = 'no_access',
  DEPLOYMENT_ADMIN = 'deployment_admin',
  DEVELOPER = 'developer',
  VIEWER = 'viewer',
  MEMBER = 'connection_viewer',
  ADMIN = 'admin',
}
export const headerDescriptions = {
  [Roles.NO_ACCESS]: {},
  [Roles.VIEWER]: {
    name: 'viewer',
    display: 'VI',
  },
  [Roles.MEMBER]: {
    name: 'member',
    display: 'ME',
  },
  [Roles.DEVELOPER]: {
    name: 'Developer',

    display: 'DE',
  },
  [Roles.DEPLOYMENT_ADMIN]: {
    name: 'Deployment Manager',
    display: 'DM',
  },
  [Roles.ADMIN]: {
    name: 'Admin',
    display: 'AD',
  },
};

export function splitFullName(userName: string) {
  const trimmed = userName?.trim() ?? '';
  const parts = trimmed.split(/\s+/).filter(Boolean);
  const first_name = parts[0] ?? '';
  const last_name = parts.length > 1 ? parts.slice(1).join(' ') : '';
  return { first_name, last_name };
}

export function userDefaultValues(editMode, user, environments) {
  return {
    user_email: user?.user_email ?? '',
    user_name: user?.user_name ?? '',
    allow_login_password: editMode ? user?.allow_login_password : true,
    allow_login_google: editMode ? user?.allow_login_google : true,
    is_admin: user?.is_admin,
    super_admin: editMode ? user?.is_super_admin : false,
    super_admin_creator: editMode
      ? Boolean(user?.is_super_admin_creator)
      : false,
    global_operator: editMode ? user?.is_global_operator : false,
    teams: user?.groups ?? [],
    source: user?.source ?? 'rivery',
    role: {
      environments: environments,
    },
  };
}

export function assignEnvironments(user, permissions, allEnvironments) {
  const hasRoles = user && permissions && !user?.is_admin;

  return hasRoles
    ? allEnvironments?.reduce((result, env) => {
        return {
          ...result,
          [getOId(env._id)]:
            permissions.environments[getOId(env._id)] ?? 'no_access',
        };
      }, {})
    : allEnvironments?.reduce((result, env) => {
        if (env?.is_default) return { ...result, [getOId(env._id)]: 'viewer' };
        return { ...result, [getOId(env._id)]: 'no_access' };
      }, {});
}
export const useGetIsAccountThatIsManagedByBoomi = () => {
  const { isSettingOn } = useAccount();
  return isSettingOn('boomi_sso_account');
};
