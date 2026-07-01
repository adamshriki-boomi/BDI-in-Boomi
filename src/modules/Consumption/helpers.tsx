import { Center } from '@chakra-ui/react';
import { get } from 'api/api.proxy';
import { Plans } from 'api/types';
import { BillingTypes } from 'api/types/billing.types';
import { ExternalLink, Flex, Icon, RiveryInfoTooltip, Text } from 'components';
import NoData from 'components/Icons/components/NoData';
import { useGetIsAccountThatIsManagedByBoomi } from 'containers/Settings/Users/users.helpers';
import {
  differenceInCalendarMonths,
  endOfMonth,
  startOfMonth,
  subMonths,
} from 'date-fns';
import { useToastComponent } from 'hooks/useToast';
import { planConf, planConf2025 } from 'modules/Billing/Plans';
import { useEffect, useState } from 'react';
import { useAsyncFn, useEffectOnce } from 'react-use';
import { useCore } from 'store/core/hooks';
import { isProdDomain } from 'utils/utils';

export function createYearlyStepper(startDate, today) {
  const diff = Math.abs(differenceInCalendarMonths(startDate, today));
  const months = [];
  for (let m = 0; m < 12; m++) {
    let color;
    if (m === diff) {
      color = 'purple.50';
    }
    if (m < diff) {
      color = 'purple.400';
    }
    if (m > diff) {
      color = 'gray.200';
    }
    months.push(color);
  }
  return months;
}

export const TooltipBDU = ({ iconStyle = null, buttonProps = null }) => (
  <RiveryInfoTooltip
    iconStyle={iconStyle}
    buttonProps={buttonProps}
    ariaLabel="RPU Help"
    description={
      <Flex flexDir="column" pl={1} pr={3} py={1} gap={1}>
        <Text fontWeight="medium">Boomi Data Unit Credit</Text>
        <Flex flexDir="column">
          <Text>
            BDU credits (also known as Rivery Pricing Unit / RPU credits) are
            charged based on platform usage, allowing you to scale cost
            effectively. Listed price is for monthly billing, unlock additional
            savings on annual billing.
          </Text>
        </Flex>
        <ExternalLink
          url="https://help.boomi.com/docs/Atomsphere/Data_Integration/GettingStarted/pricing-faqs"
          label="Learn more about our plans"
          color="font-inverse"
        />
      </Flex>
    }
  />
);

export const useCheckDevVPN = errorMsg => {
  const { error } = useToastComponent();
  const isProd = isProdDomain();
  useEffect(() => {
    if (errorMsg && !isProd)
      error({ description: 'Please connect to the AWS VPN' });
  }, [errorMsg, isProd, error]);
};

const descriptionHeader = {
  [Plans.STARTER]: (
    <Text>
      For small BI and data teams with basic needs and ETL functionality.
    </Text>
  ),
  [Plans.PROFESSIONAL]: (
    <Flex flexDir="column">
      <Text>For advanced data teams with engineering capabilities.</Text>
      Perfect for companies looking to scale.
    </Flex>
  ),
  [Plans.ENTERPRISE]: (
    <Flex flexDir="column">
      <Text>For large enterprises working across teams and regions, </Text>
      that need unlimited scale and extensive security.
    </Flex>
  ),
  [Plans.BASE_2025]: (
    <Text>
      For small BI and data teams with basic needs and ETL functionality.
    </Text>
  ),
  [Plans.PROFESSIONAL_2025]: (
    <Flex flexDir="column">
      <Text>For advanced data teams with engineering capabilities.</Text>
      Perfect for companies looking to scale.
    </Flex>
  ),
  [Plans.PRO_PLUS_2025]: (
    <Flex flexDir="column">
      <Text>For advanced data teams with engineering capabilities.</Text>
      Perfect for companies looking to scale.
    </Flex>
  ),
  [Plans.ENTERPRISE_2025]: (
    <Flex flexDir="column">
      <Text>For large enterprises working across teams and regions, </Text>
      that need unlimited scale and extensive security.
    </Flex>
  ),
};

export function ProfessionalDescription() {
  return (
    <Flex flexDir="column" gap={6} color="font">
      <Flex flexDir="column">
        <Text>For advanced data teams with engineering capabilities.</Text>
        Perfect for companies looking to scale.
      </Flex>
      <Flex flexDir="column" textStyle="R7" color="font-secondary" gap={1}>
        <Text textStyle="M7">Everything in Starter, plus:</Text>
        <Text>Three Environments</Text>
        <Text>Role Based Access Control </Text>
        <Text>Run Python Code Data</Text>
        <Text>Quality & Testing (coming soon)</Text>
      </Flex>
    </Flex>
  );
}

export function Professional2025Description() {
  return (
    <Flex flexDir="column" gap={6} color="font">
      <Flex flexDir="column">
        <Text>For advanced data teams with engineering capabilities.</Text>
        Perfect for companies looking to scale.
      </Flex>
      <Flex flexDir="column" textStyle="R7" color="font-secondary" gap={1}>
        <Text textStyle="M7" color="font">
          Everything in Base, plus:
        </Text>
        <Text>Two Environments</Text>
        <Text>Role Based Access Control </Text>
        <Text>Run Python Code Data</Text>
        <Text>Quality & Testing (coming soon)</Text>
      </Flex>
    </Flex>
  );
}

