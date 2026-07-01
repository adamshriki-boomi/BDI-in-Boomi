import { ExLoader, LoaderSize } from '@boomi/exosphere';
import {
  Center,
  CheckmarkSolid,
  CloseBgSolid,
  Flex,
  Grid,
  HStack,
  Icon,
  NoData,
  RdsActivities,
  RenderGuard,
  RpuIcon,
  Text,
} from 'components';
import SvgPlayEmpty from 'components/Icons/components/PlayEmpty';
import { useActivittyWeekly } from 'containers/Activities';
import { useRiverId } from 'containers/Activities/helpers';
import { ActivitiesStatsResponse } from 'containers/Activities/store/activities.types';
import { addDays, endOfDay, startOfDay, subDays } from 'date-fns';
import { useSttFormContext } from 'modules/SourceTarget';
import { useCallback, useEffect, useState } from 'react';
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Label,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { displayDate } from 'utils/date.utils';

function composeData(activity: ActivitiesStatsResponse, date) {
  const runs = activity?.succeeded + activity?.failed;

  return {
    runs,
    rpu: activity?.total_rpu,
    date: displayDate(date, 'dd-MMMM-yy'),
  };
}

function composeState(activity, state) {
  const dataStructure = composeData(activity, state.start_time);
  const dailyStats = [...state.build, dataStructure];
  return {
    build: dailyStats,
    start_time: addDays(state.start_time, 1).getTime(),
    end_time: addDays(state.end_time, 1).getTime(),
    successes: state.successes + activity?.succeeded,
    failures: state.failures + activity?.failed,
  };
}

const useInitialState = () => {
  const today = new Date();
  const initialStartDate = startOfDay(subDays(today, 6)).getTime();
  const initialEndDate = endOfDay(subDays(today, 6)).getTime();
  return {
    start_time: initialStartDate,
    end_time: initialEndDate,
    successes: 0,
    failures: 0,
    build: [],
  };
};

