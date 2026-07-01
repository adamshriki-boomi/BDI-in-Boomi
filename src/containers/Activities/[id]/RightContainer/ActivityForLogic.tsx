import { StatusTypes } from 'api/types';
import {
  Box,
  HStack,
  RenderGuard,
  Spinner,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
} from 'components';
import { Tagger } from 'components/Tracking/Tagger';
import {
  useGetLogicRunStepsQuery,
  useGetRiverActivitiesSingleRunQuery,
} from 'containers/Activities/store';
import { getQueryParams } from 'hooks/router';
import LogsGrid from 'modules/Monitoring/LogicLogsGrid';
import { useSearchParam } from 'react-use';
import { ActivitiesTags } from 'utils/tracking.tags';
import { useRiverId } from '../../helpers';
import { DownloadLogButton } from '../components/DownloadLogButton';

export function ActivityForLogic() {
  const { end_time, start_time } = getQueryParams(['end_time', 'start_time']);
  const riverId = useRiverId();
  const runId = useSearchParam('run');

  const { data: run } = useGetRiverActivitiesSingleRunQuery(
    { riverId, runId },
    { skip: !runId },
  );

  const {
    data: steps,
    isLoading,
    isFetching,
  } = useGetLogicRunStepsQuery(
    {
      riverId,
      runId,
      end_time,
      start_time,
    },
    { skip: !runId || !run?.run_id || !riverId },
  );

  const loading = isFetching || isLoading;

  if (
    run?.status === StatusTypes.SKIPPED ||
    (!runId && !loading && !Boolean(steps))
  ) {
    return null;
  }

  return (
    <LogicRiverTabs
      logs={
        <LogsGrid
          data={steps ? steps : []}
          isLoading={loading}
          isActivitiesView={true}
        />
      }
      actions={
        <HStack my={1} gap={3}>
          <RenderGuard condition={isFetching}>
            <Spinner boxSize={5} />
          </RenderGuard>
          <HStack gap={1}>
            <Text color="font-secondary">Run ID</Text>
            <Text>{run?.run_id}</Text>
          </HStack>
          <Tagger tags={ActivitiesTags.DOWNLOAD_LOGIC_LOG}>
            <DownloadLogButton
              buttonProps={{ mb: 1, size: 'small' }}
              runId={run?.run_id}
              riverId={riverId}
              runDate={run?.start_date_in_milliseconds}
            />
          </Tagger>
        </HStack>
      }
    />
  );
}

function LogicRiverTabs({ logs, actions }) {
  return (
    <>
      <Tabs isLazy display="flex" flexDirection="column" overflow="hidden">
        <TabList borderBottom="1px solid var(--chakra-colors-gray-300) !important">
          <Tab aria-label="logs" mb="-1px !important">
            Logs
          </Tab>
          <Box ml="auto">{actions}</Box>
        </TabList>
        <TabPanels overflow="auto">
          <TabPanel>{logs}</TabPanel>
        </TabPanels>
      </Tabs>
    </>
  );
}
