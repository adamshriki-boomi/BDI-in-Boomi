import { Box } from '@chakra-ui/react';
import { useState } from 'react';
import { DashboardDataControls } from './DashboardDataControls';
import { DashboardActivityChart } from './DashboardActivityChart';
import { useDashboardData } from './hooks/useDashboardData';
import { View, Metric } from './dashboard.query';

export function DashboardActivityOverview() {
  const { data, isLoading, error, requestBody } = useDashboardData();
  const [resetHandler, setResetHandler] = useState<(() => void) | null>(null);

  return (
    <Box
      id="dashboard-activity-overview"
      bg="background"
      borderRadius="var(--exo-spacing-x-small, 8px)"
      boxShadow="sm"
      minH="400px"
      p={6}
      display="flex"
      flexDir="column"
      border="1px solid var(--exo-color-border-secondary)"
    >
      <DashboardDataControls
        onResetHandlerReady={handler => setResetHandler(() => handler)}
      />
      <Box mt={4} flex={1}>
        <DashboardActivityChart
          data={data}
          isLoading={isLoading}
          error={error}
          view={requestBody.view as View}
          metric={requestBody.metric as Metric}
          onResetToDefault={resetHandler || undefined}
        />
      </Box>
    </Box>
  );
}
