import {
  Center,
  CircularProgress,
  CircularProgressLabel,
  Spinner,
} from '@chakra-ui/react';
import { Plans, PlansIds } from 'api/types';
import {
  Flex,
  HStack,
  Icon,
  RenderGuard,
  RiveryInfoTooltip,
  RpuIcon,
  SortDown,
  SortUp,
  Text,
} from 'components';
import RiveryAlert from 'components/Alert/Alert';
import { useEffect, useState } from 'react';
import { useCore } from 'store/core';
import { NoDataVisual, TooltipBDU } from './helpers';

function RPUHeader() {
  return (
    <HStack>
      <Text color="font">Current BDU Spend</Text>
      <TooltipBDU
        iconStyle={{ color: 'icon-disabled' }}
        buttonProps={{
          minW: '16px!important',
          h: 0,
        }}
      />
    </HStack>
  );
}

export function PieChartAccountRPUUsage({ rpuUsage: value, isLoading }) {
  const { totalAcquiredRPU } = useCore();
  const usage = Boolean(totalAcquiredRPU)
    ? (value / totalAcquiredRPU) * 100
    : 0;
  return (
    <Flex flexDir="column" gap={2} w="full">
      <RPUHeader />
      <Flex
        h="full"
        flexDir="column"
        p={4}
        boxShadow="md"
        borderRadius={4}
        bg="white"
        alignItems="center"
        justify="center"
        gap={3}
      >
        <RenderGuard
          condition={typeof totalAcquiredRPU == 'number'}
          fallback={<NoDataVisual />}
        >
          <HStack alignItems="center" gap={3}>
            {totalAcquiredRPU > 0 ? (
              <>
                <CircularProgressBar progress={usage} loading={isLoading} />
                <Flex flexDir="column" w="full">
                  <HStack w="full" justify="center">
                    <RiveryInfoTooltip
                      buttonProps={{
                        marginInlineStart: '0px!important',
                        minW: 0,
                        height: 0,
                      }}
                      description={`Your current balance is ${(
                        totalAcquiredRPU - value
                      ).toLocaleString(undefined, {
                        maximumFractionDigits: 0,
                      })} RPUs`}
                      icon={
                        <Icon as={RpuIcon} color="primary" boxSize="22px" />
                      }
                    />
                    <Text textStyle="M4" textAlign="center">
                      {value?.toLocaleString(undefined, {
                        maximumFractionDigits: 0,
                      })}
                    </Text>
                  </HStack>
                  <RenderGuard condition={totalAcquiredRPU > 0 && !isLoading}>
                    <Text
                      textStyle="R5"
                      color="font-secondary"
                      textAlign="center"
                    >
                      of {totalAcquiredRPU?.toLocaleString()}
                    </Text>
                  </RenderGuard>
                </Flex>
              </>
            ) : (
              <Flex alignItems="center" gap={2}>
                <Text textStyle="M4">{value?.toLocaleString()}</Text>
                <Text>BDUs</Text>
              </Flex>
            )}
          </HStack>
        </RenderGuard>
        {usage >= 100 && (
          <RiveryAlert
            px={2}
            variant="error-light"
            description="You have reached the maximum BDU credits for your account. Please contact us for more credits"
          />
        )}
      </Flex>
    </Flex>
  );
}

function UsageBox({
  text,
  color,
  number,
  percentage,
  icon,
  iconColor,
  isLoading,
}) {
  return (
    <Center
      minH="140px"
      flex={1}
      flexDir="column"
      alignItems="center"
      py={8}
      px={6}
      boxShadow="0 0 4px rgb(0 0 0 / 15%)"
      bg="white"
      gap={4}
      aria-label="usage-monthly"
    >
      <Text>{text} Month</Text>
      {isLoading ? (
        <Spinner />
      ) : (
        <RenderGuard condition={Boolean(icon)} fallback={<NoDataVisual />}>
          <HStack position="relative">
            <Icon as={RpuIcon} color={color} boxSize="26px" />
            <Text textStyle="B4" color={color}>
              {number?.toLocaleString('en')}
            </Text>
            <Text color="font-secondary">{percentage?.toFixed(2)}%</Text>
            <Icon
              position="absolute"
              as={icon}
              color={iconColor}
              boxSize={3}
              right={-4}
            />
          </HStack>
        </RenderGuard>
      )}
    </Center>
  );
}

