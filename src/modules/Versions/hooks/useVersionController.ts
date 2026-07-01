import { AppParamRoutes } from 'app/routes';
import { useQuery } from 'components';
import { useMemo } from 'react';
import { useHistory } from 'react-router-dom';
import { useRiverActions } from 'store/river';

export enum VersionValues {
  ON = 'on',
}
/**
 * returns a search string with the appropriate versions param
 * that closes/terminates the versions feature
 */
export function useVersionController() {
  const query = useQuery();
  const history = useHistory();
  const { restoreRiverBackup } = useRiverActions();

  return useMemo(() => {
    const viewVersion = (versionId: string) => {
      if (versionId) {
        query.set(AppParamRoutes.VERSIONS, versionId);
      } else {
        query.delete(AppParamRoutes.VERSIONS);
      }
      history.replace({ search: query.toString() });
    };

    return {
      view: (versionId: string) => {
        viewVersion(versionId);
      },
      viewLatest: () => {
        viewVersion(null);
        restoreRiverBackup();
      },
      toggleOff: () => {
        query.delete(AppParamRoutes.VERSIONS);
        query.delete('river_drawer');
        return query.toString();
      },
      version: query.get(AppParamRoutes.VERSIONS),
      isActive: Boolean(query.get(AppParamRoutes.VERSIONS)),
    };
  }, [history, query, restoreRiverBackup]);
}
