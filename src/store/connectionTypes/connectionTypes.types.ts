import { EntityState } from '@reduxjs/toolkit';
import { IConnectionType } from 'api/types';

export const REDUCER_KEY = 'connectionTypes';

export interface IRiverConnectionsState extends EntityState<IConnectionType> {
  selectedId: string;
  loading: boolean;
  currentRequest?: {
    id: string;
    type: string;
  };
}
