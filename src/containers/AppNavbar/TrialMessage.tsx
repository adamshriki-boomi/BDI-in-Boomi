import { Box } from 'components';
import { ContactModal } from 'modules/Billing/BillingManager/ContactModal';
import { BillingCountry } from 'modules/Billing/BillingManager/CountryModal';
import {
  useGetPlansObject,
  useHandleChoosePlan,
} from 'modules/Billing/BillingManager/helpers';
import { PricingPlans } from 'modules/Billing/PricingPage';
import * as React from 'react';
import { useCore } from 'store/core';

export const getName = (plans, plan) => plans?.[plan]?.name;

export function TrialMessage({
  showPricingModal,
  togglePricingModal,
}: {
  showPricingModal?: boolean;
  togglePricingModal;
}) {
  const { partner } = useCore();

  const plans = useGetPlansObject();

  const {
    plan,
    selectedBillingType: billingType,
    contactModal: { showModalContactUs, toggleModalContactUs },
    countryModal: { showModalSetCountry, toggleModalSetCountry },
    choosePlan,
  } = useHandleChoosePlan();

  return (
    <Box ml={2} alignSelf="center">
      {plans && (
        <PricingPlans
          showPricingModal={showPricingModal}
          togglePricingModal={togglePricingModal}
          onClose={choosePlan}
          partner={partner}
        />
      )}
      <ContactModal
        show={showModalContactUs}
        toggleModalContactUs={toggleModalContactUs}
        plan={getName(plans, plan)}
        billingType={billingType}
      />
      <BillingCountry
        show={showModalSetCountry}
        plan={plan}
        toggleModalSetCountry={toggleModalSetCountry}
      />
    </Box>
  );
}
