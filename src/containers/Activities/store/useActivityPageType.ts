import { IRiver, RiverTypes } from 'api/types';
import { useRiverId } from '../helpers';
import { useFetchRiverQuery } from './river.query';
import {
  getIsSubRiversEnabled,
  getRiverSharedParams,
  getRiverType,
} from './river.selectors';

export enum ActivityPageTypes {
  MULTI = 'multi',
  SUB_RIVERS = 'sub_rivers',
  SOURCE_TO_TARGET = 'src_to_trgt',
  ACTION = 'action',
  LOGIC = 'logic',
}

export const NonSourceToTargetRivers = [RiverTypes.LOGIC, RiverTypes.ACTION];

export function useActivityPageType() {
  const { data: river } = useFetchRiverQuery(useRiverId());
  const riverType = getRiverType(river);
  //If we don't wait for river types we get default of src_to_trgt. Need to wait for types.

  const activityPageType = riverType
    ? ((NonSourceToTargetRivers.includes(riverType)
        ? riverType
        : getSourceToTargetView(river)) as ActivityPageTypes)
    : null;
  return {
    activityPageType,
    isLogicRiver: activityPageType === ActivityPageTypes.LOGIC,
    isS2tTRiver:
      activityPageType &&
      ![ActivityPageTypes.LOGIC, ActivityPageTypes.ACTION].includes(
        activityPageType,
      ),
  };
}

const getSourceToTargetView = (river: IRiver) => {
  const sharedParams = getRiverSharedParams(river);
  const isSubRiversEnabled = getIsSubRiversEnabled(river);
  return sharedParams?.is_migration
    ? ActivityPageTypes.MULTI
    : isSubRiversEnabled
    ? ActivityPageTypes.SUB_RIVERS
    : ActivityPageTypes.SOURCE_TO_TARGET;
};
