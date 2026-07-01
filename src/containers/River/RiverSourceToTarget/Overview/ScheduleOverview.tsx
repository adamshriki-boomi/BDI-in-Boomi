import {
  Center,
  DateDisplay,
  Divider,
  Flex,
  HStack,
  RenderGuard,
  RiveryButton,
  Text,
} from 'components';
import {
  getScheduleText,
  normalizeCronTo5Fields,
} from 'containers/River/Settings/components/ScheduleEditor';
import { SchedulingError } from 'containers/River/Settings/components/ScheduleError';
import parser from 'cron-parser';
import { formatInTimeZone } from 'date-fns-tz';
import { useSetDrawer, useSetDrawerWithParams } from 'modules/RiverRightBar';
import { DrawerType } from 'modules/RiverRightBar/Actions';
import {
  IRiverStatus,
  useSttFormContext,
  useSttMetadata,
} from 'modules/SourceTarget';
import {
  ContainedFailStatus,
  ContainedPartialStatus,
  ContainedRunningStatus,
  ContainedSkippedStatus,
  ContainedSuccessStatus,
} from 'modules/Status';
import { useCallback, useMemo } from 'react';
import { getTimeZone, patternDate } from 'utils/date.utils';
import ActivationUpdates from './ActivationUpdates';

export function VersionSchedule() {
  return (
    <Center w="full">
      <Text py={6} textStyle="I1" color="font-secondary">
        History is available in current version only
      </Text>
    </Center>
  );
}

function calcInterval(expression) {
  if (expression) {
    const shortExpression = normalizeCronTo5Fields(expression);
    const parsedExpression = parser?.parseExpression(shortExpression, {
      utc: true,
    });
    const nextOccurrences = [
      parsedExpression?.next()?.toDate(),
      parsedExpression?.next()?.toDate(),
    ];
    if (nextOccurrences.length === 2) {
      const intervalMs: number =
        (nextOccurrences[1] as any) - (nextOccurrences[0] as any);
      const intervalMins = intervalMs / (1000 * 60);
      return intervalMins;
    }
    return 0;
  }
  return null;
}

const useGetScheduleInformation = formApi => {
  const value = formApi.watch('river.schedulers');
  const expression = value?.[0]?.cron_expression;
  const isEnabled = value?.[0]?.is_enabled;
  const isScheduled = Boolean(expression) && isEnabled;

  const interval = calcInterval(expression);

  return { isScheduled, expression, interval };
};

export function ScheduleOverview() {
  const formApi = useSttFormContext();
  const { isScheduled, expression, interval } =
    useGetScheduleInformation(formApi);
  const isActive =
    formApi.watch('river.metadata.river_status') === IRiverStatus.ACTIVE;
  const setDrawer = useSetDrawer();
  const openSchedulerDrawer = useCallback(
    () => setDrawer(DrawerType.SCHEDULER),
    [setDrawer],
  );

  return (
    <Flex flexDir="column" justify="space-between" w="full" gap={1}>
      <RenderGuard
        condition={isScheduled}
        fallback={
          <Flex flexDir="column" w="full">
            <HStack justify="space-between" w="full" py={1}>
              <Text display="inline" color="font-secondary">
                No schedule was set
              </Text>
              <RiveryButton
                label="Set Schedule"
                variant="transparent"
                h={0}
                p={0}
                ml="auto"
                color="primary"
                justifyContent="left"
                onClick={openSchedulerDrawer}
              />
            </HStack>
            <SchedulingError />
          </Flex>
        }
      >
        <Flex justify="space-between" w="full" py={1}>
          <Text>Run Schedule</Text>

          <Flex flexDir="column">
            <Text
              ml="auto"
              pl={6}
              color={isActive ? 'font' : 'font-disabled'}
              role="button"
              onClick={openSchedulerDrawer}
            >
              {getScheduleText(
                normalizeCronTo5Fields(expression),
                'Custom',
                true,
              )}{' '}
              <RenderGuard condition={interval > 60}>(UTC)</RenderGuard>
            </Text>
            <SchedulingError />
          </Flex>
        </Flex>
      </RenderGuard>
      <Divider
        orientation="horizontal"
        border="2px"
        borderColor="background-secondary"
      />
    </Flex>
  );
}

function parseSchedulerExpression(expression) {
  let localExpression = undefined;
  if (expression) {
    localExpression = parser?.parseExpression(expression, { utc: true });
  }
  return { localExpression };
}