export function ProfessionalPro2025Description() {
  return (
    <Flex flexDir="column" gap={6} color="font">
      <Flex flexDir="column">
        <Text>For advanced data teams with engineering capabilities.</Text>
        Perfect for companies looking to scale.
      </Flex>
      <Flex flexDir="column" textStyle="R7" color="font-secondary" gap={1}>
        <Text textStyle="M7" color="font">
          Everything in Professional, plus:
        </Text>
        <Text>Three Environments</Text>
        <Text>Role Based Access Control </Text>
        <Text>Run Python Code Data</Text>
        <Text>Quality & Testing (coming soon)</Text>
      </Flex>
    </Flex>
  );
}

export function PlanBenefits({ plan }) {
  const isEnterprise = plan === Plans.ENTERPRISE;
  return (
    <Flex flexDir="column" gap={4} color="font">
      {descriptionHeader[plan]}
      <Flex flexDir="column" gap={1}>
        <Text textStyle="M7" color="font">
          {isEnterprise
            ? 'Custom Plan Options Tailored To Your Needs:'
            : 'Plan Benefits:'}
        </Text>
        {planConf[plan]?.featuresList.map((benefit, idx) => (
          <Text color="font-secondary" key={idx}>
            {benefit}
          </Text>
        ))}
        {planConf2025[plan]?.featuresList.map((benefit, idx) => (
          <Text color="font-secondary" key={idx}>
            {benefit}
          </Text>
        ))}
      </Flex>
    </Flex>
  );
}

function getCustomRpuUsage(start, end) {
  return get(
    `/dashboard/totals?timeRange=custom&startDate=${start.getTime()}&endDate=${end.getTime()}`,
  );
}

function getPresetRpuUsage(timeRange) {
  return get(`/dashboard/totals?timeRange=${timeRange}`);
}

export const useGetRpuMonthlyUsage = () => {
  const { billingType } = useCore();
  const [rpuUsage, setMonthlyRpuUsage] = useState({
    current: null,
    previous: null,
    before: null,
  });
  const [{ loading }, getUsage] = useAsyncFn(async () => {
    const today = new Date();
    const twoMAgo = subMonths(today, 2);
    try {
      const currentMonth = await getPresetRpuUsage('this_month');
      const current = currentMonth?.data?.total_units;
      const previousMonth = await getPresetRpuUsage('last_month');
      const previous = previousMonth?.data?.total_units;
      const twoMonthsAgo = await getCustomRpuUsage(
        startOfMonth(twoMAgo),
        endOfMonth(twoMAgo),
      );
      const before = twoMonthsAgo?.data?.total_units;
      setMonthlyRpuUsage({ current, previous, before });
    } catch {
      setMonthlyRpuUsage({ current: 0, previous: 0, before: 0 });
    }
  }, []);

  useEffectOnce(() => {
    if (billingType === BillingTypes.ON_DEMAND) {
      getUsage();
    }
  });

  return { rpuUsage, loading };
};

export const useGetRpuUsageAnnualPlan = () => {
  const {
    subscriptionMetadata,
    activatedAt,
    isAccountInTrial,
    registrationDate,
    refreshToken,
    billingType,
  } = useCore();
  const { error } = useToastComponent();
  const [value, setValue] = useState(null);
  const [{ loading }, getUsage] = useAsyncFn(async () => {
    try {
      const today = new Date();
      const startDate = isAccountInTrial
        ? new Date(registrationDate)
        : new Date(subscriptionMetadata?.start) ?? new Date(activatedAt);
      const data = await getCustomRpuUsage(startDate, today);
      setValue(data?.data?.total_units);
    } catch {
      error({ description: 'Unable to retrieve accounts RPU usage' });
    }
  }, [refreshToken]);

  useEffectOnce(() => {
    if (billingType === BillingTypes.ANNUAL || isAccountInTrial) {
      getUsage();
    }
  });
  return { value, loading };
};

export const useIsUsageExceeded = () => {
  const { totalAcquiredRPU } = useCore();
  const { value: usage }: any = useGetRpuUsageAnnualPlan();
  const remainingRpus = totalAcquiredRPU - usage;

  const isRunningLow = (usage / totalAcquiredRPU) * 100 > 85;
  return {
    over: totalAcquiredRPU > 0 && usage > totalAcquiredRPU,
    warning: totalAcquiredRPU > 0 && isRunningLow,
    remainingRpus,
  };
};

export function NoDataVisual() {
  return (
    <Center color="font-secondary" h="full" w="full" flexDir="column" gap={1}>
      <Icon as={NoData} boxSize={10} />
      <Text textStyle="R7">No Data</Text>
    </Center>
  );
}

export const useIsBoomiAccountWithSubscriptionInfo = () => {
  const { subscriptionMetadata } = useCore();
  const isManagedByBoomi = useGetIsAccountThatIsManagedByBoomi();
  if (!isManagedByBoomi) return true;

  return (
    Boolean(subscriptionMetadata?.start) &&
    Boolean(subscriptionMetadata?.end) &&
    Boolean(subscriptionMetadata?.accountId)
  );
};
