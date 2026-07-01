import { Partner, Plans } from 'api/types';
import {
  Background,
  Box,
  ConfirmationModal,
  Flex,
  GridBox,
  Icon,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
} from 'components';
import RiveryButton, { CloseIconButton } from 'components/Buttons/RiveryButton';
import React, { ReactElement } from 'react';
import { useAccount, useCore } from 'store/core';
import './Billing.scss';
import { VIcon } from './icons';
import { planConf2025 } from './Plans';
import { BillingTypes } from 'api/types/billing.types';
import { useGetIsAccountThatIsManagedByBoomi } from 'containers/Settings/Users/users.helpers';

const MostPopularLabel = () => (
  <Flex
    position="absolute"
    top="-15px"
    left="50%"
    transform="translateX(-50%)"
    bg="background-action-tertiary-hover"
    borderRadius="10px"
    px="4"
    py="2"
    color="font-link"
    border="2px solid"
    borderColor="background-selected"
    textStyle="M7"
  >
    Most Popular
  </Flex>
);

type PricingBoxProps = {
  plan?: string;
  planId?: string;
  color?: string;
  description: ReactElement;
  priceComponent?: any;
  featuresTitle: string;
  featuresList: string[];
  btnVariant?: string;
  btnLabel: string;
  isMostPopular?: boolean;
  selectPlan: (string) => void;
};

export function PricingPlans({
  showPricingModal,
  togglePricingModal,
  onClose = null,
  partner,
}) {
  function selectPlan(plan) {
    togglePricingModal();
    onClose(plan);
  }

  const websitePricingPage = 'https://rivery.io/pricing/';
  return partner === Partner.AWS ? (
    <ConfirmationModal
      title="Pricing Plans"
      description="This Account is managed by AWS Marketplace"
      onConfirm={() => null}
      variant="error"
    />
  ) : (
    <Modal
      isOpen={showPricingModal}
      onClose={togglePricingModal}
      size="xxl"
      isCentered
      aria-label="pricing plans modal"
    >
      <ModalOverlay bg="border-contrast" opacity="0.5!important" />
      <ModalContent
        boxShadow="0px 12px 32px 0px rgba(0, 0, 0, 0.10)"
        mx="10"
        maxW="1280px"
        p="13"
        position="relative"
        overflow="hidden"
      >
        <Icon
          as={Background}
          w="978px"
          h="689px"
          position="absolute"
          right="-20rem"
          top="-28rem"
          transform="scaleX(-1)"
          opacity="0.75"
        />
        <Icon
          as={Background}
          w="978px"
          h="689px"
          position="absolute"
          left="-20rem"
          bottom="-30rem"
          opacity="0.75"
        />
        <CloseIconButton
          onClick={togglePricingModal}
          aria-label="close"
          position="absolute"
          p={0}
          right={4}
          top={4}
        />
        <ModalHeader textAlign="center" pb="0" borderBottom="unset">
          <Text textStyle="B2" color="font">
            Meet Our Pricing Plans
          </Text>
          <Text textStyle="R5" color="font-secondary">
            More capabilities to deliver your data faster at a lower TCO.
          </Text>
        </ModalHeader>
        <ModalBody px="12" pb={'0!important'}>
          <Box px={3} position="relative">
            <GridBox gap={4} templateColumns="repeat(4, 1fr)">
              {Object.entries(planConf2025).map(([key, plan]) => {
                return (
                  <PricingBox
                    key={key}
                    plan={key}
                    {...plan}
                    planId={plan.plan_types as string}
                    priceComponent={plan?.priceComponent}
                    selectPlan={selectPlan}
                  />
                );
              })}
            </GridBox>
          </Box>
        </ModalBody>
        <ModalFooter
          justifyContent="center"
          position="relative"
          borderTop="none"
        >
          <RiveryButton
            variant="link"
            target="_blank"
            href={websitePricingPage}
            label="Click for plan details and cost estimation calculator"
          />
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

function PricingBox({
  plan,
  planId,
  description,
  isMostPopular = false,
  priceComponent,
  featuresTitle,
  featuresList,
  btnLabel,
  btnVariant = null,
  selectPlan,
  color,
}: PricingBoxProps) {
  const { isAccountInTrial, billingType } = useCore();
  const { isSettingOn } = useAccount();
  const boomiAccount = useGetIsAccountThatIsManagedByBoomi();
  const allowDowngrade =
    billingType === BillingTypes.ANNUAL &&
    isSettingOn('allow_subscriptions_to_payg');
  const buttonLabel =
    // user can upgrade by himself only to base and only when in trial, otherwise talk to support
    (isAccountInTrial || allowDowngrade) &&
    plan === Plans.BASE_2025 &&
    !boomiAccount
      ? 'Subscribe now'
      : 'Talk to sales';
  return (
    <Box
      key={plan}
      border={isMostPopular ? '2px' : '1px'}
      borderColor={color || 'border'}
      borderRadius="10px"
      position="relative"
      bg="white"
      textAlign="center"
      pb={6}
      width="270px"
    >
      {isMostPopular && <MostPopularLabel />}
      <Box bgColor={'background-secondary'} px={4} borderTopRadius={'10px'}>
        <Flex
          flexDir="column"
          gap={3}
          alignItems="stretch"
          pt={7}
          height="170px"
        >
          <Text textStyle="M5" color="font" textAlign="left">
            {plan}
          </Text>
          <div style={{ textAlign: 'left' }}>
            <Text textStyle="R6">{description}</Text>
          </div>
          {priceComponent}
        </Flex>
        <Box pb={5}>
          <RiveryButton
            onClick={() => selectPlan(planId)}
            label={buttonLabel}
            aria-label={`${plan} ${btnLabel}`}
            variant={btnVariant}
            w="full"
          />
        </Box>
      </Box>
      <Box
        textAlign="left"
        borderTop="1px solid"
        borderColor="gray.300"
        paddingTop={4}
        px={4}
      >
        <Text textStyle="M6" mb={2}>
          {featuresTitle}
        </Text>
        {featuresList.map(feature => (
          <Flex lineHeight={2} key={feature} gap={2}>
            <Icon
              color="background-success-strong"
              as={VIcon}
              w={15}
              h={15}
              my={2}
            />
            <Text textStyle="R6">{feature}</Text>
          </Flex>
        ))}
      </Box>
    </Box>
  );
}
