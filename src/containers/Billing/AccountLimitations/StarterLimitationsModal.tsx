import { Storage } from 'api/storage';
import { Modal, ModalOverlay, PageOverlaySpinner } from 'components';
import { TrialMessage } from 'containers/AppNavbar/TrialMessage';
import { FormTypes, ModalForm } from 'modules';
import { useEditEnvironment } from 'modules/Environments/helpers';
import { useCallback } from 'react';
import { useAsyncFn, useToggle } from 'react-use';
import { useCore } from 'store/core';
import { StarterLimitationContent } from './StarterModalContent';

const helpMessage =
  'Hey Team. Please contact me regarding my starter plan limitations';

// TODO remove legacy pricing (whole page)
export function StarterLimitationsModal({
  showModal,
  toggleModal,
  shouldSetInStorage = true,
}) {
  const { selectedAccountId } = useCore();
  const [helpModal, toggleHelpModal] = useToggle(false);
  const [showPricingModal, togglePricingModal] = useToggle(false);
  const { editEnvironment } = useEditEnvironment();
  const [{ loading: isLoading }, setDefaultEnv] = useAsyncFn(async cross_id => {
    await editEnvironment({
      selectedAccountId,
      id: cross_id,
      is_default: true,
    });
  });

  const onDismissModal = useCallback(() => {
    shouldSetInStorage &&
      Storage.store(Storage.Keys.STARTER_LIMITATIONS_KEY, true);
    toggleModal(false);
  }, [shouldSetInStorage, toggleModal]);

  const toggleAndHelp = useCallback(() => {
    toggleHelpModal(true);
    onDismissModal();
  }, [onDismissModal, toggleHelpModal]);

  return (
    <>
      {isLoading ? <PageOverlaySpinner /> : null}
      <Modal isOpen={showModal} onClose={onDismissModal}>
        <ModalOverlay />
        <StarterLimitationContent
          toggleModal={onDismissModal}
          openHelpModal={toggleAndHelp}
          togglePricingModal={togglePricingModal}
          openConfirmationModal={env => {
            setDefaultEnv(env);
            onDismissModal();
          }}
        />
      </Modal>
      <ModalForm
        type={FormTypes.CONTACT}
        show={helpModal}
        toggle={toggleHelpModal}
        title="Contact Us"
        clickData={{ message: helpMessage }}
      />
      <TrialMessage
        togglePricingModal={togglePricingModal}
        showPricingModal={showPricingModal}
      />
    </>
  );
}