function useCalcRelative(current, relativeTo) {
  const [state, setState] = useState({
    percentage: null,
    color: null,
    icon: null,
  });
  let diff;
  let percentage;

  const noUsage = current === 0 && relativeTo === 0;

  if (current > relativeTo) {
    diff = current - relativeTo;
    percentage = (diff / current) * 100;
  } else if (current < relativeTo) {
    diff = relativeTo - current;
    percentage = (diff / relativeTo) * 100;
  } else if (noUsage) {
    percentage = 0;
  }
  const icon = noUsage ? null : relativeTo > current ? SortDown : SortUp;
  const color = noUsage
    ? 'gray.300'
    : relativeTo > current
    ? 'red.200'
    : 'green.200';

  useEffect(() => {
    if (current !== 0) {
      if (relativeTo === 0) {
        setState({ percentage: 100, color: 'green.200', icon: SortUp });
        return;
      }
    }
    setState({ percentage, color, icon });
  }, [color, current, icon, percentage, relativeTo]);
  return state;
}

function MonthlyRelativeRPUUsage({ rpuUsage, isLoading }) {
  const { current, previous, before } = rpuUsage;
  const boxCurrent = useCalcRelative(current, previous);
  const boxLast = useCalcRelative(previous, before);
  const { partner } = useCore();
  if (partner === 'aws') {
    return null;
  }
  return (
    <Flex
      flex={1}
      flexDir="column"
      gap={2}
      w="full"
      aria-label="monthly-rpu-usage"
    >
      <RPUHeader />
      <Flex flex={1} gap={2} w="full">
        <UsageBox
          text="Current"
          color="background-selected"
          number={current}
          percentage={boxCurrent.percentage}
          icon={boxCurrent?.icon}
          iconColor={boxCurrent?.color}
          isLoading={isLoading}
        />
        <UsageBox
          text="Last"
          color="gray.300"
          number={previous}
          percentage={boxLast.percentage}
          icon={boxLast.icon}
          iconColor={boxLast.color}
          isLoading={isLoading}
        />
      </Flex>
    </Flex>
  );
}

function CircularProgressBar({ progress, loading }) {
  const progressColor =
    progress < 85
      ? 'background-selected'
      : progress >= 100
      ? 'red.200'
      : 'yellow.500';
  return loading ? (
    <Spinner w={8} />
  ) : (
    <CircularProgress
      borderRadius={4}
      size="85px"
      value={progress}
      color={progressColor}
      sx={{
        '& > svg > circle:first-child': {
          stroke: 'var(--chakra-colors-gray-200) !important',
        },
      }}
    >
      <CircularProgressLabel fontSize="16px" fontWeight="medium">
        {progress.toFixed(1)}%
      </CircularProgressLabel>
    </CircularProgress>
  );
}

const SubscriptionRPUUsageRenderer = {
  [PlansIds.TRIAL]: PieChartAccountRPUUsage,
  [PlansIds.STARTER]: MonthlyRelativeRPUUsage,
  [PlansIds.STARTER_ANNUAL]: PieChartAccountRPUUsage,
  [PlansIds.PROFESSIONAL_PAYG]: MonthlyRelativeRPUUsage,
  [PlansIds.PROFESSIONAL_ANNUAL]: PieChartAccountRPUUsage,
  [PlansIds.ENTERPRISE]: PieChartAccountRPUUsage,
  [PlansIds.BASE_2025]: MonthlyRelativeRPUUsage,
  [PlansIds.PROFESSIONAL_2025]: PieChartAccountRPUUsage,
  [PlansIds.PRO_PLUS_2025]: PieChartAccountRPUUsage,
  [PlansIds.ENTERPRISE_2025]: PieChartAccountRPUUsage,
};

export function AccountRPUUsage({ rpuUsage, isLoading }) {
  const { isAccountInTrial, plan } = useCore();
  const planType = isAccountInTrial ? Plans.TRIAL : plan;
  const Component = SubscriptionRPUUsageRenderer[planType];
  return Component ? (
    <Component rpuUsage={rpuUsage} isLoading={isLoading} />
  ) : null;
}
