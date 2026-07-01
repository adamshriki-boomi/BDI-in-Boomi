import { IAccountDetails } from 'api/types';
import { AxiosError, AxiosInstance } from 'axios';
import { useCallback, useMemo, useRef } from 'react';
import { useCore, useCoreActions } from 'store/core';
import { createOId } from 'utils/api.sanitizer';

/**
 *
 */
export const useTokenRefresher = () => {
  const {
    userId: user_id,
    refreshToken: refresh_token,
    envId: env_id,
    activeAccountId,
  } = useCore();
  const { loginMultiAccount } = useCoreActions();
  const { add, reset, hasReachedLimit } = useRetryCounter();

  const refresh = useCallback(
    async (api: AxiosInstance, error: AxiosError) => {
      if (!hasReachedLimit()) {
        add();
        // try to refresh token
        const response: any = await loginMultiAccount({
          account_id: createOId(activeAccountId),
          env_id,
          user_id,
          refresh_token,
        });
        // if successful, retry previous request once again
        const payload = response?.payload as IAccountDetails;
        if (payload?.token) {
          try {
            error.config.headers.authorization = payload?.token;
            const retryResponse = await api.request(error.config);
            return retryResponse;
          } finally {
            reset();
          }
        }
      }
      return;
    },
    [
      activeAccountId,
      add,
      env_id,
      hasReachedLimit,
      loginMultiAccount,
      refresh_token,
      reset,
      user_id,
    ],
  );
  return { refresh };
};
const useRetryCounter = () => {
  const retryCounter = useRef(0);

  const actions = useMemo(
    () => ({
      add: () => {
        retryCounter.current += 1;
      },
      reset: () => {
        retryCounter.current = 0;
      },
      hasReachedLimit: () => retryCounter.current === 1,
    }),
    [],
  );
  return actions;
};
