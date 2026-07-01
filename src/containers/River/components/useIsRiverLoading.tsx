import { useRiver } from 'store/river';
import { useFetchVersion } from './useFetchVersion';

export const useIsRiverLoading = () => {
  const { isProcessing, isReloading } = useRiver();
  const isVersionLoading = useFetchVersion();
  return (isProcessing && !isReloading) || isVersionLoading;
};
