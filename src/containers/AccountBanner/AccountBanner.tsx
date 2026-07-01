import { AccountTypes, PlansIds } from 'api/types';
import { TopBarContext } from 'app/AppTopBarContext';
import {
  Box,
  Center,
  CloseIcon,
  Flex,
  Icon,
  IconButton,
  RenderGuard,
  RiveryButton,
  Text,
} from 'components';
import { TrialMessage } from 'containers/AppNavbar/TrialMessage';
import { StarterLimitationsModal } from 'containers/Billing/AccountLimitations/StarterLimitationsModal';
import { BaseLimitationsModal } from 'containers/Billing/AccountLimitations/BaseLimitationsModal';
import { useContactSales } from 'hooks/useContactSales';
import { useChargebeeModal } from 'modules/Billing/Chargebee';
import { OpenSupport } from 'modules/ModalForm/OpenSupport';
import { useContext } from 'react';
import { useToggle } from 'react-use';
import { useCore } from 'store/core';
import { Link } from 'react-router-dom';

export default function AccountBanner({ state, sideBarWidth = null }) {
  const { partner, accountBlockedByReason } = useCore();

  const { textColor, bgColor, borderColor, text, action } = state;
  const { show: isVisible, setShowPanel: setVisible } =
    useContext(TopBarContext);
  const bannerType = accountBlockedByReason
    ? AccountTypes.BLOCKED
    : AccountTypes.TRIAL;

  const [dismissTemp, setDismissTemp] = useToggle(false);
  if (!isVisible || dismissTemp) {
    return null;
  }
  return (
    <Flex
      h="45px"
      w={`calc(100vw - ${sideBarWidth})`}
      alignItems="center"
      role="banner"
      aria-label={`${bannerType}-account-banner`}
      zIndex={3}
    >
      <Flex
        w="full"
        h="full"
        alignItems="center"
        px={4}
        gap={2}
        bg={bgColor}
        borderBottom="1px solid"
        borderBottomColor={borderColor}
      >
        <Center w="full">
          <Text color={textColor}>{text}</Text>
          {partner !== 'aws' && action && (
            <Box pl={1}>
              <ActionButton action={action} color={textColor} />
            </Box>
          )}
        </Center>
        <RenderGuard condition={!textColor.includes('red')}>
          <IconButton
            ml="auto"
            icon={<Icon as={CloseIcon} boxSize={4} />}
            aria-label="close-banner"
            bg="transparent"
            _hover={{ bg: 'transparent' }}
            _focus={{ boxShadow: 'none' }}
            _active={{ boxShadow: 'none' }}
            onClick={() => {
              setDismissTemp(true);
              setVisible(false);
            }}
          />
        </RenderGuard>
      </Flex>
    </Flex>
  );
}

function ActionButton({ action, color }) {
  const { plan, activeAccountId, envId } = useCore();
  const [showPricingModal, togglePricingModal] = useToggle(false);
  const [showStarterModal, toggleStarterModal] = useToggle(false); // TODO remove legacy pricing
  const [showBaseModal, toggleBaseModal] = useToggle(false);
  const { onManage } = useChargebeeModal({ plan, isManage: true });
  switch (action) {
    case 'subscribe':
      return (
        <ContactOrUpgrade
          color={color}
          contactLabel="Talk to a Solution Advisor"
          showPricingModal={showPricingModal}
          togglePricingModal={togglePricingModal}
        />
      );
    case 'contact':
      return (
        <ContactOrUpgrade
          color={color}
          contactLabel="Contact Us"
          showPricingModal={showPricingModal}
          togglePricingModal={togglePricingModal}
        />
      );
    case 'show': {
      const isBasePlan = plan === PlansIds.BASE_2025;
      if (isBasePlan) {
        return (
          <>
            <RiveryButton
              onClick={toggleBaseModal}
              label="Show More"
              size="sm"
            />
            <BaseLimitationsModal
              showModal={showBaseModal}
              toggleModal={toggleBaseModal}
            />
          </>
        );
      }
      return (
        // TODO remove legacy pricing
        <>
          <RiveryButton
            onClick={toggleStarterModal}
            label="Show More"
            size="sm"
          />
          <StarterLimitationsModal
            showModal={showStarterModal}
            toggleModal={toggleStarterModal}
          />
        </>
      );
    }
    case 'manage': {
      return (
        <RiveryButton
          onClick={onManage}
          label="Manage Billing Information"
          size="small"
        />
      );
    }
    case 'support': {
      return (
        <OpenSupport variant="primary" size="small" label="Contact Us" pl={3} />
      );
    }
    case 'set_notification': {
      return (
        <RiveryButton
          to={`/settings/${activeAccountId}/${envId}/notifications`}
          as={Link}
          label="here"
          variant="link"
        />
      );
    }
    default:
      return (
        <>
          <RiveryButton
            onClick={togglePricingModal}
            label="Subscribe Now"
            size="small"
          />
          <TrialMessage
            togglePricingModal={togglePricingModal}
            showPricingModal={showPricingModal}
          />
        </>
      );
  }
}

function ContactOrUpgrade({
  contactLabel,
  color,
  togglePricingModal,
  showPricingModal,
}) {
  const scheduleMeeting = useContactSales();
  const { accountType } = useCore();
  return (
    <Flex gap={1} alignItems="center" color={color}>
      <RiveryButton
        label={contactLabel}
        variant={accountType === AccountTypes.TRIAL ? 'link' : 'primary'}
        onClick={scheduleMeeting}
        size={accountType === AccountTypes.TRIAL ? 'base' : 'small'}
      />
      <RenderGuard condition={accountType === AccountTypes.TRIAL}>
        or
        <RiveryButton
          onClick={togglePricingModal}
          label="Upgrade Now"
          size="small"
        />
        <TrialMessage
          togglePricingModal={togglePricingModal}
          showPricingModal={showPricingModal}
        />
      </RenderGuard>
    </Flex>
  );
}
