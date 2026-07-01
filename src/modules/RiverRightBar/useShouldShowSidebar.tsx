import { ParamsOptions } from 'containers/River/RiverLogic/Logic/components/RiverBar/RiverBar';
import { getQueryParams } from 'hooks/router';
import { useRouteMatch } from 'react-router-dom';

export function useShouldShowSidebar({ params = null }) {
  const isInRiverView = Boolean(useIsInsideRiver());
  const isInNewRiverPage = useIsInNewRiver();
  return {
    isInRiverView: params === ParamsOptions.POPUP ? false : isInRiverView,
    isInNewRiverPage: params === ParamsOptions.POPUP ? false : isInNewRiverPage,
  };
}

type MatchNewRiverRouteResult = {
  params: { env: string; account: string };
};

export function useIsInNewRiver() {
  const match: MatchNewRiverRouteResult = useRouteMatch(
    `/rivers/:account/:env/new/logic`,
  );
  const { selected_river_type } = getQueryParams(['selected_river_type']);
  return Boolean(match?.params || selected_river_type);
}

export function useIsInNewS2TRiver() {
  const match: MatchNewRiverRouteResult = useRouteMatch(
    `/rivers/:account/:env/new/source-to-target`,
  );
  return Boolean(match?.params);
}

type MatchRouteResult = {
  params: { env: string; account: string; river: string };
};

export function useIsInsideRiver() {
  const match: MatchRouteResult = useRouteMatch(`/rivers/:account/:env/:river`);
  const matchLegacy: MatchRouteResult = useRouteMatch(
    `/river/:account/:env/river/:river`,
  );
  const params = match?.params || matchLegacy?.params;
  const river = params?.river;
  return river;
}

export function useIsInsideOldRiver() {
  const matchLegacy: MatchRouteResult = useRouteMatch(
    `/river/:account/:env/river/:river`,
  );
  const params = matchLegacy?.params;
  return params?.river;
}
