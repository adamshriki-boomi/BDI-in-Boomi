import { StatusTypes } from 'api/types';
import {
  Box,
  Flex,
  Grid,
  HStack,
  LogStatusIconAndText,
  LogStatusText,
  PageOverlaySpinner,
  RenderGuard,
  ResultsPanelInnerSpinner,
  Text,
} from 'components';
import { DateDisplay, DurationDisplay } from 'components/DateDisplay';
import { NarrowRow, WideRow } from 'components/Drawer/DrawerStatusRow';
import { Tagger } from 'components/Tracking/Tagger';
import { useRiverId } from 'containers/Activities/helpers';
import {
  useGetActivityRunsLogQuery,
  useGetRiverActivitiesSingleRunQuery,
} from 'containers/Activities/store';
import { getQueryParams } from 'hooks/router';
import { useSearchParam } from 'react-use';
import { ActivitiesTags } from 'utils/tracking.tags';
import { toErrorString } from 'utils/utils';
import { isFailureStatus } from 'utils/status.utils';
import { EnableAiPrompt } from '../components/AiFix.drawer';
import { DownloadLogButton } from '../components/DownloadLogButton';
import { RunCostSection } from '../components/RunCostSection';

export function ActionRiverActivity() {
  const riverId = useRiverId();
  const runId = useSearchParam('run');
  const { data: run, isLoading: runLoading } =
    useGetRiverActivitiesSingleRunQuery({ riverId, runId });
  return <RunLog riverId={riverId} data={run} isLoading={runLoading} />;
}

function RunLog({ riverId, data, isLoading }) {
  const { end_time, start_time } = getQueryParams(['end_time', 'start_time']);
  const {
    data: tasks,
    isLoading: tasksLoading,
    isFetching,
  } = useGetActivityRunsLogQuery(
    {
      riverId,
      runId: data?.run_id,
      end_time,
      start_time,
    },
    { skip: !Boolean(data?.run_id) },
  );
  if (!Boolean(data?.run_id)) {
    return null;
  }
  const date = new Date();
  const endTime = data.end_date_in_milliseconds
    ? data.end_date_in_milliseconds
    : [StatusTypes.RUNNING, StatusTypes.PENDING].includes(data.status)
    ? date.getTime()
    : null;

  return (
    <Box>
      {isLoading || tasksLoading ? (
        <PageOverlaySpinner />
      ) : (
        <Flex flexDir="column" maxW="550px" h="full">
          <RenderGuard condition={isFetching}>
            <ResultsPanelInnerSpinner />
          </RenderGuard>
          <HStack pb={3} w="full" justify="space-between">
            <HStack gap={1}>
              <Text color="font-secondary">Run ID</Text>
              <Text>{data?.run_id}</Text>
            </HStack>
            <Tagger tags={ActivitiesTags.DOWNLOAD_ACTION_LOG}>
              <DownloadLogButton
                runId={data?.run_id}
                riverId={riverId}
                runDate={data?.start_date_in_milliseconds}
              />
            </Tagger>
          </HStack>
          <WideRow
            alignItems="center"
            h="40px"
            bg="background-secondary"
            px={2}
            name={<Text>Status</Text>}
            value={
              <Grid>
                <LogStatusIconAndText value={data?.status} />
              </Grid>
            }
          />
          <WideRow name="BDU" value={Number.parseFloat(data?.rpu).toFixed(2)} />
          <WideRow
            value={
              endTime ? (
                <DurationDisplay
                  ms={endTime - data?.start_date_in_milliseconds}
                />
              ) : (
                '--:--'
              )
            }
            name="Duration"
          />
          <Tasks
            data={tasks?.items}
            showEnableBanner={isFailureStatus(data?.status)}
          />
          <RunCostSection data={tasks} />
        </Flex>
      )}
    </Box>
  );
}

function Tasks({ data = [], showEnableBanner }) {
  return (
    <Flex py={2} flexDir="column">
      {data.map((task, idx) => (
        <Flex key={idx} flexDir="column">
          <Flex fontSize="xs" key={task?.task_id} flexDir="column">
            <NarrowRow name="Task ID" value={task?.task_id} />
            <NarrowRow
              name="Run Time"
              value={<DateDisplay value={task?.start_date_in_milliseconds} />}
            />
            <NarrowRow
              name="Run Duration"
              value={<DurationDisplay ms={task?.duration} />}
            />
            <NarrowRow
              name="Status"
              value={
                <LogStatusText
                  value={task?.task_status}
                  errorMessage={toErrorString(task.error_description)}
                />
              }
            />
            <NarrowRow
              name="Source"
              value={<Text textTransform="capitalize">{task?.source}</Text>}
            />
            {task?.error_description ? (
              <>
                <NarrowRow
                  name="Error Description"
                  value={
                    <Text color="red.500">
                      {toErrorString(task.error_description)}
                    </Text>
                  }
                />
                {showEnableBanner ? (
                  <Box mt={2}>
                    <EnableAiPrompt />
                  </Box>
                ) : null}
              </>
            ) : null}
          </Flex>
        </Flex>
      ))}
    </Flex>
  );
}
