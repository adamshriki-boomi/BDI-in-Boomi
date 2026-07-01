import { EnvironmentDefault } from 'api/types';
import { useCallback, useEffect } from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { useCore, useCoreActions } from 'store/core';

type MatchRouteResult = {
  params: { env: string; account: string };
};
/**
 * shoudl auto select an account if available in url
 */
export function useLoginFromParams() {
  const match: MatchRouteResult = useRouteMatch(`/:page/:account/:env`);
  const { userId: user_id, refreshToken: refresh_token } = useCore();
  const { loginMultiAccount } = useCoreActions();
  const { push, replace } = useHistory();

  const params = match?.params;
  const env_id = params?.env;
  const account_id = params?.account;
  const hasValidParams = [env_id, account_id, user_id].every(Boolean);

  const selectAccount = useCallback(
    async ({ account_id, env_id, user_id, refresh_token }) => {
      const action: any = await loginMultiAccount({
        account_id,
        env_id,
        user_id,
        refresh_token,
      });
      if (action?.error) {
        push('/');
      } else {
        if (window.location.pathname.indexOf(EnvironmentDefault.DEFAULT) >= 0)
          replace({
            search: window.location.search,
            pathname: window.location.pathname.replace(
              EnvironmentDefault.DEFAULT,
              action?.payload?.env_id,
            ),
          });
      }
    },
    [loginMultiAccount, push, replace],
  );

  useEffect(() => {
    if (hasValidParams) {
      selectAccount({
        account_id: { $oid: account_id },
        env_id,
        user_id,
        refresh_token,
      });
    }
  }, [
    env_id,
    account_id,
    user_id,
    refresh_token,
    selectAccount,
    hasValidParams,
  ]);

  return { hasValidParams };
}
