import { useEffect } from 'react';
import { useActionRivers, useActionRiversActions } from './useActionRivers';

export function useActionRiversLoader() {
  const { total } = useActionRivers();
  const { fetchActionRivers } = useActionRiversActions();

  useEffect(() => {
    if (total === 0) fetchActionRivers();
  }, [fetchActionRivers, total]);
}
