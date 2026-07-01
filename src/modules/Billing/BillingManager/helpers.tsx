import { Plans, PlansIds } from 'api/types';
import { BillingTypes } from 'api/types/billing.types';
import { useChargebeeModal } from 'modules/Billing/Chargebee';
import { useCallback, useState } from 'react';
import { useToggle } from 'react-use';
import { useAccount, useCore } from 'store/core';
import { useGetPlansQuery } from '../store';
import { useGetIsAccountThatIsManagedByBoomi } from 'containers/Settings/Users/users.helpers';

type PlanResultStructure = {
  name?: string;
  billing_type?: BillingTypes;
  _id?: string;
};

export const useGetPlansObject = (): [PlanResultStructure] => {
  const { data } = useGetPlansQuery();
  const plansArray = data?.plans || [];
  const plans = plansArray?.reduce(
    (obj, curr) => ({ ...obj, [curr._id]: curr }),
    {},
  );
  return plans;
};

export const getName = (plans, plan) => plans?.[plan]?.name;
export const useHandleChooseSubscription = ({
  setPlan,
  setBillingType,
  toggleModalSetCountry,
  toggleModalContactUs,
}) => {
  const { onManage } = useChargebeeModal({ isManage: true });
  const {
    isAccountActive,
    isAccountInTrial,
    plan: currentPlan,
    isAccountBlocked,
    billingType: currentBillingType,
  } = useCore();
  const plans = useGetPlansObject();
  const { isSettingOn } = useAccount();
  const boomiAccount = useGetIsAccountThatIsManagedByBoomi();
  const allowDowngrade = isSettingOn('allow_subscriptions_to_payg');
  const displaySubscribe =
    isAccountInTrial || isAccountBlocked || !isAccountActive;
  return useCallback(
    plan => {
      const billingType = plans[plan]?.billing_type;
      if (!plan || !billingType) return;

      const isEnterprisePlan = [
        Plans.ENTERPRISE, // TODO remove legacy pricing
        Plans.ENTERPRISE_2025,
      ].includes(getName(plans, currentPlan));

      const isAllowedDowngrade =
        // annual allowed to subscribe to payg by feature flag
        allowDowngrade && currentBillingType === BillingTypes.ANNUAL;

      const isBaseManagingPlan =
        currentPlan !== PlansIds.BASE_2025
          ? getName(plans, currentPlan) === Plans.BASE_2025
          : true;

      const shouldShowManageSubscription =
        currentPlan &&
        billingType === BillingTypes.ON_DEMAND &&
        isAccountActive &&
        isBaseManagingPlan;

      const shouldShowCountryModal =
        !isEnterprisePlan &&
        displaySubscribe &&
        !boomiAccount &&
        billingType === BillingTypes.ON_DEMAND;

      if (shouldShowManageSubscription) {
        onManage();
      } else if (shouldShowCountryModal || isAllowedDowngrade) {
        setPlan(plan);
        toggleModalSetCountry(true);
      } else {
        setPlan(plan);
        setBillingType(billingType);
        toggleModalContactUs(true);
      }
    },
    [
      plans,
      currentPlan,
      allowDowngrade,
      currentBillingType,
      isAccountActive,
      displaySubscribe,
      boomiAccount,
      onManage,
      setPlan,
      toggleModalSetCountry,
      setBillingType,
      toggleModalContactUs,
    ],
  );
};

export const useHandleChoosePlan = () => {
  const [plan, setPlan] = useState<Plans | undefined>();
  const [selectedBillingType, setBillingType] = useState<
    BillingTypes | undefined
  >();
  const [showModalSetCountry, toggleModalSetCountry] = useToggle(false);
  const [showModalContactUs, toggleModalContactUs] = useToggle(false);

  const choosePlan = useHandleChooseSubscription({
    setPlan,
    setBillingType,
    toggleModalSetCountry,
    toggleModalContactUs,
  });

  return {
    plan,
    selectedBillingType,
    contactModal: { showModalContactUs, toggleModalContactUs },
    countryModal: { showModalSetCountry, toggleModalSetCountry },
    choosePlan,
  };
};
