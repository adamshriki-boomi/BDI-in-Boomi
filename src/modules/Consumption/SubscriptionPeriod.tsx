import { Progress } from '@chakra-ui/react';
import { Plans, PlansIds } from 'api/types';
import {
  ArrowNarrowRight,
  Center,
  Flex,
  HStack,
  Icon,
  RenderGuard,
  Text,
} from 'components';
import { differenceInDays, startOfDay } from 'date-fns';
import { useCore } from 'store/core';
import { displayDate } from 'utils/date.utils';
import { NoDataVisual } from './helpers';

const exoTheme = import.meta.env.VITE_EXO_THEME === 'true';

function calcDaysLeft(start) {
  const today = new Date();
  const startDate = new Date(start);
  const progress = differenceInDays(startOfDay(today), startOfDay(startDate));
  return progress;
}

function PeriodBox({ text, date }) {
  const { isAccountInTrial } = useCore();
  const plan = isAccountInTrial ? Plans.TRIAL : 'plan';
  return (
    <RenderGuard condition={Boolean(date)}>
      <Flex
        minW="140px"
        textAlign="center"
        px={4}
        py={2}
        flexDir="column"
        bg="background"
        color="font"
      >
        <Text textTransform="capitalize">
          {plan} {text} Date
        </Text>

        <Text textStyle="M6">{displayDate(date, 'dd-MMM-yy')}</Text>
      </Flex>
    </RenderGuard>
  );
}

function ProgressBar({ progress }) {
  const { trialEndDate, registrationDate, daysTrial } = useCore();
  const today = new Date();
  const hasTrialDays = trialEndDate > today.getTime() / 1000;
  const maxDays = differenceInDays(
    trialEndDate * 1000,
    registrationDate * 1000,
  );

  return (
    <Flex flexDir="column" w="full" gap={2}>
      {hasTrialDays ? (
        <Text color="background-selected">
          {progress < 0 ? 0 : daysTrial} Days Left
        </Text>
      ) : (
        <Text color="red.200">Your free trial has ended</Text>
      )}

      <Progress
        bg="gray.200"
        min={0}
        max={maxDays}
        borderRadius="15px"
        colorScheme={hasTrialDays ? (exoTheme ? 'blue' : 'purple') : 'red'}
        size="md"
        value={progress}
        sx={{
          '&[aria-valuenow] > p': {
            color: 'primary',
            fontWeight: 'medium',
          },
        }}
      />
    </Flex>
  );
}

function useSubscriptionMonthlySteps() {
  const { subscriptionMetadata } = useCore();
  const today = new Date();
  const startDate = new Date(subscriptionMetadata?.start);
  const endDate = new Date(subscriptionMetadata?.end);
  const maxDays = differenceInDays(endDate, startDate);
  const currentProgress = differenceInDays(today, startDate);
  const component = () => (
    <Progress
      w="100%"
      bg="gray.200"
      min={0}
      max={maxDays}
      borderRadius="15px"
      colorScheme={exoTheme ? 'blue' : 'purple'}
      size="md"
      value={currentProgress}
      sx={{
        '&[aria-valuenow] > p': {
          color: 'background-selected',
          fontWeight: 'medium',
        },
      }}
    />
  );
  return { component };
}

function RangeSubscriptionPeriod({ children }) {
  const {
    subscriptionMetadata,
    isAccountInTrial,
    registrationDate,
    trialEndDate,
  } = useCore();
  const showPeriod = isAccountInTrial
    ? Boolean(registrationDate)
    : Boolean(subscriptionMetadata?.start);
  //TODO - fill up the dates with subscription metadata
  const startDate = isAccountInTrial
    ? registrationDate * 1000
    : subscriptionMetadata?.start;
  const endDate = isAccountInTrial
    ? trialEndDate * 1000
    : subscriptionMetadata?.end;
  return (
    <Flex flexDir="column" gap={2} flex={1}>
      <Text>Subscription Period</Text>
      <Flex
        flexDir="column"
        alignItems="center"
        py={8}
        px={6}
        boxShadow="md"
        bg="white"
        gap={8}
        aria-label="subscription-period"
        flex={1}
        borderRadius={4}
      >
        <RenderGuard condition={showPeriod} fallback={<NoDataVisual />}>
          <HStack aria-label="rpu-consumption-progress">
            <PeriodBox text="Start" date={startDate} />
            <RenderGuard condition={Boolean(endDate)}>
              <Icon color="font" as={ArrowNarrowRight} />
            </RenderGuard>
            <PeriodBox text="End" date={endDate} />
          </HStack>
          {children}
        </RenderGuard>
      </Flex>
    </Flex>
  );
}
function TrialSubscriptionPeriod() {
  const { registrationDate } = useCore();
  const startDate = registrationDate * 1000;
  const progress = calcDaysLeft(startDate);
  return (
    <RangeSubscriptionPeriod>
      <ProgressBar progress={progress} />
    </RangeSubscriptionPeriod>
  );
}

function PaygSubscriptionPeriod() {
  const { subscriptionMetadata } = useCore();
  return (
    <Flex flexDir="column" gap={2} w="160px">
      <Text>Subscription Start Date</Text>
      <Center
        h="full"
        py={8}
        px={6}
        boxShadow="0 0 4px rgb(0 0 0 / 15%)"
        bg="white"
        gap={8}
        aria-label="subscription-start-date"
      >
        <RenderGuard
          condition={Boolean(subscriptionMetadata?.start)}
          fallback={<NoDataVisual />}
        >
          <Text textStyle="M4">
            {displayDate(subscriptionMetadata.start, 'dd-MMM-yy')}
          </Text>
        </RenderGuard>
      </Center>
    </Flex>
  );
}

function AnnualSubscriptionPeriod() {
  const { subscriptionMetadata } = useCore();
  const { component } = useSubscriptionMonthlySteps();
  const SubscriptionMonthlySteps = component;
  return (
    <RangeSubscriptionPeriod>
      <RenderGuard condition={Boolean(subscriptionMetadata.end)}>
        <Flex w="100%" flexDir="column" gap={2}>
          <HStack textStyle="R7" justify="space-between">
            <Text>Plan Progress</Text>
          </HStack>
          <SubscriptionMonthlySteps />
        </Flex>
      </RenderGuard>
    </RangeSubscriptionPeriod>
  );
}

const SubscriptionPeriodRenderer = {
  [PlansIds.TRIAL]: TrialSubscriptionPeriod,
  [PlansIds.STARTER]: PaygSubscriptionPeriod,
  [PlansIds.STARTER_ANNUAL]: AnnualSubscriptionPeriod,
  [PlansIds.PROFESSIONAL_PAYG]: PaygSubscriptionPeriod,
  [PlansIds.PROFESSIONAL_ANNUAL]: AnnualSubscriptionPeriod,
  [PlansIds.ENTERPRISE]: AnnualSubscriptionPeriod,
  [PlansIds.BASE_2025]: PaygSubscriptionPeriod,
  [PlansIds.PROFESSIONAL_2025]: AnnualSubscriptionPeriod,
  [PlansIds.PRO_PLUS_2025]: AnnualSubscriptionPeriod,
  [PlansIds.ENTERPRISE_2025]: AnnualSubscriptionPeriod,
};

export function AccountSubscriptionPeriod() {
  const { isAccountInTrial, plan } = useCore();
  const planType = isAccountInTrial ? Plans.TRIAL : plan;
  const Component = SubscriptionPeriodRenderer[planType];
  return Component ? <Component /> : null;
}
