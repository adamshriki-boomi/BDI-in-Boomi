import RiveryButton from 'components/Buttons/RiveryButton';
import { TrialMessage } from 'containers/AppNavbar/TrialMessage';
import { useCallback } from 'react';
import { useEffectOnce, useToggle } from 'react-use';
import { RiveryModal, RiveryModalProps } from './RiveryChakraModal';

interface LimitedAccountModalProps extends RiveryModalProps {
  saveLabelText: string;
  dismissLabelText?: string;
  externalShow?: boolean;
  onExtendForm?: () => void;
  externalToggle?: any;
}

export default function LimitedAccountModal({
  externalShow = null,
  externalToggle = null,
  saveLabelText,
  onExtendForm = null,
  dismissLabelText = 'Dismiss',
  ...props
}: LimitedAccountModalProps) {
  const [showModal, toggleModal] = useToggle(false);
  const [showPricingModal, togglePricingModal] = useToggle(false);

  const onSubscribe = useCallback(() => {
    togglePricingModal();
    if (externalToggle !== null) {
      externalToggle(false);
      return;
    }
    toggleModal();
  }, [externalToggle, toggleModal, togglePricingModal]);

  useEffectOnce(() => {
    if (externalShow === null) toggleModal();
  });

  return (
    <>
      <RiveryModal
        toggle={externalToggle ? externalToggle : toggleModal}
        show={externalShow ? externalShow : showModal}
        centered
        ariaLabel="limited account modal"
        footer={{
          cancelLabel: dismissLabelText,
          handleOnClose: () => {
            onExtendForm();
            toggleModal();
          },
          saveLabel: (
            <RiveryButton
              size="small"
              label={saveLabelText}
              variant="primary"
              onClick={onSubscribe}
            />
          ),
        }}
        {...props}
      />
      <TrialMessage
        togglePricingModal={togglePricingModal}
        showPricingModal={showPricingModal}
      />
    </>
  );
}
