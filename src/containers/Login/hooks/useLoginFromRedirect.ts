import queryString from 'query-string';
import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useCoreActions } from 'store/core';
import { getMatchUrl } from 'store/core/core.effects';
import { LoginRoutes } from '../LoginRoutes';
import { useQueryParamsRouter } from './useQueryParamsRouter';

export enum Modes {
  SIGNIN = 'signin',
  SIGNUP = 'signup',
}

/**
 * Router-hook for handling special routing and query-params routing (handled by useQueryParamsRouter())
 */
export function useLoginFromRedirect() {
  const { location, push, replace } = useHistory();
  const { login, toggleOffPending, signUp } = useCoreActions();
  const parsedHash = queryString.parse(location.hash?.replace('#/?', '#'));
  const credentials = parsedHash?.body as string;
  const mode = parsedHash?.mode;
  const match = getMatchUrl();
  const envFromUrl = match?.params?.env;
  useQueryParamsRouter(parsedHash);

  useEffect(() => {
    if (credentials) {
      const params = JSON.parse(window.atob(credentials));
      if (params) {
        switch (mode) {
          case Modes.SIGNIN:
            try {
              replace({
                search: '',
              }); // removing the sign in parameters from the url
            } catch (e) {
              console.error(e);
            }
            login({ ...params, history: { push } });
            if (!envFromUrl) {
              push(LoginRoutes.ACCOUNTS);
            }
            return;
          case Modes.SIGNUP:
            signupGoogle({
              params,
              signUp,
              login,
              redirect: () => push(LoginRoutes.ONBOARDING_GETTING_STARTED),
            });
            return;
        }
      }
    }
  }, [
    credentials,
    envFromUrl,
    signUp,
    login,
    mode,
    toggleOffPending,
    push,
    replace,
  ]);
}

const signupGoogle = ({ params, signUp, login, redirect }) => {
  const name = params?.google_account?.name;
  const googleCredentials = {
    first_name: name?.givenName,
    last_name: name?.familyName,
    getting_started: true,
    ...params,
  };
  return signUp(googleCredentials).then(async v => {
    const action = await login(googleCredentials);
    if (!action?.error) {
      redirect();
    }
  });
};
