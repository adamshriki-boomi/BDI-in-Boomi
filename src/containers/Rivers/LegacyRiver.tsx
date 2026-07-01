import { AppRoutes } from 'app/routes';
import { useDataSourcesSections } from 'modules';
import { generatePath, Redirect } from 'react-router-dom';
import { useAccount } from 'store/core';
import { useGroupsLoader } from 'store/groups';
import { useRivers, useRiversLoader } from 'store/rivers';
import { RiverTypes } from 'api/types';

export function LegacyRouteRiver({
  match: {
    params: { env, account, river },
  },
}) {
  const { riversArray } = useRivers();
  useRiversLoader(env);
  useGroupsLoader(env);
  const selectedRiver = riversArray.find(
    ({ cross_id: { $oid } }) => $oid === river,
  );

  const sourceName = selectedRiver?.river_definitions?.source?.name;
  const targetName = selectedRiver?.river_definitions?.target?.name;

  const isNewInterface = useIsNewInterface(sourceName, targetName);
  const isV2River = selectedRiver?.river_definitions?.is_api_v2;
  const isLegacyRedirectRequired =
    selectedRiver?.river_definitions?.river_type_id === 'logic' ||
    (isV2River && isNewInterface);
  // TODO - once we have all river types handled by the new app, move the redirects to a generic location
  // Currently, we have to redirect based on river type
  return isLegacyRedirectRequired ? (
    <Redirect
      to={generatePath(AppRoutes.RIVER, { env, account, river })}
      push={false}
    />
  ) : null;
}

export const useIsNewInterface = (sourceName, targetName, type = null) => {
  const { isSettingOn } = useAccount();
  const { selectedDataSource } = useDataSourcesSections('source', sourceName);
  const { selectedDataSource: selectedTarget } = useDataSourcesSections(
    'target',
    targetName,
  );
  return (
    type === RiverTypes.LOGIC ||
    (selectedDataSource?.data_source_type_settings?.is_new_interface &&
      selectedTarget?.data_source_type_settings?.is_new_interface &&
      isSettingOn('allow_create_new_stt'))
  );
};