const useStructureGraphData = latestRunResult => {
  const initialState = useInitialState();
  const riverId = useRiverId();
  const [data, setData] = useState(initialState);
  const { getStats, isLoading, isFetching } = useActivittyWeekly({
    riverId,
    start_time: data?.start_time,
    end_time: data?.end_time,
  });
  const getNextDay = useCallback(async () => {
    const activity = await getStats();
    await setData(state => composeState(activity, state));
  }, [getStats]);

  useEffect(() => {
    setData(initialState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latestRunResult]);

  useEffect(() => {
    if (!isLoading && !isFetching && data?.build?.length < 7) {
      getNextDay();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.build?.length]);
  return data?.build?.length < 7
    ? { build: [], successes: 0, failures: 0 }
    : data;
};

function TooltipData({ label, value }) {
  return (
    <HStack justify="space-between">
      <Text>{label}</Text>
      <Text>{value}</Text>
    </HStack>
  );
}

export function SectionHeader({ icon, text }) {
  return (
    <HStack
      justify="space-between"
      borderBottom="1px solid"
      borderBottomColor="gray.300"
      pb={3}
      textStyle="M6"
    >
      <Flex align="center" color="primary" gap={1}>
        <Icon as={icon} boxSize={4} mr={1} />
        {text}
      </Flex>
    </HStack>
  );
}

function getRpuDisplay(rpu: number): number | string {
  return rpu == null ? '' : rpu > 0 && rpu < 0.01 ? '<0.01' : rpu.toFixed(2);
}

export function ActivityChart() {
  const formApi = useSttFormContext();
  const lastRunFromSuccess = formApi?.watch('lastRun');
  const {
    build: data,
    successes,
    failures,
  } = useStructureGraphData(lastRunFromSuccess);
  const runs = data ? data.reduce((acc, { runs }) => acc + runs, 0) : 0;
  const rpu = data ? data.reduce((acc, { rpu }) => acc + rpu, 0) : 0;
  return (
    <Grid gap={2} h="full" templateRows="min-content min-content auto">
      <SectionHeader
        icon={RdsActivities}
        text={
          <>
            <Text>Activity</Text>
            <Text textStyle="R7">(Last 7 days)</Text>
          </>
        }
      />
      <FixedData
        runs={runs}
        rpu={rpu}
        successes={successes}
        failures={failures}
      />
      <Grid h="calc(100% - 30px)">
        {Boolean(data?.length) ? (
          <RenderGuard condition={runs > 0} fallback={<NoExecutionsBox />}>
            <ResponsiveContainer minHeight="240px">
              <ComposedChart data={data} margin={{ top: 40 }}>
                <Tooltip
                  content={({ payload }) => {
                    const date = payload?.[0]?.payload?.date;
                    const runs = payload?.[0]?.payload?.runs;
                    const rpu = payload?.[0]?.payload?.rpu;
                    const tooltipRpuDisplay = getRpuDisplay(rpu);
                    return (
                      <Flex
                        minW="200px"
                        fontSize="xs"
                        bg="background-secondary"
                        borderRadius={4}
                        p={2}
                        flexDir="column"
                        boxShadow="md"
                      >
                        <TooltipData label="Runs Date" value={date} />
                        <TooltipData label="Number of Runs" value={runs} />
                        <TooltipData
                          label="Total BDU"
                          value={tooltipRpuDisplay}
                        />
                      </Flex>
                    );
                  }}
                />
                <XAxis dataKey="date" fontSize={10} />
                <YAxis
                  dataKey="runs"
                  yAxisId="left"
                  fontSize={10}
                  allowDecimals={false}
                >
                  <Label
                    position={{ x: 70, y: -20 }}
                    value="Runs"
                    fontWeight={500}
                    fontSize={12}
                  />
                </YAxis>
                {/* <YAxis
                  dataKey="rpu"
                  yAxisId="right"
                  orientation="right"
                  fontSize={10}
                >
                  <Label
                    position={{ x: 15, y: -20 }}
                    value="RPU"
                    fontWeight={500}
                  />
                </YAxis> */}
                <CartesianGrid
                  horizontal
                  vertical={false}
                  strokeDasharray="3 3"
                />
                <Area
                  type="linear"
                  dataKey="runs"
                  stroke="#1ac9e6"
                  fill="#1ac9e6"
                  yAxisId="left"
                />
                {/* <Line
                  strokeWidth={1.5}
                  type="monotone"
                  dataKey="rpu"
                  stroke="#DB4CB2"
                  activeDot={{ r: 8 }}
                  yAxisId="right"
                /> */}
              </ComposedChart>
            </ResponsiveContainer>
            {/* <ChartLegend /> */}
          </RenderGuard>
        ) : (
          <Center h="full" w="full">
            <ExLoader size={LoaderSize.MEDIUM} />
          </Center>
        )}
      </Grid>
    </Grid>
  );
}

// function ChartLegend() {
//   return (
//     <Center gap={4}>
//       <Flex alignItems="center" gap={1}>
//         <Box bg="#1ac9e6" boxSize={4} />
//         <Text textStyle="M7" color="font">
//           Runs
//         </Text>
//       </Flex>
//       <Flex alignItems="center" gap={1}>
//         <Box h="2px" w="10px" bg="#DB4CB2" />
//         <Text textStyle="M7" color="font">
//           RPU
//         </Text>
//       </Flex>
//     </Center>
//   );
// }

function NoExecutionsBox({ text = null }) {
  return (
    <Center
      gap={2}
      w="full"
      bg="background-secondary"
      borderRadius={4}
      color="font-secondary"
      flexDir="column"
    >
      <Icon as={NoData} color="icon-disabled" boxSize={8} />

      <Center flexDir="column">
        <RenderGuard
          condition={!Boolean(text)}
          fallback={<Text textStyle="I1">{text}</Text>}
        >
          <Text textStyle="M5">No new data to show</Text>
          <Text textAlign="center">
            No runs registered during the last 7 days. Fill this chart with lots
            of great
            <br />
            activities by running your data flow.
          </Text>
        </RenderGuard>
      </Center>
    </Center>
  );
}

function FixedData({ rpu, runs, successes, failures }) {
  const rpuDisplay = getRpuDisplay(rpu);

  return (
    <Grid w="full" gap={4} templateColumns="5fr 3fr">
      <DataBox
        header="Runs"
        icon={SvgPlayEmpty}
        number={runs}
        successes={successes}
        failures={failures}
      />
      {/* <DataBox
        header="Data Volume"
        icon={Server}
        number={executions}
        units="(GB)"
      /> */}
      <DataBox header="BDU" icon={RpuIcon} number={rpuDisplay} />
    </Grid>
  );
}

function DataBox({
  header,
  icon,
  number,
  units = null,
  successes = 0,
  failures = 0,
}) {
  return (
    <Center
      flexDir="column"
      bg="background-secondary"
      borderRadius={4}
      gap={2}
      p={3}
      minH="72px"
    >
      <HStack justify="space-between">
        <HStack>
          <Icon as={icon} color="purple.300" boxSize="18px" />
          <Text textStyle="M6" color="purple.300">
            {header}
          </Text>
          {/* <RenderGuard condition={Boolean(units)}>
            <Text
              marginInlineStart="0.2rem!important"
              textStyle="R8"
              color="font"
            >
              {units}
            </Text>
          </RenderGuard> */}
        </HStack>
      </HStack>
      <HStack justify="space-between" gap={12}>
        <Flex flexDir="column" textAlign="center">
          <Text textStyle="M5">{number}</Text>
          <RenderGuard condition={header === 'Runs' && number > 0}>
            <Text textStyle="M7">Total</Text>
          </RenderGuard>
        </Flex>
        <RenderGuard condition={header === 'Runs' && number > 0}>
          <HStack marginInlineStart="0px!important" gap={12} textStyle="R8">
            <RunsStats
              total={number}
              status={successes}
              icon={
                <Icon
                  as={CheckmarkSolid}
                  color="success"
                  boxSize={4}
                  mr="4px"
                />
              }
              type="Succeeded"
            />
            <RunsStats
              total={number}
              status={failures}
              icon={
                <Icon
                  as={CloseBgSolid}
                  color="background-danger-strong"
                  boxSize={4}
                  mr="4px"
                />
              }
              type="Failed"
            />
          </HStack>
        </RenderGuard>
      </HStack>
    </Center>
  );
}

function RunsStats({ total, status, icon, type }) {
  const perecentage = ((status / total) * 100).toFixed(0);
  return (
    <Flex flexDir="column">
      <HStack alignSelf="center">
        <Text textStyle="M5"> {status.toLocaleString('en')}</Text>
        <RenderGuard condition={status > 0}>
          <Text marginInlineStart="0.2rem!important">{`(${perecentage}%)`}</Text>
        </RenderGuard>
      </HStack>
      <Flex alignItems="center">
        {icon}
        <Text textStyle="R7">{type}</Text>
      </Flex>
    </Flex>
  );
}

export function VersionActivityChart() {
  return (
    <Flex flexDir="column" gap={2}>
      <SectionHeader
        icon={RdsActivities}
        text={
          <>
            <Text>Activity</Text>
            <Text textStyle="R7">(Last 7 days)</Text>
          </>
        }
      />
      <FixedData runs={null} rpu={null} successes={0} failures={0} />
      <Grid h="calc(100% - 110px)">
        <NoExecutionsBox text="Activity view is available in current version only" />
      </Grid>
    </Flex>
  );
}
