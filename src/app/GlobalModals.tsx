import { Partner, PlansIds } from 'api/types';
import { StarterLimitationsModal } from 'containers/Billing/AccountLimitations/StarterLimitationsModal';
import { AWSBlocked, TrialEndedModal } from 'containers/Billing/BillingModals';
import { useStarterLimitations } from 'hooks/useStarterLimitations';
import React from 'react';
import { useToggle } from 'react-use';
import { useCore } from 'store/core';
import { useBaseLimitations } from '../hooks/useBaseLimitations';
import { BaseLimitationsModal } from '../containers/Billing/AccountLimitations/BaseLimitationsModal';

export function GlobalModals() {
  const { isAccountBlocked, isAccountInTrial, partner, isAdminRole, plan } =
    useCore();
  const [showModal, toggleModal] = useToggle(true);
  const { showStarterLimitations } = useStarterLimitations();
  const { showBaseLimitations } = useBaseLimitations();

  // Show Starter limitations modal for Starter plan (legacy)
  // TODO remove legacy pricing
  if (
    showStarterLimitations &&
    isAdminRole &&
    (plan === PlansIds.STARTER || plan === PlansIds.STARTER_ANNUAL)
  ) {
    return (
      <StarterLimitationsModal
        showModal={showModal}
        toggleModal={toggleModal}
      />
    );
  }

  // Show Base limitations modal for Base plan
  if (showBaseLimitations && isAdminRole && plan === PlansIds.BASE_2025) {
    return (
      <BaseLimitationsModal showModal={showModal} toggleModal={toggleModal} />
    );
  }

  if (isAccountBlocked || isAccountInTrial) {
    return partner === Partner.AWS ? <AWSBlocked /> : <TrialEndedModal />;
  } else {
    return null;
  }
}
