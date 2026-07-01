import { Grid } from '@chakra-ui/react';
import { ExoLeftnav } from 'components/Exosphere/ExoLeftnav';
import { ExoMasthead } from 'components/Exosphere/ExoMasthead';
import { useAccountReset } from 'hooks/useAccountReset';
import Sidebar from 'layout/Sidebar';
import { WIDE_MENU } from 'layout/Sidebar/common';
import { useBdiConfig } from 'modules/BdiPrototype';
import { ApiErrorHandler } from 'modules/ApiErrorHandler';
import { useGetEnvironmentsQuery } from 'modules/Environments/environments.query';
import React, { useState } from 'react';
import { AppRouter } from './routers';
import { useUrlWatcherAccountAndEnv } from './routers/hooks/useUrlWatcherAccountAndEnv';

const MASTHEAD_HEIGHT = 56;

export function AuthenticatedApp() {
  useAccountReset();
  useUrlWatcherAccountAndEnv();
  useGetEnvironmentsQuery('');

  const { leftnav, masthead } = useBdiConfig();
  const showMasthead = masthead === 'exo';
  const [sideBarWidth, setSideBarWidth] = useState(WIDE_MENU);

  const bodyHeight = showMasthead
    ? `calc(100vh - ${MASTHEAD_HEIGHT}px)`
    : '100vh';

  const body = (
    <Grid
      templateColumns="min-content 1fr"
      overflow="hidden"
      height={bodyHeight}
    >
      {leftnav === 'exo' ? (
        <ExoLeftnav />
      ) : (
        <Sidebar setSideBarWidth={setSideBarWidth} />
      )}
      <Grid width="100%" height={bodyHeight} templateRows="1fr auto">
        <AppRouter sideBarWidth={sideBarWidth} />
        <ApiErrorHandler />
      </Grid>
    </Grid>
  );

  if (showMasthead) {
    return (
      <Grid
        templateRows={`${MASTHEAD_HEIGHT}px 1fr`}
        height="100vh"
        overflow="hidden"
      >
        <ExoMasthead />
        {body}
      </Grid>
    );
  }

  return body;
}
