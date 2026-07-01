import { EntityState } from '@reduxjs/toolkit';
import { IEnvironment } from 'api/types';

export const REDUCER_KEY = 'environments';

export interface IEnvironmentsState extends EntityState<IEnvironment> {
  selectedEnvironment: string;
  variablesDrawer: boolean;
}