export function NextRun() {
  const formApi = useSttFormContext();
  const { isScheduled, expression } = useGetScheduleInformation(formApi);
  const metadata = useSttMetadata();
  const isSuspended = Boolean(metadata?.suspended?.suspension_date);
  const setDrawer = useSetDrawer();
  const openSchedulerDrawer = useCallback(
    () => setDrawer(DrawerType.SCHEDULER),
    [setDrawer],
  );
  const isActive =
    formApi.watch('river.metadata.river_status') === IRiverStatus.ACTIVE;

  const isLinuxExp = isScheduled && expression?.split(' ').length === 5;

  const normalizedExpression = isScheduled
    ? isLinuxExp
      ? expression
      : normalizeCronTo5Fields(expression)
    : null;

  const { localExpression } = parseSchedulerExpression(normalizedExpression);
  const parseLocal = (localExpression?.next() as any)?._date.ts;

  const nextRun = useMemo(() => {
    if (!isScheduled) return null;
    return parseLocal;
  }, [parseLocal, isScheduled]);

  const utcNext = new Date(parseLocal);

  return (
    <RenderGuard condition={isScheduled && !isSuspended}>
      <Flex
        alignItems="end"
        justify="space-between"
        py={1}
        role="button"
        onClick={openSchedulerDrawer}
      >
        <Text>Next Run </Text>
        <Flex gap={1} color={isActive ? 'font' : 'font-disabled'}>
          <DateDisplay value={nextRun} />
          (UTC {getTimeZone()}) <UTCTimezoneView utcTime={utcNext} />
        </Flex>
      </Flex>
      <Divider
        orientation="horizontal"
        border="2px"
        borderColor="background-secondary"
      />
    </RenderGuard>
  );
}

const runStatus = {
  succeeded: ContainedSuccessStatus,
  failed: ContainedFailStatus,
  'partially succeeded': ContainedPartialStatus,
  skipped: ContainedSkippedStatus,
  running: ContainedRunningStatus,
  pending: ContainedRunningStatus,
};

export function LastRun({ lastRun }) {
  const StatusComponent = lastRun && runStatus?.[lastRun?.status];
  const utcTime = lastRun?.run_date;
  const epoch = new Date(utcTime).getTime();
  const setDrawer = useSetDrawerWithParams();
  const openActivitiesDrawer = useCallback(
    () =>
      setDrawer(DrawerType.ACTIVITIES, {
        start_time: epoch - 1000,
        end_time: epoch + 1000,
        run: lastRun.run_group_id,
      }),
    [setDrawer, epoch, lastRun.run_group_id],
  );
  return (
    <Flex flexDir="column">
      <Flex w="full" justify="space-between" py={1}>
        <Text>Last Run</Text>

        <Flex color="font" gap={1} role="button" onClick={openActivitiesDrawer}>
          <StatusComponent
            text={lastRun?.status}
            sx={{
              '& span': {
                color: 'font!important',
                fontWeight: 'medium',
              },
            }}
          />
          /
          <Flex color="font!important" gap={1}>
            <DateDisplay value={lastRun?.run_date} />
            <Text>({'UTC ' + getTimeZone()})</Text>
          </Flex>
          <RenderGuard condition={utcTime}>
            <UTCTimezoneView utcTime={utcTime} />
          </RenderGuard>
        </Flex>
      </Flex>
      <Divider
        orientation="horizontal"
        border="2px"
        borderColor="background-secondary"
      />
    </Flex>
  );
}

export function ActivationDate() {
  const formApi = useSttFormContext();
  const metadata = useSttMetadata();
  const isActive =
    formApi.watch('river.metadata.river_status') === IRiverStatus.ACTIVE;
  const isSuspended = Boolean(metadata?.suspended?.suspension_date);

  if (isSuspended) {
    return <ActivationUpdates />;
  }

  const label = isActive ? 'Last Activated' : 'Last Disabled';
  const timestamp = isActive
    ? (metadata as any)?.last_activated
    : (metadata as any)?.last_disabled;

  if (!timestamp) {
    return null;
  }

  return (
    <Flex flexDir="column">
      <Flex justify="space-between" w="full" py={1}>
        <Text>{label}</Text>
        <Flex gap={1} alignItems="center">
          <Text textStyle="R7">By {metadata?.last_updated_by}</Text>/
          <Flex gap={1}>
            <DateDisplay value={timestamp} />
            <Text>(UTC {getTimeZone()})</Text>
          </Flex>
          <UTCTimezoneView utcTime={timestamp} />
        </Flex>
      </Flex>
      <Divider
        orientation="horizontal"
        border="2px"
        borderColor="background-secondary"
      />
    </Flex>
  );
}

export function LastModified() {
  const metadata = useSttMetadata();
  const utcTime = metadata?.last_updated_at;
  return (
    <Flex justify="space-between" pt={1}>
      <Text>Last Modified</Text>
      <Flex gap={1}>
        <Text textStyle="R7">By {metadata?.last_updated_by}</Text>/
        <Flex gap={1}>
          <DateDisplay value={metadata?.last_updated_at} /> (UTC {getTimeZone()}
          ) <UTCTimezoneView utcTime={utcTime} />
        </Flex>
      </Flex>
    </Flex>
  );
}

export function UTCTimezoneView({ utcTime, backslash = true }) {
  return (
    <>
      {backslash && '/'}
      <Flex gap={1}>
        <Text>{utcTime && formatInTimeZone(utcTime, 'UTC', patternDate)}</Text>
        <Text>(UTC)</Text>
      </Flex>
    </>
  );
}
