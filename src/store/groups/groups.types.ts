import { EntityState } from '@reduxjs/toolkit';
import { IGroup } from 'api/types';

export const REDUCER_KEY = 'groups';

export interface IGroupsState extends EntityState<IGroup> {
  loading: boolean;
}
