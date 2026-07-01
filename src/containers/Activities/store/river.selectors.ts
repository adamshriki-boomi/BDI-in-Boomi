import { IRiver } from 'api/types';

export const getRiverDifintions = (river: IRiver) => river?.river_definitions;
export const getRiverName = (river: IRiver) =>
  getRiverDifintions(river)?.river_name;
export const getRiverType = (river: IRiver) =>
  getRiverDifintions(river)?.river_type;
export const getRiverSharedParams = (river: IRiver) =>
  getRiverDifintions(river)?.shared_params;
export const getIsSubRiversEnabled = (river: IRiver) =>
  getRiverDifintions(river)?.subrivers?.enabled;
