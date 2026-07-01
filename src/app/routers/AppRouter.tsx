import { Grid } from '@chakra-ui/react';
import { TopBarProvider } from 'app/AppTopBarContext';
import { PrivateRoute } from 'app/PrivateRoute';
import { AppRoutes, supportedAppRoutes } from 'app/routes';
import AccountBanner from 'containers/AccountBanner/AccountBanner';
import { useAccountBannerCases } from 'containers/AccountBanner/useAccountBanner';
import { PageNotFound } from 'modules';
import { useIsUsageExceeded } from 'modules/Consumption/helpers';
import {
  Redirect,
  Route,
  Switch,
  generatePath,
  useLocation,
} from 'react-router-dom';
import { FeaturesRouter } from './FeaturesRouter';
import { AngularApp } from './IframeOnly/AngularApp';
import { useGetNotificationsQuery } from 'containers/AppSettings/Notifications/Usage/notifications.query';
import { useCore } from 'store/core';

const isReactAppMode = import.meta.env.VITE_MODE === 'app';
const iframeRoutes = supportedAppRoutes.map(route => `/${route}`);

export function AppRouter({ sideBarWidth }) {
  const { over, warning, remainingRpus } = useIsUsageExceeded();
  const { selectedAccountId, envId } = useCore();
  const { search } = useLocation();
  const { data: apiNotifications = [], isLoading: isLoadingNotifications } =
    useGetNotificationsQuery(
      { account: selectedAccountId },
      { skip: !selectedAccountId },
    );

  const state = useAccountBannerCases({
    isUsageExceeded: over,
    isUsageWarning: warning,
    remainingRpus,
    hasNotifications: apiNotifications.length > 0,
    isLoadingNotifications,
  });

  return (
    <TopBarProvider
      value={{ show: state.isVisible, setShowPanel: state.setVisible }}
    >
      <Grid templateRows={state.isVisible ? 'auto 1fr' : '1fr'} h="100vh">
        <AccountBanner sideBarWidth={sideBarWidth} state={state} />
        {isReactAppMode && <FeaturesRouter />}
        <Switch>
          {/*
           * Land on the React dashboard by default instead of the legacy
           * old-app iframe. The iframe (`/ng`) has no host on a static/mock
           * deploy, so at "/" it would render the hosting 404 page. Wait for
           * account + env to resolve, then redirect to the dashboard route
           * (which FeaturesRouter renders as React), preserving query flags
           * such as ?leftnav / ?masthead.
           */}
          <Route exact path={AppRoutes.ROOT}>
            {selectedAccountId && envId ? (
              <Redirect
                to={{
                  pathname: generatePath(AppRoutes.DASHBOARD, {
                    account: selectedAccountId,
                    env: envId,
                  }),
                  search,
                }}
              />
            ) : null}
          </Route>
          <PrivateRoute path={iframeRoutes} component={AngularApp} />
          <Route path="*">
            <PageNotFound />
          </Route>
        </Switch>
      </Grid>
    </TopBarProvider>
  );
}
