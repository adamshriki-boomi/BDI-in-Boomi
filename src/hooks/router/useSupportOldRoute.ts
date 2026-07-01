import { useHistory } from 'react-router-dom';
import { useEffectOnce } from 'react-use';

export function useSupportOldRoute() {
  const { replace, location } = useHistory();
  useEffectOnce(() => {
    if (location.hash.startsWith('#/river/')) {
      replace(location.hash.replace('#/', ''));
    }
  });
}
