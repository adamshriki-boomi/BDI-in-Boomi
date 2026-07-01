import { parseSearchParams } from 'utils/searchParams';
export const SLIM_MENU = '78px';
export const WIDE_MENU = '202px';
export const WIDE_MENU_LG = '530px';
export const menuItemStyle = {
  fontWeight: 'normal',
  p: '2px 16px',
  height: '36px',
};

export const menuItemIconStyle = {
  boxSize: 5,
  mt: 1.5,
};

export enum DrawerType {
  ENVIRONMENTS = 'environments',
  CREATE_RIVER = 'create',
  USER = 'user',
  RESOURCE_CENTER = 'resource_center',
}

export const useGetDrawerType = () => {
  const params = parseSearchParams();
  const drawerType = params?.open;
  return drawerType;
};

export const createSidebarUrl =
  (prefix: string, suffix: string = '') =>
  ({ accountId, envId }) =>
    [`/${prefix}`, accountId, envId, suffix].filter(Boolean).join('/');
