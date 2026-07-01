import { ONBOARDING_STEPS } from './components/Steps/StepsStaticContent';

export const totalStepsCount = () => {
  const stepsData = Object.values(ONBOARDING_STEPS);
  return stepsData.reduce(
    (acc, { substeps }) => acc + substeps.length,
    0,
  ) as number;
};
export const useOnboardingStepsProgress = onboarding => {
  const stepsData = Object.values(ONBOARDING_STEPS);
  return (
    onboarding &&
    (Object.entries(onboarding)?.reduce((acc: [], [key, step]) => {
      if (step && Boolean(Object.values(step)?.length)) {
        const currentStepData = stepsData.find(({ id }) => id === key);
        if (Object.values(step).length === currentStepData?.substeps?.length) {
          (acc as boolean[]).push(true);
        } else {
          (acc as boolean[]).push(false);
        }
      } else {
        (acc as boolean[]).push(false);
      }
      return acc;
    }, []) as boolean[])
  );
};

export const useCompletedStepsCount = steps => {
  return (
    steps &&
    (Object.values(steps).reduce((acc, value) => {
      if (Boolean(value) && Object.values(value)) {
        return (acc as number) + Object.values(value).length;
      }
      return acc;
    }, 0) as number)
  );
};
