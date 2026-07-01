import { api } from 'api/api.proxy';
import { AxiosError, AxiosInstance } from 'axios';
import { useToastComponent } from 'hooks/useToast';
import { useEffect } from 'react';
import { useCoreActions } from 'store/core';
import { useTokenRefresher } from './useTokenRefresher';

const responseHandler = response => response;
export const defineApiHandler = (api: AxiosInstance, storeHandlers) =>
  api.interceptors.response.use(responseHandler, (error: AxiosError) => {
    const response = error?.response;
    const storeHandler = storeHandlers[response?.status];

    if (storeHandler) {
      storeHandler(api, error);
    }
    return Promise.reject(error);
  });

interface ErrorResponse {
  message?: string;
  status?: string;
  reason?: string;
}

export function ApiErrorHandler() {
  const { signOut } = useCoreActions();
  const { refresh } = useTokenRefresher();
  const { error: errorToast } = useToastComponent();

  useEffect(() => {
    defineApiHandler(api, {
      401: async (api: AxiosInstance, error: AxiosError<ErrorResponse>) => {
        const errorMessage = error?.response?.data?.message;
        const retryResponse =
          errorMessage === 'Session Expired' ? await refresh(api, error) : null;
        if (!retryResponse) {
          errorToast({ description: errorMessage || 'Session Has Expired' });
          signOut();
        }
      },
      403: async (api: AxiosInstance, error: AxiosError<ErrorResponse>) => {
        const data = error?.response?.data;
        const dataStatus = data?.status;
        const dataReason = data?.reason;
        let errorMessage = data?.message;
        if (dataStatus === 'Blocked') {
          const response: any = await refresh(api, error);
          if (!response) {
            errorMessage = dataReason;
          }
        }
        errorToast({ description: errorMessage || 'Insufficient Permissions' });
      },
    });
  }, [signOut, refresh, errorToast]);

  return null;
}
