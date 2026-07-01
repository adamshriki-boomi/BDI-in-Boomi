import { EntityState } from '@reduxjs/toolkit';
import { RiverTypeProperties } from 'api/types';

export const REDUCER_KEY = 'riverTypes';

export interface IRiverTypesState extends EntityState<RiverTypeProperties> {
  loading: boolean;
}
