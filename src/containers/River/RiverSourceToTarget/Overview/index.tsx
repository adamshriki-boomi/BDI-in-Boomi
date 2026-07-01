import { Box, Flex, Grid, RdsScheduleSettings, RenderGuard } from 'components';
import { useGetActivitiesConsistencyMutation } from 'containers/Activities/store';
import { ConnectionsIcon } from 'layout/Sidebar/components/icons';
import { useSttFormContext } from 'modules/SourceTarget';
import { useVersionController } from 'modules/Versions/hooks';
import { useEffect } from 'react';
import { useRiver } from 'store/river';
import { getOId } from 'utils/api.sanitizer';
import {
  ActivityChart,
  SectionHeader,
  VersionActivityChart,
} from './ActivityOverview';
import { Connections } from './Connections';
import {
  ActivationDate,
  LastModified,
  LastRun,
  NextRun,
  ScheduleOverview,
  VersionSchedule,
} from './ScheduleOverview';

export function Overview() {
  const formContext = useSttFormContext();
  //When run is manually triggered we want to show the last run from the run response
  const lastRunFromSuccess = formContext?.watch('lastRun');
  const lastUpdate = formContext?.watch('river.metadata.last_updated_at');
  const { version } = useVersionController();
  const riverStore = useRiver();
  const riverId =
    riverStore?.selectedRiver?._id && getOId(riverStore.selectedRiver._id);
  const today = new Date();
  const [getConsistency, { data: consistency }] =
    useGetActivitiesConsistencyMutation();

  useEffect(() => {
    //protection - we only want to call it once the river last modified is updatded
    if (lastUpdate && riverId) {
      getConsistency({ rivers: [riverId], end_time: today.getTime() });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastUpdate, riverId]);
  const lastRun = lastRunFromSuccess ?? consistency?.items[0]?.last_runs?.[0];
  return (
    <Grid
      width="1055px"
      gridTemplateAreas="'graph' 'river-runs' 'divider'  'connections'"
      gridTemplateRows="auto min-content min-content min-content"
      height="full"
      gap={4}
      pr="4"
      pb="0"
      pt="2"
      pl="8"
      mx="auto"
    >
      <Grid gridArea="graph">
        <RenderGuard condition={!version} fallback={<VersionActivityChart />}>
          <ActivityChart />
        </RenderGuard>
      </Grid>
      <Flex flexDir="column" gap={1}>
        <SectionHeader
          icon={RdsScheduleSettings}
          text="Schedule and Timeline"
        />
        <RenderGuard condition={!version} fallback={<VersionSchedule />}>
          <ScheduleOverview />
          <ActivationDate />
          {lastRun && <LastRun lastRun={lastRun} />}
          <NextRun />

          <LastModified />
        </RenderGuard>
      </Flex>

      <Box pb="1" gridArea="connections">
        <Flex flexDir="column">
          <SectionHeader icon={ConnectionsIcon} text="Connections" />
          <Connections />
        </Flex>
      </Box>
    </Grid>
  );
}
