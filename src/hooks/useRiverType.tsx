import { RiverTypes } from 'api/types';
import { sourceToTargetTypes } from 'containers/Activities/[id]/components/RiverHeader';
import { getQueryParams } from 'hooks/router';
import { useIsInNewS2TRiver } from 'modules/RiverRightBar';
import { useRiver } from 'store/river';

export function useRiverType() {
  const { riverType } = useRiver();
  const { selected_river_type } = getQueryParams(['selected_river_type']);
  const newSourceToTarget = useIsInNewS2TRiver();
  const isSourceToTarget = sourceToTargetTypes.some(type => type === riverType);
  return {
    isSourceToTarget: isSourceToTarget
      ? isSourceToTarget
      : sourceToTargetTypes.includes(selected_river_type) || newSourceToTarget,
    isLogic: riverType === RiverTypes.LOGIC,
    isAction: riverType === RiverTypes.ACTION,
  };
}
