import { AppRoutes } from 'app/routes';
import { Breadcrumbs, Grid } from 'components';
import { RiveryTabs } from 'components/RiveryTabs/RiveryTabs';
import { InternalAccountSettings } from 'containers/AppSettings';
import { AdminAccountSettings } from 'containers/AppSettings/AdminAccountSettings';
import { useMemo } from 'react';
import { useRouteMatch } from 'react-router-dom';
import { useCore } from 'store/core';
import AccountNotifications from './Notifications/accountNotifications';
import Security from './Security';

const routes = [
  {
    route: 'internal-account',
    title: 'Account Settings (Boomi Internal)',
    component: InternalAccountSettings,
    superAdmin: true,
  },
  {
    route: 'account',
    title: 'General',
    component: AdminAccountSettings,
  },
  {
    route: 'notifications',
    title: 'Notifications',
    component: AccountNotifications,
  },
  {
    route: 'security',
    title: 'Security',
    component: Security,
  },
];

export function Settings() {
  const { activeAccountId, envId } = useCore();
  const currentPageTitle = useCurrentPageTitle();
  const settingsTabs = useMemo(() => routes, []);

  return (
    <Grid
      backgroundColor="white"
      height="full"
      m={3}
      p={4}
      pt={3}
      overflow="hidden"
      gridTemplateRows="auto 1fr"
    >
      <Breadcrumbs
        links={[{ label: 'Settings' }, { label: currentPageTitle }]}
        mb={5}
      />

      <RiveryTabs
        items={settingsTabs}
        route={`/settings/${activeAccountId}/${envId}`}
        gridProps={{
          gridTemplateAreas: "'tabs'",
          height: '100%',
        }}
      />
    </Grid>
  );
}

const breadcrumbTitles = {
  account: 'Account',
  security: 'Security',
  'internal-account': 'Account Settings',
};
const useCurrentPageTitle = () => {
  const settingsSection: any = useRouteMatch(AppRoutes.SETTINGS_SECTION);
  const params = settingsSection?.params;
  return params?.section
    ? breadcrumbTitles[params.section]
    : breadcrumbTitles['internal-account'];
};
