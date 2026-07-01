import { EntityState } from '@reduxjs/toolkit';
import { IRiver } from 'api/types';

export const REDUCER_KEY = 'actionRivers';

export interface IActionRiversState extends EntityState<IRiver> {
  loading: boolean;
}
