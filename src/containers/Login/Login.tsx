import { Plg } from 'components/PLG/Plg';
import { useTabsCommunication } from 'containers/Login/AllTabsCommunication';
import OnboardingProgress from 'containers/Onboarding/containers/OnboardingMain';
import { WelcomeScreen } from 'containers/Onboarding/containers/WelcomeScreen';
import { useSupportOldRoute } from 'hooks/router/useSupportOldRoute';
import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import { useLocation } from 'react-use';
import { useCore } from 'store/core';
import { LoginRoutes } from './LoginRoutes';
import NewLogin from './NewLogin/NewLogin';

export enum LOGIN_TYPE {
  PASSWORD = 'password',
  GOOGLE = 'google',
}
const useIsIndependentRout = () => {
  const { pathname: url } = useLocation();
  return url.includes('/plg/') ? url.replace('/plg/', '') : null;
};
export function LoginGuard({ children }) {
  const { isAuthenticated, isOnboardingRedirect } = useCore();
  useSupportOldRoute();
  useTabsCommunication();
  const independentRoute = useIsIndependentRout();

  return independentRoute ? (
    <Plg page={independentRoute} isIndependentRoute={true} />
  ) : isAuthenticated ? (
    <Switch>
      <Route path={LoginRoutes.FORGOT_PASSWORD}>
        <Redirect to="/" />
      </Route>
      <Route
        component={WelcomeScreen}
        path={LoginRoutes.ONBOARDING_GETTING_STARTED}
      />
      <Route
        component={OnboardingProgress}
        path={LoginRoutes.ONBOARDING}
        exact
      />
      <Route path="">{isOnboardingRedirect ? null : children}</Route>
    </Switch>
  ) : isAuthenticated === false ? (
    <NewLogin />
  ) : null;
}
