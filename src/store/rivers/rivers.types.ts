import { EntityState } from '@reduxjs/toolkit';
import { IRiver, OID } from 'api/types';

export const REDUCER_KEY = 'rivers';

export interface IRiversState extends EntityState<IRiver> {
  selectedId: string;
}
export interface IRiverGroup {
  update_time: number;
  name: string;
  color: string;
  is_default: boolean;
  insert_time: number;
  cross_id: OID;
  _id: OID;
}
