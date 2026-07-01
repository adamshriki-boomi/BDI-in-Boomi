import { Grid } from '@chakra-ui/react';
import { TopBarProvider } from 'app/AppTopBarContext';
import { PrivateRoute } from 'app/PrivateRoute';
import { supportedAppRoutes } from 'app/routes';
import AccountBanner from 'containers/AccountBanner/AccountBanner';
import { useAccountBannerCases } from 'containers/AccountBanner/useAccountBanner';
import { PageNotFound } from 'modules';
import { useIsUsageExceeded } from 'modules/Consumption/helpers';
import { Route, Switch } from 'react-router-dom';
import { FeaturesRouter } from './FeaturesRouter';
import { AngularApp } from './IframeOnly/AngularApp';
import { useGetNotificationsQuery } from 'containers/AppSettings/Notifications/Usage/notifications.query';
import { useCore } from 'store/core';

const isReactAppMode = import.meta.env.VITE_MODE === 'app';
const iframeRoutes = supportedAppRoutes.map(route => `/${route}`);

export function AppRouter({ sideBarWidth }) {
  const { over, warning, remainingRpus } = useIsUsageExceeded();
  const { selectedAccountId } = useCore();
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
          <PrivateRoute exact path="/" component={AngularApp} />
          <PrivateRoute path={iframeRoutes} component={AngularApp} />
          <Route path="*">
            <PageNotFound />
          </Route>
        </Switch>
      </Grid>
    </TopBarProvider>
  );
}
