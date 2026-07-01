import { API } from 'api';
import { isStatusSuccess } from 'api/endpoints/common.api';
import { useState } from 'react';
import { useInterval } from 'react-use';
import { useToastComponent } from './useToast';

const POLL_INTERVAL = 2000;

const openAuthWindow = (uri: string) =>
  window.open(uri, 'C-Sharpcorner', 'width=500,height=600');
type AuthDataRef = {
  config: Partial<API.connections.OAuth2Response>;
  authWindow: Window;
};

type Props = {
  options?: Record<string, any>;
  onSuccess: (credentials: any) => any;
  onError?: (error) => any;
  api: any;
  missing_fields?: string[];
  valid?: boolean;
};
export function useProviderAuthPoller({
  options,
  onSuccess,
  onError = null,
  api,
  valid,
  missing_fields,
}: Props) {
  const { error } = useToastComponent();
  const [authDataRef, setAuthConfig] = useState<AuthDataRef>();
  const resetConfig = () => setAuthConfig(null);
  const activatePoller = async (params = options) => {
    if (valid) {
      const { auth_uri, ...config } = await API.connections.fetchOAuth(params);
      if (auth_uri || isStatusSuccess(config as any)) {
        const authWindow = openAuthWindow(auth_uri);
        // authWindow.addEventListener('close', resetConfig);
        api.clearErrors('client_id');
        setAuthConfig({ config, authWindow });
      } else {
        onError &&
          onError(
            config?.message ??
              'Something went wrong. Please check the parameters again or contact support.',
          );
      }
    } else {
      error({
        description: 'Some required fields are missing: ' + missing_fields,
        duration: 3000,
      });
      api.trigger(Object.keys(params));
    }
  };

  useInterval(
    async () => {
      try {
        const credentials = await API.connections.getCredentials(
          authDataRef.config,
        );
        if (isStatusSuccess(credentials)) {
          authDataRef.authWindow.close();
          onSuccess(credentials);
          resetConfig();
        }
      } catch {
        resetConfig();
      }
    },
    authDataRef ? POLL_INTERVAL : null,
  );

  return { activatePoller };
}
