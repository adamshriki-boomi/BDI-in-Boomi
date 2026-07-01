import { RiverTypes } from 'api/types';
import { RoutesBuilder } from 'app/routes';
import { useAccount, useCore } from 'store/core';
import { DRAFT_UID } from 'store/river';

type LinkByRiverType = {
  type: RiverTypes;
  accountId?: string;
  envId?: string;
};

const createLegacyRoute = (accountId, envId, type) => ({
  pathname: RoutesBuilder.createRiverLegacy({
    accountId,
    envId,
  }),
  search: `?selected_river_type=${type}&cacheSlayer=${new Date().getTime()}`,
});

const createSourceToTargetRoute = (account, env, type, isNewStt) => {
  return isNewStt
    ? RoutesBuilder.sourceToTarget({ account, env })
    : createLegacyRoute(account, env, type);
};

const actionRiversSelector = (account, env) =>
  RoutesBuilder.actions({ account, env });

export const useRiverRouteBuilder = () => {
  const { selectedAccountId: account, envId: env } = useCore();
  const { isSettingOn } = useAccount();

  const createLinkByRiverType = ({
    type,
    accountId = account,
    envId = env,
  }: LinkByRiverType) => {
    const createLink = routeGenerators?.[type];
    return createLink(
      accountId,
      envId,
      type,
      isSettingOn('allow_create_new_stt'),
    );
  };

  return { createLinkByRiverType };
};

const routeGenerators = {
  [RiverTypes.LOGIC]: (account, env) => {
    return RoutesBuilder.riverDraft({
      river: DRAFT_UID,
      account,
      env,
      type: RiverTypes.LOGIC,
    });
  },
  [RiverTypes.SOURCE_TO_FZ]: createSourceToTargetRoute,
  [RiverTypes.SOURCE_TO_TARGET]: createSourceToTargetRoute,
  [RiverTypes.ACTION]: actionRiversSelector,
  [RiverTypes.MULTI_ACTION]: createLegacyRoute,
  [RiverTypes.REST_ACTION]: createLegacyRoute,
};
