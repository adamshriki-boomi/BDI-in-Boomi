import { Plans, PlansIds } from 'api/types';
import {
  PROFESSIONAL_PRICING_UNIT,
  STARTER_PRICING_UNIT,
  BASE_PRICING_UNIT,
} from 'api/types/billing.types';
import { Box, Flex, HStack, RiveryButton, Tag, Text } from 'components';
import { TrialMessage } from 'containers/AppNavbar/TrialMessage';
import { FormTypes, ModalFormWrapper } from 'modules/ModalForm';
import { useToggle } from 'react-use';
import { useCore } from 'store/core';
import {
  PlanBenefits,
  Professional2025Description,
  ProfessionalDescription,
  ProfessionalPro2025Description,
} from './helpers';

const AccountChipsMap = {
  [Plans.TRIAL]: {
    color: 'tagGreen',
    text: 'Free',
    variant: 'contained-green',
  },
  [PlansIds.STARTER]: {
    color: 'tagOrange',
    text: 'On Demand',
    variant: 'yellow',
  },
  [PlansIds.STARTER_ANNUAL]: {
    color: 'tagMagenta',
    text: 'Annual',
    variant: 'magenta',
  },
  [PlansIds.PROFESSIONAL_PAYG]: {
    color: 'tagOrange',
    text: 'On Demand',
    variant: 'yellow',
  },
  [PlansIds.PROFESSIONAL_ANNUAL]: {
    color: 'tagMagenta',
    text: 'Annual',
    variant: 'magenta',
  },
  [PlansIds.ENTERPRISE]: {
    color: 'tagMagenta',
    text: 'Annual',
    variant: 'magenta',
  },
  [PlansIds.BASE_2025]: {
    color: 'tagOrange',
    text: 'On Demand',
    variant: 'yellow',
  },
  [PlansIds.PROFESSIONAL_2025]: {
    color: 'tagMagenta',
    text: 'Annual',
    variant: 'magenta',
  },
  [PlansIds.PRO_PLUS_2025]: {
    color: 'tagMagenta',
    text: 'Annual',
    variant: 'magenta',
  },
  [PlansIds.ENTERPRISE_2025]: {
    color: 'tagMagenta',
    text: 'Annual',
    variant: 'magenta',
  },
};

const AccountDescriptionMap = {
  [PlansIds.TRIAL]: {
    name: Plans.TRIAL,
    description: (
      <Flex flexDir="column" h="full" color="font">
        <Text>
          Enjoy full access to all features during your trial, with free usage
          credits included.
        </Text>
        <Text>No credit card required.</Text>
      </Flex>
    ),
    button: { label: 'Subscribe Now' },
    showPrice: false,
  },
  [PlansIds.STANDARD]: {
    name: Plans.STANDARD,
    description: (
      <Flex flexDir="column" h="full" color="font">
        <Text>
          You are subscribed to <strong>Standard</strong> plan
        </Text>
      </Flex>
    ),
    button: { label: 'Review Plans' },
    showPrice: false,
  },
  [PlansIds.STARTER]: {
    name: Plans.STARTER,
    description: PlanBenefits({ plan: Plans.STARTER }),
    button: { label: 'Upgrade Your Plan' },
    showPrice: STARTER_PRICING_UNIT,
  },
  [PlansIds.STARTER_ANNUAL]: {
    name: Plans.STARTER,
    description: PlanBenefits({ plan: Plans.STARTER }),
    button: { label: 'Upgrade Your Plan' },
    showPrice: false,
  },
  [PlansIds.PROFESSIONAL_PAYG]: {
    name: Plans.PROFESSIONAL,
    description: <ProfessionalDescription />,
    button: { label: 'Upgrade Your Plan' },
    showPrice: PROFESSIONAL_PRICING_UNIT,
  },
  [PlansIds.PROFESSIONAL_ANNUAL]: {
    name: Plans.PROFESSIONAL,
    description: <ProfessionalDescription />,
    button: { label: 'Upgrade Your Plan' },
    showPrice: false,
  },
  [PlansIds.ENTERPRISE]: {
    name: Plans.ENTERPRISE,
    description: PlanBenefits({ plan: Plans.ENTERPRISE }),
    button: { label: 'Contact Us' },
    showPrice: false,
  },
  [PlansIds.BASE_2025]: {
    name: Plans.BASE_2025,
    description: PlanBenefits({ plan: Plans.BASE_2025 }),
    button: { label: 'Upgrade Your Plan' },
    showPrice: BASE_PRICING_UNIT,
  },
  [PlansIds.PROFESSIONAL_2025]: {
    name: Plans.PROFESSIONAL_2025,
    description: <Professional2025Description />,
    button: { label: 'Upgrade Your Plan' },
    showPrice: false,
  },
  [PlansIds.PRO_PLUS_2025]: {
    name: Plans.PRO_PLUS_2025,
    description: <ProfessionalPro2025Description />,
    button: { label: 'Upgrade Your Plan' },
    showPrice: false,
  },
  [PlansIds.ENTERPRISE_2025]: {
    name: Plans.ENTERPRISE_2025,
    description: PlanBenefits({ plan: Plans.ENTERPRISE_2025 }),
    button: { label: 'Contact Us' },
    showPrice: false,
  },
};

export function AccountHeader({ type }) {
  return (
    <Flex position="relative">
      <HStack gap={1} pt={2}>
        <Text textTransform="capitalize" textStyle="M4">
          {AccountDescriptionMap[type]?.name}
        </Text>
        <Tag variant={AccountChipsMap[type]?.variant} role="status">
          {AccountChipsMap[type]?.text}
        </Tag>
      </HStack>
      {AccountDescriptionMap[type]?.showPrice ? (
        <Flex
          alignItems="flex-end"
          flexDir="column"
          position="absolute"
          top={2}
          right={0}
        >
          <Text textStyle="B2">{AccountDescriptionMap[type].showPrice}</Text>
          <Text textStyle="R7">Per BDU Credit</Text>
        </Flex>
      ) : null}
    </Flex>
  );
}

export function AccountDescription({ type }) {
  return AccountDescriptionMap[type].description;
}

export function AccountAction({ type }) {
  const { partner } = useCore();
  const [showPricingModal, togglePricingModal] = useToggle(false);
  const message = 'Hey team, please contact me.';
  const ButtonPricing = ({ label, onClick = null }) => (
    <RiveryButton label={label} variant="primary" onClick={onClick} />
  );
  return (
    <Flex h="full" alignItems="flex-end" flex={1}>
      <Flex w="full" justify="flex-end" pt={4}>
        {partner === 'aws' ||
        AccountDescriptionMap[type].button.label.includes('Contact') ? (
          <ModalFormWrapper
            type={FormTypes.CONTACT}
            title="Talk To Sales"
            message={message}
          >
            <ButtonPricing
              label={
                partner === 'aws'
                  ? 'Contact Us'
                  : AccountDescriptionMap[type].button.label
              }
            />
          </ModalFormWrapper>
        ) : (
          <ButtonPricing
            label={AccountDescriptionMap[type].button.label}
            onClick={togglePricingModal}
          />
        )}
      </Flex>
      <Box w={0}>
        <TrialMessage
          togglePricingModal={togglePricingModal}
          showPricingModal={showPricingModal}
        />
      </Box>
    </Flex>
  );
}
