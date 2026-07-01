import { Plans, PlansIds } from 'api/types';
import { BillingTypes } from 'api/types/billing.types';
import {
  Box,
  Breadcrumbs,
  Flex,
  Grid,
  RiveryButton,
  Text,
  View,
} from 'components';
import { PageOverlaySpinner } from 'components/Loaders/Loader';
import { useGetPlansQuery } from 'modules/Billing';
import { useChargebeeModal } from 'modules/Billing/Chargebee';
import React from 'react';
import { useCore } from 'store/core/hooks';
import { UpsaleBanner } from './AccountUpsaleBanner';
import { BottomSection } from './BottomDetails';
import { useGetRpuMonthlyUsage, useGetRpuUsageAnnualPlan } from './helpers';
import { TopSection } from './TopDetails';

export function ConsumptionManager() {
  const { isAccountInTrial, pendingSignin, plan, billingType, partner } =
    useCore();
  const planType = isAccountInTrial ? Plans.TRIAL : plan;
  const { isLoading } = useGetPlansQuery();
  const { onManage } = useChargebeeModal({ plan, isManage: true });

  const { rpuUsage: monthlyUsage, loading: mLoading } = useGetRpuMonthlyUsage();
  const { value: annualUsage, loading: aLoading } = useGetRpuUsageAnnualPlan();
  const showUpsaleBanner =
    (billingType === BillingTypes.ON_DEMAND &&
      monthlyUsage?.current !== null) ||
    billingType === BillingTypes.ANNUAL;
  return (
    <View p={4} pt={3}>
      {isLoading || pendingSignin ? <PageOverlaySpinner /> : null}
      <Breadcrumbs
        links={[{ label: 'Settings' }, { label: 'Plans & Billing' }]}
      />
      <Flex
        flexDir="column"
        p={2}
        height="calc(100% - 50px)"
        aria-label="Manage Billing"
        gap={2}
        alignContent="start"
      >
        <Box>
          <Text textStyle="M6" color="primary">
            Billing
          </Text>
          <Text textStyle="R7" color="font-secondary">
            Manage your account plan and payment details
          </Text>
        </Box>

        <Grid gap={8} maxW="1000px" templateColumns="1fr 275px">
          <Flex
            flexDir="column"
            gap={8}
            h="full"
            position="relative"
            bg="background-secondary"
            borderRadius={4}
            py={6}
            px={8}
          >
            {partner !== 'aws' &&
            plan !== PlansIds.STANDARD &&
            billingType === BillingTypes.ON_DEMAND &&
            !isAccountInTrial ? (
              <RiveryButton
                position="absolute"
                label="Manage Billing"
                variant="default"
                right={0}
                top="-45px"
                onClick={onManage}
              />
            ) : null}
            <TopSection planType={planType} />
            {plan !== PlansIds.STANDARD ? (
              <BottomSection
                rpuUsage={
                  billingType === BillingTypes.ON_DEMAND
                    ? monthlyUsage
                    : annualUsage
                }
                isLoading={mLoading || aLoading}
              />
            ) : null}
          </Flex>
          {partner !== 'aws' && showUpsaleBanner ? (
            <UpsaleBanner type={planType} rpuUsage={monthlyUsage} />
          ) : null}
        </Grid>
      </Flex>
    </View>
  );
}
