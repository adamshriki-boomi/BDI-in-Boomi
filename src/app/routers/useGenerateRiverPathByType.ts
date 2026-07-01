import { RiverTypes } from 'api/types';
import { generatePath, useParams } from 'react-router-dom';
import { getOId } from 'utils/api.sanitizer';
import { AppRoutes, LegacyRoutes } from '../routes';

export const useGenerateRiverPathByType = (
  riverType: RiverTypes,
  crossId: string,
  /**
   * an additional condition that is used to determine
   * whether AppRoutes.RIVER should be used
   * WHY? this prop keeps this hook agnostic to its usage
   */
  enableNewRoute: boolean,
) => {
  const pattern =
    enableNewRoute || isLogicRiver(riverType)
      ? AppRoutes.RIVER
      : LegacyRoutes.RIVER;
  return generatePath(pattern, {
    river: getOId(crossId),
    ...useParams(),
  });
};

const isLogicRiver = (riverType: RiverTypes) => riverType === RiverTypes.LOGIC;
