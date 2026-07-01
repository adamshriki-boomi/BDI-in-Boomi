import { Storage } from 'api/storage';
import { PlansIds } from 'api/types';
import { useGetTokensQuery } from 'containers/Settings/Tokens/tokens.query';
import { useEffect } from 'react';
import { useToggle } from 'react-use';
import { useCore } from 'store/core';
import { useSelectedEnvironment } from 'store/environments/hooks/useGetEnvironment';

// TODO remove legacy pricing (whole page)
export function useStarterLimitations(banner = false) {
  const hasSeen =
    Storage.getData(Storage.Keys.STARTER_LIMITATIONS_KEY) && !banner;
  const [showStarterLimitations, setShowLimitations] = useToggle(false);
  const {
    starterPlanLimitations,
    plan,
    accountSettings: { max_allowed_environments },
  } = useCore();
  const { environmentsLength } = useSelectedEnvironment();
  const isStarter = [PlansIds.STARTER, PlansIds.STARTER_ANNUAL].includes(plan);
  const { data: tokens } = useGetTokensQuery(null, {
    skip: !isStarter || !starterPlanLimitations.inGracePeriod,
  });
  useEffect(() => {
    if (Boolean(environmentsLength)) {
      setShowLimitations(
        starterPlanLimitations.inGracePeriod &&
          isStarter &&
          (environmentsLength > max_allowed_environments ||
            Boolean(tokens?.length)) &&
          !hasSeen,
      );
    }
  }, [
    environmentsLength,
    hasSeen,
    isStarter,
    max_allowed_environments,
    setShowLimitations,
    starterPlanLimitations.inGracePeriod,
    tokens,
  ]);
  return { showStarterLimitations, tokens };
}
