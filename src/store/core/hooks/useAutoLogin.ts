import { useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { useCore } from './useCore';
import { useCoreActions } from './useCoreActions';

/**
 * auto-login hook - request to try login automatically
 */
export function useAutoLogin() {
  const { isAuthenticated, isSignOutPending } = useCore();
  const { autoSignIn } = useCoreActions();
  const { hash } = useLocation();
  const isSigninCallback =
    hash && (hash.includes('signin') || hash.includes('login_error'));
  const history = useHistory();
  useEffect(() => {
    if (!isAuthenticated && !isSigninCallback && !isSignOutPending) {
      autoSignIn({ history });
    }
    // deps are not defined here because this hook needs to run once when the system is loading
    // otherwise, when signining out, it will attempt to login
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
