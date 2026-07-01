import { Plans } from 'api/types';
import { BillingTypes } from 'api/types/billing.types';
import { FormTypes, ModalForm } from 'modules/ModalForm';
import * as React from 'react';

export const ContactModal = ({
  show,
  toggleModalContactUs,
  plan,
  billingType,
}) => {
  const billing =
    plan === Plans.BASE_2025
      ? 'On Demand'
      : billingType && billingType === BillingTypes.ON_DEMAND
      ? 'On Demand'
      : 'Annual';
  const toPlan = plan ? `to the ${billing} ${plan} plan` : '';
  const message = `Hey team, please contact me.\nI would love to get more details and subscribe ${toPlan}.`;
  return (
    <ModalForm
      title="Talk To Sales"
      show={show}
      toggle={toggleModalContactUs}
      type={FormTypes.CONTACT}
      clickData={{
        message,
      }}
    />
  );
};
