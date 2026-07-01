import { ILastRun, StatusTypes } from 'api/types';
import { Box, Flex, Grid, RiveryOverlay, Skeleton, Text } from 'components';
import { formatDuration, intervalToDuration } from 'date-fns';
import { useMemo } from 'react';
import { displayDate } from 'utils/date.utils';
import { SkeletonChart } from '../store/mockChart';

export function RunsBarCharts({ value }) {
  const values = value
    ?.slice(0, 30)
    .filter(Boolean)
    .filter(run => !Boolean(run?.status === StatusTypes.SKIPPED));

  const maxRunDurations = values?.map(
    run => run?.max_run_duration_milliseconds,
  );

  const mockMaxRunDurations = SkeletonChart.map(
    run => run?.max_run_duration_milliseconds,
  );

  const hasValues = values && values.length > 0;
  const maxValue = useMemo(() => {
    return hasValues
      ? values.length < 30
        ? Math.max(...maxRunDurations.concat(mockMaxRunDurations).slice(0, 30))
        : Math.max(...maxRunDurations)
      : Math.max(...mockMaxRunDurations);
  }, [hasValues, maxRunDurations, mockMaxRunDurations, values?.length]);

  const chartValues = useMemo(() => {
    if (hasValues) {
      return values.reverse();
    }
    return SkeletonChart;
  }, [hasValues, values]);

  if (value === null) {
    const array = Array.from(new Array(10));
    return (
      <Flex alignItems="flex-end" h="full" w="full">
        {array.map((_, idx) => (
          <Box mx={0.5} key={`bar-${idx}`} h={0.5} w={2.5} bg="gray.200" />
        ))}
      </Flex>
    );
  }

  return (
    <Grid
      gap="2px"
      gridTemplateColumns={`repeat(30, 6px)`}
      w="full"
      alignItems="end"
      height="full"
      aria-label="last 30 runs bar chart"
    >
      {chartValues.map((run, idx) => (
        <Bar
          key={`run-bar-${idx}-${run.run_group_id}`}
          {...run}
          maxDuration={maxValue}
          mock={!hasValues}
        />
      ))}
    </Grid>
  );
}

function BarWrap({ isMock, children, description }) {
  return isMock ? (
    children
  ) : (
    <RiveryOverlay description={description}>{children}</RiveryOverlay>
  );
}

// COMPONENTS
function Bar({
  max_run_duration_milliseconds,
  status,
  rpu,
  maxDuration,
  run_date,
  mock = false,
}: ILastRun & { maxDuration: number } & { mock?: boolean }) {
  const durationData = intervalToDuration({
    start: 0,
    end: max_run_duration_milliseconds,
  });
  const duration = formatDuration(durationData, customTimeDurationLocale);
  return (
    <SkeletonWrap
      mock={mock}
      height={`${Math.round(
        (max_run_duration_milliseconds / maxDuration) * 100,
      )}%`}
    >
      <BarWrap
        isMock={status === StatusTypes.MOCK}
        description={
          <Stats
            duration={duration}
            status={status}
            rpu={rpu}
            date={run_date}
          />
        }
      >
        <Box
          _hover={{
            opacity: '.6',
          }}
          role="figure"
          aria-label={`${status} ${duration}`}
          aria-labelledby="bar chart"
          h={`${Math.round(
            (max_run_duration_milliseconds / maxDuration) * 100,
          )}%`}
          bgColor={statusColorMap?.[status]}
          w="7px"
          cursor={status === StatusTypes.MOCK ? 'default' : 'pointer'}
        />
      </BarWrap>
    </SkeletonWrap>
  );
}

const SkeletonWrap = ({ mock, height, children }) => {
  return mock ? (
    <Skeleton
      speed={1.2}
      startColor="gray.200"
      endColor="gray.500"
      width="100%"
      h={height}
      as={Flex}
    >
      {children}
    </Skeleton>
  ) : (
    children
  );
};

function Stats({ status, duration, rpu, date }) {
  return (
    <>
      {[
        ['Run Date', displayDate(date, 'dd-MMM-yy, HH:mm:ss')],
        ['Status', status],
        ['Max Duration of Entire Run', duration],
        ['BDU', rpu],
      ].map(([label, value]) => (
        <StatItem
          key={`stat-item-${label}-${value}`}
          label={label}
          value={value}
        />
      ))}
    </>
  );
}

function StatItem({ label, value }) {
  return (
    <Flex gap="2" fontSize="xs">
      <Text>{label}:</Text>
      <Text textTransform="capitalize">{value}</Text>
    </Flex>
  );
}
const exoTheme = import.meta.env.VITE_EXO_THEME === 'true';
// HELPERS
const statusColorMap = {
  [StatusTypes.CANCELED]: 'gray.800',
  [StatusTypes.FAILED]: 'background-danger-strong',
  [StatusTypes.PENDING]: 'gray.800',
  [StatusTypes.RUNNING]: 'blue.200',
  [StatusTypes.SUCCEEDED]: 'green.200',
  [StatusTypes.PARTIAL]: exoTheme ? 'yellow.500' : 'yellow.200',
  [StatusTypes.MOCK]: 'gray.300',
};

const formatDistanceLocale = {
  xSeconds: '{{count}}s',
  xMinutes: '{{count}}m',
  xHours: '{{count}}h',
  xDays: '{{count}}d',
};
const customTimeDurationLocale = {
  locale: {
    formatDistance: (token, count) =>
      formatDistanceLocale[token].replace('{{count}}', count),
  },
};
