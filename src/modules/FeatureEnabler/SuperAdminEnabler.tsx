import { useCore } from 'store/core';

/**
 * display content is super admin
 */
export function SuperAdminEnabler({ children }) {
  const { isSuperAdminUser } = useCore();
  return isSuperAdminUser ? children : null;
}
