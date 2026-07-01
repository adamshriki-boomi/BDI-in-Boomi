import { BillingTypes } from 'api/types/billing.types';
import { Divider, Flex, RenderGuard } from 'components';
import { useCore } from 'store/core';
import { useIsBoomiAccountWithSubscriptionInfo } from './helpers';
import { AccountRPUUsage } from './RPUUsage';
import { AccountSubscriptionPeriod } from './SubscriptionPeriod';

export const BottomSection = ({ rpuUsage, isLoading }) => {
  const { billingType, isAccountInTrial } = useCore();
  const isBoomiAccountWithSubscriptionInfo =
    useIsBoomiAccountWithSubscriptionInfo();

  return (
    <Flex
      flex={1}
      gap={6}
      alignItems="stretch"
      aria-label="Consumption-bottom-section"
    >
      <RenderGuard
        condition={isBoomiAccountWithSubscriptionInfo || isAccountInTrial}
      >
        <Flex>
          <AccountSubscriptionPeriod />
        </Flex>
      </RenderGuard>
      {billingType === BillingTypes.ON_DEMAND && !isAccountInTrial ? (
        <Divider h="full" w="1px" bg="gray.300" orientation="vertical" />
      ) : null}
      <Flex
        flex={billingType === BillingTypes.ANNUAL || isAccountInTrial ? 2 : 7}
      >
        <AccountRPUUsage rpuUsage={rpuUsage} isLoading={isLoading} />
      </Flex>
    </Flex>
  );
};
