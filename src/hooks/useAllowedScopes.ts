import { useCore } from 'store/core';

export const useAllowedScopes = (allowedScopes: string[]) => {
  const { accountScopes } = useCore();
  return allowedScopes.filter(scope => accountScopes.includes(scope));
};

export function ScopesGuard({ children, scopes }) {
  const userAllowedScopes = useAllowedScopes(scopes);
  if (userAllowedScopes.length === 0) {
    return null;
  }
  return children;
}
