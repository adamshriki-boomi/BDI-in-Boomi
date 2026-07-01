import { useEnableEdit } from 'hooks/useEnableEdit';
import { useToastComponent } from 'hooks/useToast';
import { useRiverValidator } from 'modules';
import { useCallback } from 'react';
import { useToggle } from 'react-use';
import { useRiver, useRiverActions } from 'store/river';
import { useRunRiver } from './useRunRiver';
import { isDraft, useSaveRiver } from './useSaveRiver';

export const useRiverDraft = () => {
  const { validate } = useRiverValidator();
  const { error, success } = useToastComponent();
  const { selectedRiver } = useRiver();
  const { updateErrors } = useRiverActions();

  const { isErrorDisplayed, showErrorModal, closeErrorModal } = useErrorModal();
  const { enableEdit } = useEnableEdit();

  const showRiverSavedMessage = () => {
    success({ description: 'The data flow was saved successfully' });
  };

  const { save: saveRiver, saving } = useSaveRiver({
    onSaveSuccess: showRiverSavedMessage,
    onError: error,
    onSaveComplete: closeErrorModal,
  });

  const save = useCallback(
    async (forceSave?: boolean, isRun?: boolean) => {
      const { isValid, results } = validate();
      updateErrors(isValid ? {} : results);
      if (forceSave || isValid) {
        return await saveRiver(isValid, isRun);
      }
      if (!isValid) {
        const hasScheduleError = results?.schedule?.['schedule.cronExp'];
        // Show toast for schedule validation errors (and skip modal)
        if (hasScheduleError) {
          error({
            title: 'Schedule Error',
            description: results.schedule['schedule.cronExp'].message,
            duration: 10000,
          });
        } else {
          // Show modal only when there's no schedule error
          showErrorModal();
        }
      }
    },
    [saveRiver, showErrorModal, updateErrors, validate, error],
  );

  const runRiver = useRunRiver({
    onError: error,
  });

  const run = useCallback(async () => {
    const isValid = await save(false, true);
    const isRiverValidToRun = isValid && !isDraft(selectedRiver);
    if (isRiverValidToRun) {
      return await runRiver(selectedRiver.cross_id);
    }
  }, [save, selectedRiver, runRiver]);

  const forceSave = useCallback(async () => {
    await save(true);
  }, [save]);

  return {
    run,
    save,
    saving,
    forceSave,
    disabled: !enableEdit,
    isErrorDisplayed,
    closeErrorModal,
  };
};

const useErrorModal = () => {
  const [isErrorDisplayed, toggleModal] = useToggle(false);
  return {
    isErrorDisplayed,
    closeErrorModal: () => toggleModal(false),
    showErrorModal: () => toggleModal(true),
  };
};
