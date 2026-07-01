import { Flex, Icon, Text, UpgradeLabel } from 'components';
import RiveryButton from 'components/Buttons/RiveryButton';
import LimitedAccountModal from 'components/RiveryModal/LimitedAcountModal';
import { useToggle } from 'react-use';
import { QualityTestsIcon } from '../icons';
import { PlanUpgradeRenderer } from '../PlanUpgradeRenderer';
import { PlansIds } from 'api/types';
import { useCore } from 'store/core';

export function QualityTestRiverButton() {
  const [showUpgradeModal, toggleUpgradeModal] = useToggle(false);
  const { plan } = useCore(); // TODO remove legacy pricing, can only be base

  return (
    <PlanUpgradeRenderer>
      <RiveryButton
        variant="default"
        size="small"
        aria-label="quality tests for data flow"
        onClick={() => toggleUpgradeModal(true)}
        leftIcon={<Icon as={QualityTestsIcon} boxSize="5" />}
        label={
          <Flex alignItems="baseline" color="font" fontWeight="normal">
            <Text px={1}>Quality Tests</Text>
            <UpgradeLabel color="default" />
          </Flex>
        }
      />

      <LimitedAccountModal
        show={showUpgradeModal}
        toggle={toggleUpgradeModal}
        title="Upgrade your plan to unlock this feature"
        saveLabelText="Upgrade"
      >
        <>
          <div>
            Quality Tests are not included in your{' '}
            {plan === PlansIds.BASE_2025 ? 'base' : 'starter'} plan.
          </div>
          <div>Contact us to upgrade your plan.</div>
        </>
      </LimitedAccountModal>
    </PlanUpgradeRenderer>
  );
}
