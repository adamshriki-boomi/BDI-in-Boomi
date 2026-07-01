import { RiverTypes } from 'api/types';
import { useRiverId } from 'containers/Activities/helpers';
import { useGetRiverQuery } from 'modules/SourceTarget';
import { useRiver } from 'store/river';

/**
 * returns true if stt_river is displayed
 * @returns boolean
 */
export const useIsRiverSttV1 = () => {
  const { riverType } = useRiver();
  const riverId = useRiverId();
  const { data } = useGetRiverQuery(riverId, {
    skip: !riverId || riverType !== RiverTypes.SOURCE_TO_TARGET,
  });
  return (
    data?.type === 'source_to_target' ||
    riverType === RiverTypes.SOURCE_TO_TARGET
  );
};
