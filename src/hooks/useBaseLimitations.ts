import { Storage } from 'api/storage';
import { PlansIds } from 'api/types';
import { useGetTokensQuery } from 'containers/Settings/Tokens/tokens.query';
import { useEffect } from 'react';
import { useToggle } from 'react-use';
import { useCore } from 'store/core';
import { useSelectedEnvironment } from 'store/environments/hooks/useGetEnvironment';

export function useBaseLimitations(banner = false) {
  const hasSeen = Storage.getData(Storage.Keys.BASE_LIMITATIONS_KEY) && !banner;
  const [showBaseLimitations, setShowLimitations] = useToggle(false);
  const {
    basePlanLimitations, // Reusing this for Base plan for now
    plan,
    accountSettings: { max_allowed_environments },
  } = useCore();
  const { environmentsLength } = useSelectedEnvironment();
  const isBase = plan === PlansIds.BASE_2025;
  const { data: tokens } = useGetTokensQuery(null, {
    skip: !isBase || !basePlanLimitations.inGracePeriod,
  });
  useEffect(() => {
    if (Boolean(environmentsLength)) {
      setShowLimitations(
        basePlanLimitations.inGracePeriod &&
          isBase &&
          (environmentsLength > max_allowed_environments ||
            Boolean(tokens?.length)) &&
          !hasSeen,
      );
    }
  }, [
    environmentsLength,
    hasSeen,
    isBase,
    max_allowed_environments,
    setShowLimitations,
    basePlanLimitations.inGracePeriod,
    tokens,
  ]);
  return { showBaseLimitations, tokens };
}
