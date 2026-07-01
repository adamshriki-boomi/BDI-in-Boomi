import { BlockTypes, ILogicStep } from 'api/types';
import { RoutesBuilder, useAccountRouteBuilder } from 'app/routes';
import { uploadFile } from 'components/Form';
import {
  ONBOARDING_CREATE_LOGIC_RIVER,
  TRANSFORM_AND_ORCHESTRATE,
} from 'containers/Onboarding/consts';
import { useUpdateOnboardingStep } from 'hooks/useUpdateOnboardingStep';
import { useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { useToggle } from 'react-use';
import { store } from 'store';
import { remoteFileApi } from 'store/remoteFiles';
import { isRiverDraft, useRiver, useRiverActions } from 'store/river';
import {
  selectSelectedRiver,
  selectSelectedRiverVariables,
} from 'store/river/river.selectors';
import { findStepsWithFn } from 'store/river/utils/steps.builder';
import { getCrossId } from 'utils/api.sanitizer';

export const isDraft = river => {
  return isRiverDraft(getCrossId(river));
};

const uploadDirtyStepsFiles = async (
  logicSteps: ILogicStep[],
  updateStepContent,
) => {
  const state = store.getState();

  const dirtyFilesSteps = findStepsWithDirtyFiles(logicSteps, state);
  const dirtyFilesUpdates = uploadStepsFiles(
    dirtyFilesSteps,
    state,
    updateStepContent,
  );

  return await Promise.all(dirtyFilesUpdates);
};
const useUrlUpdater = () => {
  const history = useHistory();
  const { createUrl } = useAccountRouteBuilder(RoutesBuilder.river);

  const updateUrl = (riverId: string, state = undefined) => {
    history.replace(createUrl({ river: riverId }), state);
  };
  return { updateUrl };
};

export const useSaveRiver = ({ onSaveSuccess, onError, onSaveComplete }) => {
  const [saving, toggleSaving] = useToggle(false);
  const { updateStep } = useUpdateOnboardingStep(
    TRANSFORM_AND_ORCHESTRATE,
    ONBOARDING_CREATE_LOGIC_RIVER,
  );

  const { selectedLogicSteps, selectedRiver } = useRiver();
  const {
    saveRiver,
    fetchRiverVariables,
    updateStepContent,
    getRiverForVariables,
  } = useRiverActions();

  const { updateUrl } = useUrlUpdater();

  const save = useCallback(
    async (isValid: boolean, isRun: boolean) => {
      toggleSaving(true);
      await uploadDirtyStepsFiles(selectedLogicSteps, updateStepContent);

      const modifiedRiver = selectSelectedRiver(store.getState() as never);
      const selectedVariables = selectSelectedRiverVariables(
        store.getState() as never,
      );

      const response: any = await saveRiver({
        modifiedRiver,
        selectedVariables,
        updateUrl,
      });
      const crossId = getCrossId(response?.payload);
      if (!response?.error) {
        await fetchRiverVariables(crossId);
        await getRiverForVariables(crossId);
        updateStep();
        onSaveSuccess();
      } else {
        toggleSaving(false);
        return onError({
          duration: 15000,
          description:
            response?.error?.msg ||
            response?.error?.message ||
            'Something went wrong. Nothing was done.',
        });
      }
      if (isDraft(selectedRiver)) {
        updateUrl(crossId, { autoRun: Boolean(isRun) });
      }
      toggleSaving(false);
      onSaveComplete();
      return isValid;
    },
    [
      fetchRiverVariables,
      getRiverForVariables,
      onError,
      onSaveComplete,
      onSaveSuccess,
      saveRiver,
      selectedLogicSteps,
      selectedRiver,
      toggleSaving,
      updateStep,
      updateStepContent,
      updateUrl,
    ],
  );
  return { save, saving };
};

function findStepsWithDirtyFiles(steps, state) {
  return findStepsWithFn(steps, step => {
    if (step?.content?.block_primary_type === BlockTypes.PYTHON) {
      if (step.content.file_cross_id) {
        const stat = remoteFileApi.endpoints.getRemoteFileById.select(
          step.content.file_cross_id,
        )(state);
        return stat?.data?.dirty;
      }
    }
    return false;
  });
}

function uploadStepsFiles(steps, state, updateStepContent) {
  return steps.map(({ hash_key_init, content }) => {
    const { file_name, file_cross_id, block_primary_type } = content;
    const stat =
      remoteFileApi.endpoints.getRemoteFileById.select(file_cross_id)(state);
    const file = new File([stat.data.content], file_name, {
      type: 'text/plain',
    });
    return uploadFile(file, block_primary_type).then(result => {
      return updateStepContent({
        hash: hash_key_init,
        file_cross_id: result.file_cross_id,
      });
    });
  });
}
