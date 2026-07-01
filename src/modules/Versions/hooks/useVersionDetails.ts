import { AppParamRoutes } from 'app/routes';
import { useQuery } from 'components';
import { compare } from 'utils/array.utils';
import { formatDate } from '../components/formatDate';
import { useVersionController } from './useVersionController';
import { useVersions } from './useVersions';
import { useGetRiverVersionQuery } from './versions.query';

export const useVersionDetails = (version: string) => {
  const { isActive: isInVersionMode } = useVersionController();
  const { versions } = useVersions(isInVersionMode, !Boolean(version));
  const currentVersion = versions?.find(compare('version_id', version));
  const { time, display } = formatDate(currentVersion?.insert_date);
  const versionDescription = currentVersion?.name || `${display}, ${time}`;

  return { versionDescription, currentVersion };
};

/**
 * fetch a version with api v1
 */
export const useVersionDetailsV1 = ({ riverId }) => {
  const query = useQuery();
  const versionId = query.get(AppParamRoutes.VERSIONS);

  const { data } = useGetRiverVersionQuery(
    { crossId: riverId, versionId },
    {
      skip: !versionId || ![riverId, versionId].every(Boolean),
    },
  );
  return versionId ? data : null;
};
