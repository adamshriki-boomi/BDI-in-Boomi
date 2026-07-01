import { useIsInsideRiver } from 'modules/RiverRightBar';
import { useParams, useRouteMatch } from 'react-router-dom';

type MatchRouteResult = {
  params: { env: string; account: string; river: string };
};

export const useRiverId = () => {
  const inRiverView = Boolean(useIsInsideRiver());
  const matchLegacy: MatchRouteResult = useRouteMatch(
    `/river/:account/:env/river/:river`,
  );
  const match: MatchRouteResult = useRouteMatch(`/rivers/:account/:env/:river`);
  const params = match?.params || matchLegacy?.params;
  const river = params?.river;
  const { river: riverId } = useParams<any>();

  return inRiverView ? river : riverId;
};

export const hasRequiredParams = params => Object.keys(params).length > 2;
