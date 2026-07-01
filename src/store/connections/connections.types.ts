import { EntityState } from '@reduxjs/toolkit';
import { IConnection } from 'api/types';

export const REDUCER_KEY = 'connections';

export interface IConnectionsState extends EntityState<IConnection> {
  selectedId: string;
}
