import { ConfirmationModal, Flex, HStack, Text } from 'components';
import { ExtendTrialRequest } from 'components/RiveryModal/ExtendTrialRequest';
import LimitedAccountModal from 'components/RiveryModal/LimitedAcountModal';
import React, { useState } from 'react';
import { useToggle } from 'react-use';
import { useCore } from 'store/core';
const AWS_CONSOLE = 'https://aws.amazon.com/marketplace';
export function AWSBlocked() {
  const [showModal, setShowModal] = useState(true);
  return (
    <ConfirmationModal
      show={showModal}
      title="Your account is blocked"
      description="Please make sure your AWS account is configured correctly or contact Boomi support"
      onConfirm={() => {
        window.open(AWS_CONSOLE, '_blank');
        setShowModal(false);
      }}
      onClose={() => setShowModal(false)}
      confirmLabel="Go to AWS Marketplace"
      cancelLabel="Dismiss"
      variant="error"
    />
  );
}

function TrialEndedBody({ hasTrialDays }) {
  return (
    <HStack gap={4}>
      <Flex flexDirection="column">
        {hasTrialDays ? (
          <Text>You have used all your trials free credits,</Text>
        ) : null}
        <HStack>
          {hasTrialDays ? <Text fontWeight="medium">But</Text> : null}
          <Text
            fontWeight="medium"
            marginInlineStart={hasTrialDays ? '4px!important' : null}
          >
            No Worries!
          </Text>
        </HStack>
        <Text>
          If you enjoyed using our platform for the past few weeks, we’d love to
          keep you as a customer and offer you our great subscription plans.
        </Text>
        <Text>Are you ready to keep the fun going?</Text>
      </Flex>
    </HStack>
  );
}

export function TrialEndedModal() {
  //Set up for new modals
  const { daysTrial, isAccountInTrial, accountBlockedByReason } = useCore();
  const [showAskExtendTrial, toggleAskExtendTrial] = useToggle(false);

  const hasTrialDays = daysTrial >= 0;

  if (accountBlockedByReason || !isAccountInTrial || hasTrialDays) {
    return null;
  }
  return (
    <>
      <LimitedAccountModal
        dismissLabelText="Request Extend Trial"
        saveLabelText="Subscribe Now"
        onExtendForm={() => toggleAskExtendTrial(true)}
        title={
          hasTrialDays
            ? 'Oh No... No more free credits (BDU) left'
            : 'Oh No... Your Free Trial Is Over'
        }
        body={<TrialEndedBody hasTrialDays={hasTrialDays} />}
      />
      <ExtendTrialRequest
        showModal={showAskExtendTrial}
        closeModal={toggleAskExtendTrial}
      />
    </>
  );
}
