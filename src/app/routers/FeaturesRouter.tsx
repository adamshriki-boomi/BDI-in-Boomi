import { PrivateRoute } from 'app/PrivateRoute';
import { AppRoutes, LegacyRoutes } from 'app/routes';
import ActivitiesRiverView from 'containers/Activities/[id]';
import { Activities } from 'containers/Activities/Activities';
import { Settings } from 'containers/AppSettings/Settings';
import AuditLog from 'containers/AuditLog/AuditLog';
import {
  Connections,
  LegacyRouteConnections,
} from 'containers/Connections/Connections';
import { useEditorThemeEnhancer } from 'containers/River/RiverLogic/Logic/components/ScriptEditor/utils/providers/custom';
import { LegacyRouteRiver } from 'containers/Rivers/LegacyRiver';
import { RiverActionSelector } from 'containers/Rivers/RiverActionSelector';
import { Rivers } from 'containers/Rivers/Rivers';
import { Tokens } from 'containers/Settings/Tokens/Tokens';
import { Users } from 'containers/Settings/Users/Users';
import { ConsumptionManager } from 'modules/Consumption';
import { Environments } from 'modules/Environments/Environments';
import EnvironmentVariables from 'modules/EnvironmentVariables/EnvironmentVariablesView';
import { lazy, Suspense } from 'react';
import { Redirect, Route, Switch, generatePath } from 'react-router-dom';

const River = lazy(() => import('containers/River/River'));
const CreateSourceToTarget = lazy(
  () => import('containers/River/new/source-to-target'),
);

const OnboardingPage = lazy(
  () => import('containers/Onboarding/containers/OnboardingMain'),
);

const RiverSourceToTarget = lazy(
  () => import('containers/River/RiverSourceToTarget'),
);

const LegacyDashboard = lazy(() => import('containers/LegacyDashboard'));

const BluePrints = lazy(() => import('containers/BluePrints'));

const NewDashboard = lazy(() => import('containers/NewDashboard/NewDashboard'));

export function FeaturesRouter() {
  useEditorThemeEnhancer();

  return (
    <Suspense>
      <Switch>
        <PrivateRoute
          exact
          component={OnboardingPage}
          path={AppRoutes.ONBOARDING}
          key="onboarding"
        />
        <PrivateRoute
          exact
          key="rivers"
          path={AppRoutes.RIVERS}
          component={Rivers}
        />
        <PrivateRoute
          exact
          key={AppRoutes.BLUEPRINTS}
          path={AppRoutes.BLUEPRINTS}
          component={BluePrints}
        />
        <PrivateRoute
          key="rivers-legacy"
          exact
          path={LegacyRoutes.RIVER}
          component={LegacyRouteRiver}
        />
        <PrivateRoute
          path={AppRoutes.RIVER_SOURCE_TO_TARGET_NEW}
          component={CreateSourceToTarget}
        />
        <PrivateRoute path={AppRoutes.RIVER_NEW} component={River} />
        {/** SHOULD BE REMOVED WHEN NEW S2T is up*/}
        <PrivateRoute
          path={`/rivers/:account/:env/:river/BETA_NEW_STT`}
          component={CreateSourceToTarget}
        />
        {/** SHOULD BE REMOVED WHEN NEW S2T is up*/}
        <PrivateRoute
          path={`/rivers/:account/:env/:river/BETA_STT`}
          component={RiverSourceToTarget}
        />
        <PrivateRoute
          path={AppRoutes.RIVER_ACTION_SELECTOR}
          component={RiverActionSelector}
        />
        <PrivateRoute path={AppRoutes.RIVER} component={River} />
        <PrivateRoute
          key={AppRoutes.SETTINGS}
          path={AppRoutes.SETTINGS}
          component={Settings}
          adminRoute
        />
        <PrivateRoute
          key={AppRoutes.TOKENS}
          path={AppRoutes.TOKENS}
          component={Tokens}
          adminRoute
        />
        <PrivateRoute
          key={AppRoutes.USERS}
          path={AppRoutes.USERS}
          component={Users}
          adminRoute
        />
        <PrivateRoute
          key={AppRoutes.CONSUMPTION}
          path={AppRoutes.CONSUMPTION}
          component={ConsumptionManager}
          adminRoute
        />
        <PrivateRoute
          key={AppRoutes.AUDIT_LOG}
          path={AppRoutes.AUDIT_LOG}
          component={AuditLog}
          adminRoute
        />
        <PrivateRoute
          exact
          key={AppRoutes.VARIABLES}
          path={AppRoutes.VARIABLES}
          component={EnvironmentVariables}
        />
        <PrivateRoute
          key={AppRoutes.ENVIRONMENTS}
          path={AppRoutes.ENVIRONMENTS}
          component={Environments}
        />
        <PrivateRoute
          exact
          key={AppRoutes.ACTIVITIES}
          path={AppRoutes.ACTIVITIES}
          component={Activities}
        />
        <PrivateRoute
          exact
          key={AppRoutes.ACTIVITIES_RIVER_VIEW}
          path={AppRoutes.ACTIVITIES_RIVER_VIEW}
          component={ActivitiesRiverView}
        />
        <PrivateRoute
          exact
          key={AppRoutes.DASHBOARD}
          path={AppRoutes.DASHBOARD}
          component={NewDashboard}
        />
        <Route
          exact
          path={AppRoutes.HOME}
          render={({ match }) => (
            <Redirect to={generatePath(AppRoutes.DASHBOARD, match.params)} />
          )}
        />
        <PrivateRoute
          exact
          key={AppRoutes.LEGACY_DASHBOARD}
          path={AppRoutes.LEGACY_DASHBOARD}
          component={LegacyDashboard}
        />

        <PrivateRoute
          key="connections"
          exact
          path={AppRoutes.CONNECTIONS}
          component={Connections}
        />
        <PrivateRoute
          key="connections-legacy"
          exact
          path={LegacyRoutes.CONNECTIONS}
          component={LegacyRouteConnections}
        />
      </Switch>
    </Suspense>
  );
}
