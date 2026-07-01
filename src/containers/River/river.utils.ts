import { IRiver } from 'api/types';

export const getRiverType = (river: IRiver) =>
  river?.river_definitions?.river_type;

export const populateDefaults = ({ draft, defaults }) => {
  return { ...defaults, ...draft };
};
