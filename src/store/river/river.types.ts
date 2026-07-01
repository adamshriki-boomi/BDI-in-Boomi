import { EntityState } from '@reduxjs/toolkit';
import { IRiver, Run, StepsStatusLog } from 'api/types';
import { ValidationErrorMessages } from 'modules/RiverValidation';

export const REDUCER_KEY = 'river';

export enum NodeType {
  CONTAINER = 'CONTAINER',
  STEP = 'STEP',
  WRAP_CONTAINER = 'WRAP_CONTAINER',
}
export interface IRiverState extends EntityState<IRiver> {
  selectedRiverIsDirty: boolean;
  selectedId: string;
  isRiverVariablesLoaded: boolean;
  selectedVariables: any;
  initialVariables: any;
  errorFailRiver?: string;
  runDetails: Partial<Omit<Run, 'additional_data'>>;
  waitingRun: boolean;
  /**
   * string - index path of step OR step_id ?
   */
  runStepsStatus: Record<string, StepsStatusLog>;
  versions: {
    display: boolean;
    latestRiver: IRiver;
  };
  errors: Record<string, ValidationErrorMessages>;
  isProcessing?: boolean;
  isReloading?: boolean;
  isPending?: boolean;
  riverSchedulerAndNotifications?: Record<string, any>;
  riverMetadata?: Record<string, any>;
  extractMethod?: string;
}
