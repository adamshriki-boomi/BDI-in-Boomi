import { EnvironmentDefault } from 'api/types';
import { useCallback, useEffect } from 'react';
import { useRouteMatch } from 'react-router-dom';
import { useCore, useCoreActions } from 'store/core/hooks';

export const useUrlWatcherAccountAndEnv = async () => {
  const { envId, selectedAccountId, userId, refreshToken } = useCore();
  const matchURL = useRouteMatch<{ account?: string; env?: string }>(
    `/:page/:account/:env`,
  );
  const { loginMultiAccount } = useCoreActions();

  const updateEnv = useCallback(
    async (envId, accountId) => {
      if (envId !== EnvironmentDefault.DEFAULT) {
        //default is only for useLoginFromParam
        await loginMultiAccount({
          account_id: { $oid: accountId },
          env_id: envId,
          user_id: userId,
          refresh_token: refreshToken,
        });
      }
    },
    [refreshToken, userId, loginMultiAccount],
  );

  const envFromUrl = matchURL?.params?.env;
  const accountFromUrl = matchURL?.params?.account;

  useEffect(() => {
    if (
      accountFromUrl &&
      (envId !== envFromUrl || accountFromUrl !== selectedAccountId)
    ) {
      updateEnv(envFromUrl || envId, accountFromUrl);
    }
  }, [envId, selectedAccountId, envFromUrl, accountFromUrl, updateEnv]);
};
