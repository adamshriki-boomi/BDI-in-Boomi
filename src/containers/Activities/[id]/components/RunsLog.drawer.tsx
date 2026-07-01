import { StatusTypes } from 'api/types';
import {
  ArrowNarrowRight,
  Box,
  DateDisplay,
  DrawerBody,
  DrawerCloseLink,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  HStack,
  Icon,
  InfoTooltip,
  RenderGuard,
  ResultsPanelInnerSpinner,
  RiveryInfoTooltip,
  Text,
  useDrawerParam,
} from 'components';
import { DurationDisplay } from 'components/DateDisplay';
import { NarrowRow } from 'components/Drawer/DrawerStatusRow';
import {
  LogStatus,
  LogStatusText,
} from 'components/RiveryTableCells/LogStatus';
import { Tagger } from 'components/Tracking/Tagger';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { isFailureStatus } from 'utils/status.utils';
import { getTimeZone } from 'utils/date.utils';
import { ActivitiesTags } from 'utils/tracking.tags';
import { toErrorString } from 'utils/utils';
import { useRiverId } from '../../helpers';
import {
  useGetActivityRunsLogQuery,
  useGetRiverActivitiesSingleRunQuery,
} from '../../store';
import { DownloadLogButton } from './DownloadLogButton';
import { AiFixDrawer, EnableAiPrompt } from './AiFix.drawer';
import { RunCostSection } from './RunCostSection';
import { useTroubleshootDiagnose } from './useTroubleshootDiagnose';

const useGetRun = () => {
  const { location } = useHistory();
  const state: any = location?.state;
  return state?.run_id;
};

export function RunsLog({
  'data-pendo-id': pendoId,
}: { 'data-pendo-id'?: string } = {}) {
  const { location } = useHistory();
  const state: any = location?.state;
  const docsUrlFromState = state?.docsUrl;
  const [mode, setMode] = useState<'tasks' | 'ai'>('tasks');

  useEffect(() => {
    if (state?.openAi) {
      setMode('ai');
    }
  }, [state?.openAi]);

  const riverId = useRiverId();
  const runId = useGetRun();
  const [tableName] = useDrawerParam();

  const { data: run } = useGetRiverActivitiesSingleRunQuery(
    { riverId, runId },
    { skip: !runId },
  );
  const { data, isLoading, isFetching } = useGetActivityRunsLogQuery(
    {
      riverId,
      runId,
    },
    { skip: !Boolean(runId) },
  );
  const isRunFinished = [
    StatusTypes.FAILED,
    StatusTypes.SUCCEEDED,
    StatusTypes.SKIPPED,
  ].includes(run?.status);
  const logHeader =
    tableName !== 'null'
      ? tableName
      : isRunFinished
      ? 'Unable to retrieve table name'
      : 'Pending...';

  const {
    diagnoseContext,
    aiFixTitle,
    troubleshootData,
    isTroubleshootLoading,
    diagnoseError,
  } = useTroubleshootDiagnose({
    run,
    logItems: data?.items,
    runId,
    riverId,
    isAiFix: mode === 'ai',
    logHeader,
  });

  if (!run) {
    return null;
  }

  return (
    <>
      <DrawerOverlay />
      <DrawerContent data-pendo-id={pendoId}>
        {mode === 'ai' ? (
          <AiFixDrawer
            onBack={() => setMode('tasks')}
            aiFixTitle={aiFixTitle}
            showSpinner={false}
            errorDescription={toErrorString(diagnoseContext?.error_description)}
            isTroubleshootLoading={isTroubleshootLoading}
            troubleshootData={
              (troubleshootData ?? {}) as { formatted_report?: string | null }
            }
            documentationUrl={docsUrlFromState}
            diagnoseError={diagnoseError}
          />
        ) : (
          <>
            <DrawerHeader
              fontSize="lg"
              py={3}
              mx={6}
              px={0}
              borderBottom="1px solid"
              borderBottomColor="border"
            >
              <Text width="90%" minH={7}>
                {logHeader}
              </Text>
            </DrawerHeader>
            <DrawerCloseLink />
            <RenderGuard condition={isFailureStatus(run?.status)}>
              <Box mx={6} mt={2}>
                <EnableAiPrompt />
              </Box>
            </RenderGuard>
            {isLoading || isFetching ? (
              <ResultsPanelInnerSpinner />
            ) : (
              <DrawerBody gap="4" pt={2}>
                <Flex
                  pb={2}
                  alignItems="center"
                  gap={2}
                  justifyContent="space-between"
                >
                  <Flex gap={1}>
                    <Text>Run ID:</Text>
                    <Text color="font-secondary">{runId}</Text>
                  </Flex>
                  <Tagger tags={ActivitiesTags.DOWNLOAD_S2T_LOG}>
                    <DownloadLogButton
                      riverId={riverId}
                      runId={runId}
                      runDate={run?.start_date_in_milliseconds}
                    />
                  </Tagger>
                </Flex>
                <Flex flexDir="column" gap={4}>
                  <RenderGuard condition={Boolean(data?.items?.[0])}>
                    <SourceTaskLog
                      data={data?.items[0]}
                      onAiClick={() => setMode('ai')}
                    />
                  </RenderGuard>
                  <RenderGuard condition={Boolean(data?.items?.[1])}>
                    <TargetTaskLog
                      data={data?.items[1]}
                      onAiClick={() => setMode('ai')}
                    />
                  </RenderGuard>
                  <RenderGuard condition={Boolean(data?.items?.[2])}>
                    <SourceTaskLog
                      data={data?.items[2]}
                      onAiClick={() => setMode('ai')}
                    />
                  </RenderGuard>
                  <RenderGuard condition={Boolean(data?.items?.[3])}>
                    <TargetTaskLog
                      data={data?.items[3]}
                      onAiClick={() => setMode('ai')}
                    />
                  </RenderGuard>
                  <RunCostSection data={data} />
                </Flex>
              </DrawerBody>
            )}
          </>
        )}
      </DrawerContent>
    </>
  );
}

