import { ContainerRunningTypes } from 'api/types';
import { useCallback, useMemo } from 'react';
import { useRiver, useRiverActions } from 'store/river';

/**
 * expose an api for updating a step's draft in the store
 */
export function useStepActions(hash) {
  const { isVersionMode } = useRiver();
  const { updateStepContent, moveStepToContainer } = useRiverActions();
  const updateContent = useCallback(
    (data: Record<string, any>) => {
      return (
        !isVersionMode &&
        updateStepContent({
          hash,
          ...data,
        })
      );
    },
    [hash, isVersionMode, updateStepContent],
  );
  const moveToContainer = useCallback(
    ({ containerRunning = ContainerRunningTypes.RUN_ONCE }) =>
      !isVersionMode &&
      moveStepToContainer({
        sourceId: hash,
        containerRunning,
      }),
    [hash, isVersionMode, moveStepToContainer],
  );
  return useMemo(
    () => ({ updateContent, moveToContainer }),
    [updateContent, moveToContainer],
  );
}
