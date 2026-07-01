import { useState } from 'react';
import { useRiverActions } from 'store/river/hooks';
import { getDefaultContent } from 'store/river/utils/steps.builder';

export function useStepUndo() {
  const { setStepProps } = useRiverActions();
  const [oldSteps, setOldSteps] = useState<any>({});
  const handleBlockTypeFn = ({
    oldStepType,
    newStep: { value: block_primary_type, block_type, ...rest },
    content,
    hash,
    blockDBType,
  }) => {
    if (oldStepType?.value !== block_primary_type) {
      const { label, ...newContent } = rest;
      setOldSteps(oldSteps => ({
        ...oldSteps,
        [oldStepType.value]: content,
      }));
      setStepProps({
        hash,
        content: getDefaultContent({
          stepType: block_type || blockDBType,
          block_primary_type,
          content: { ...newContent, ...oldSteps[block_primary_type] },
        }),
      });
    }
  };
  return {
    handleBlockTypeFn,
  };
}
