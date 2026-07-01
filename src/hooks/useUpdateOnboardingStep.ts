import {
  useGetUserQuery,
  useUpdateUserOnboardingMutation,
} from 'containers/Settings/Users/usersV1.query';
import { useCallback } from 'react';
import { useCore } from 'store/core';
import { getOId } from 'utils/api.sanitizer';

export const useUpdateOnboardingStep = (mainStep, subStep) => {
  const { selectedAccountId: account_id, userId } = useCore();
  const { data: user } = useGetUserQuery({
    user_id: getOId(userId),
    account_id,
  });
  const [update] = useUpdateUserOnboardingMutation();
  const onboardingStep = user?.onboarding?.[mainStep];
  const isStepCompleted = Boolean(onboardingStep?.[subStep]);

  const updateStep = useCallback(() => {
    if (!isStepCompleted) {
      update({
        account_id,
        user_id: getOId(userId),
        step: {
          step_key: mainStep,
          substep_key: subStep,
        },
      });
    }
  }, [account_id, isStepCompleted, mainStep, subStep, update, userId]);

  return { isStepCompleted, updateStep };
};
