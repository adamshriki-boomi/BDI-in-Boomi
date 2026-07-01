import { useCore, useCoreActions } from '../store/core/hooks';

export function useRefreshAccountToken() {
  const {
    selectedAccountId,
    envId: env_id,
    userId: user_id,
    refreshToken: refresh_token,
  } = useCore();
  const { loginMultiAccount } = useCoreActions();
  const tokenArgs = {
    account_id: { $oid: selectedAccountId },
    env_id,
    user_id,
    refresh_token,
  };
  return { refreshAccountToken: () => loginMultiAccount(tokenArgs) };
}
