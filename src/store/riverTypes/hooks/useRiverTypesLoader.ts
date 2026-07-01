import { useEffect } from 'react';
import { useRiverTypesActions } from './useRiverTypesLoaderActions';

export function useRiverTypesLoader(force: boolean = false) {
  const { fetchRiverTypes } = useRiverTypesActions();

  useEffect(() => {
    fetchRiverTypes();
  }, [fetchRiverTypes]);
}
