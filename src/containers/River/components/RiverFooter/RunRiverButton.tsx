import { ConfirmationModal, useDisclosure } from 'components';
import RiveryButton from 'components/Buttons/RiveryButton';
import { CANCEL_RUN_MESSAGE } from 'containers/Activities/[id]/components/CancelRunButton';
import { FeatureEnabler } from 'modules/FeatureEnabler/FeatureEnabler';
import React, { useEffect } from 'react';
import { MdPlayArrow } from 'react-icons/md';
import { useHistory, useLocation } from 'react-router-dom';
import { useEffectOnce } from 'react-use';
import { useRiver } from 'store/river';
import { useRunPoller } from './useRunPoller';

export function RunRiverButton({ onRun, disabled, disableSave }) {
  const { isRiverValid, selectedRiverName, isPending } = useRiver();
  const { isLoading, runRiver, cancel, loadingCancel } = useRunPoller(true);
  const history = useHistory();
  const isAutoRun = useLocation()?.state?.['autoRun'];
  useEffectOnce(() => {
    if (isAutoRun) {
      runRiver(onRun).then(() => history.replace(undefined));
    }
  });
  const { isOpen, onClose, onOpen } = useDisclosure();

  useEffect(() => {
    if (isLoading || isAutoRun) {
      disableSave(true);
    }
  }, [disableSave, isAutoRun, isLoading]);

  return isLoading || isAutoRun ? (
    <>
      <RiveryButton
        label="Cancel Run"
        variant="outlined-primary"
        colorScheme="danger"
        onClick={onOpen}
        disabled={false}
        isLoading={loadingCancel}
      />
      <ConfirmationModal
        title={`Cancel ${selectedRiverName} run?`}
        description={CANCEL_RUN_MESSAGE}
        ariaLabel="cancel run modal"
        confirmLabel="Cancel Run"
        cancelLabel="Close"
        onConfirm={cancel}
        onClose={onClose}
        show={isOpen}
      />
    </>
  ) : (
    <FeatureEnabler>
      <RiveryButton
        label="Run"
        onClick={() => {
          runRiver(onRun);
        }}
        disabled={disabled || !isRiverValid}
        leftIcon={<MdPlayArrow size={16} />}
        variant="primary"
        isLoading={isPending}
      />
    </FeatureEnabler>
  );
}