const SourceTaskLog = ({ data, onAiClick }) => {
  const errorMessage = toErrorString(data?.error_description);
  return (
    <Flex flexDir="column">
      <HStack
        bgColor="background-secondary"
        p={2}
        mb={4}
        borderBottom="1px"
        borderBottomColor="gray.300"
        display="grid"
        gridTemplateColumns="min-content 1fr"
        alignItems="center"
        gap={2}
      >
        <LogStatus value={data?.task_status} />
        <Text display="flex" alignItems="center" gap={3}>
          {data?.source} <Icon as={ArrowNarrowRight} /> {data?.target}
        </Text>
      </HStack>

      <NarrowRow name="Task Id" value={data?.task_id} />

      <NarrowRow
        name="Run Time"
        value={
          <Flex gap={1}>
            <DateDisplay value={data?.start_date_in_milliseconds} />
            (UTC {getTimeZone()})
          </Flex>
        }
      />

      <NarrowRow
        name="Run Duration"
        value={<DurationDisplay ms={data?.duration} />}
      />
      <NarrowRow
        name="Status"
        value={
          <LogStatusText
            value={data?.task_status}
            errorMessage={errorMessage}
            onAiClick={onAiClick}
          />
        }
      />

      <RenderGuard condition={data?.task_status === StatusTypes.FAILED}>
        <NarrowRow
          paddingInlineStart={0}
          name="Error Description"
          value={
            errorMessage?.includes('Done With Warning')
              ? errorMessage.replace('Done With Warning', 'Done with warning')
              : errorMessage
          }
        />
      </RenderGuard>

      <NarrowRow name="Source" value={data?.source} />
      <NarrowRow name="Target" value={data?.target} />

      <RenderGuard condition={data?.size_formatted}>
        <NarrowRow
          name="Size"
          value={`${data?.size_formatted?.size} ${data?.size_formatted?.units}`}
        />
      </RenderGuard>

      <RenderGuard condition={data?.input_parameters?.length > 0}>
        <Flex
          mt={3}
          flexDir="column"
          borderTop="1px solid"
          borderTopColor="gray.300"
          py={3}
        >
          <Text fontWeight="medium">Input Parameters (UTC)</Text>
          {data.input_parameters.map(({ name, value }) => (
            <NarrowRow
              key={name}
              name={name}
              value={
                typeof value === 'number' ? (
                  value
                ) : (
                  <DateDisplay value={value} />
                )
              }
            />
          ))}
        </Flex>
      </RenderGuard>
    </Flex>
  );
};
const TargetTaskLog = ({ data, onAiClick }) => {
  const errorMessage = toErrorString(data?.error_description);

  return (
    <Flex flexDir="column">
      <HStack
        bgColor="background-secondary"
        p={2}
        mb={4}
        borderBottom="1px"
        borderBottomColor="gray.300"
        display="grid"
        gridTemplateColumns="min-content 1fr"
        alignItems="center"
        gap={2}
      >
        <LogStatus value={data?.task_status} />
        <Text display="flex" alignItems="center" gap={3}>
          {data?.source} <Icon as={ArrowNarrowRight} /> {data?.target}
        </Text>
      </HStack>

      <NarrowRow name="Task Id" value={data?.task_id} />

      <NarrowRow
        name="Run Time"
        value={
          <Flex gap={1}>
            <DateDisplay value={data?.start_date_in_milliseconds} />
            (UTC {getTimeZone()})
          </Flex>
        }
      />

      <NarrowRow
        name="Run Duration"
        value={<DurationDisplay ms={data?.duration} />}
      />

      <NarrowRow
        name="Status"
        value={
          <LogStatusText
            value={data?.task_status}
            errorMessage={errorMessage}
            onAiClick={onAiClick}
          />
        }
      />

      <RenderGuard condition={data?.task_status === StatusTypes.FAILED}>
        <NarrowRow
          name="Error Description"
          value={
            errorMessage?.includes('Done With Warning')
              ? errorMessage.replace('Done With Warning', 'Done with warning')
              : errorMessage
          }
        />
      </RenderGuard>

      <RenderGuard condition={data.source}>
        <NarrowRow name="Source" value={data.source} />
      </RenderGuard>
      <RenderGuard condition={data.target}>
        <NarrowRow name="Target" value={data.target} />
      </RenderGuard>
      <RenderGuard condition={Boolean(data?.target_records_loaded)}>
        <NarrowRow
          name={
            <HStack h={5}>
              <Text>Target Rows Loaded</Text>
              <RiveryInfoTooltip
                extraProps={{ placement: 'right' }}
                buttonProps={{ minW: 0 }}
                icon={<Icon as={InfoTooltip} boxSize="14px" />}
                description="The number of new or updated rows loaded to the target table."
              />
            </HStack>
          }
          value={data?.target_records_loaded?.toLocaleString()}
        />
      </RenderGuard>
    </Flex>
  );
};
