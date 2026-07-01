import { API } from 'api';
import { getQueryParams } from 'hooks/router';
import { useLazyGetEnvironmentsQuery } from 'modules/Environments/environments.query';
import { useAsyncFn, useEffectOnce } from 'react-use';
import { useRiver, useRiverActions } from 'store/river';
import { getOId } from 'utils/api.sanitizer';

// TODO REMOVE THIS AFTER VARIABLES PAGE IS MIGRATED TO REACT
export const useFetchVersion = () => {
  const { selectedRiverId } = useRiver();
  const { selectVersion } = useRiverActions();
  const [fetchEnvironments] = useLazyGetEnvironmentsQuery();
  const { version } = getQueryParams(['version']);
  const [{ loading }, fetchVersion] = useAsyncFn(async () => {
    return API.versions
      .getVersionDetails(getOId(selectedRiverId), version)
      .then(selectVersion);
  }, [version, selectedRiverId]);

  useEffectOnce(() => {
    fetchEnvironments('');
    if (version) {
      fetchVersion();
    }
  });

  return loading;
};
