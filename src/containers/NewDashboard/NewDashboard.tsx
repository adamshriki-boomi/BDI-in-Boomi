import { Box, Flex } from '@chakra-ui/react';
import { DashboardActivityOverview } from './DashboardActivityOverview';
import { DashboardRecentActivities } from './DashboardRecentActivities';
import { DashboardQuickActions } from './DashboardQuickActions';
import { useCore } from 'store/core';
import { getSourcesList } from 'containers/Rivers/RiversV1/riversV1.query';
import { useAsyncFn, useEffectOnce } from 'react-use';

function NewDashboardComponent() {
  const { activeAccountId } = useCore();
  const [, getSourcesListData] = useAsyncFn(
    async (account_id: string) => getSourcesList(account_id),
    [],
  );

  useEffectOnce(() => {
    if (activeAccountId) {
      getSourcesListData(activeAccountId);
    }
  });

  return (
    <Box
      bg="background-secondary"
      h="100%"
      overflowY="auto"
      overflowX="auto"
      sx={{ padding: 'var(--exo-spacing-medium)' }}
    >
      <Flex
        mx="auto"
        flexDirection="column"
        gap="var(--exo-spacing-medium)"
        minW="850px"
      >
        <DashboardQuickActions />
        <DashboardActivityOverview />
        <Box id="dashboard-quick-actions" />
        <DashboardRecentActivities />
      </Flex>
    </Box>
  );
}

export default NewDashboardComponent;
