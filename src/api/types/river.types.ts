import { OID, RiveryId, RunStatus } from './common.types';

export enum RiverRunStatus {
  SKIPPED = 'skipped',
}
export interface IRiverV1RunResponse {
  message: string;
  river_cross_id: string;
  status: RiverRunStatus;
  run_group_id: string;
}

export interface IRiverRunResult {
  current: Current;
  account: string;
  total: number;
  river_id: OID;
  env_id: string;
  _id: string;
  runs: Run[];
  is_subrivers: boolean;
  waiting?: boolean;
}

export interface Current {
  R: number;
  E: number;
  D: number;
  W: number;
}

export interface Run {
  is_subrivers: boolean;
  account: string;
  user_id: OID;
  run_group_id: string;
  run_id: string;
  run_by: string;
  river_name: string;
  river_run_message: string;
  task_run_details: TasksRunDetail[];
  run_insert_date: number;
  run_end_date: number;
  river_run_status: RunStatus;
  river_type: string;
  cross_id: OID;
  env_id: string;
  is_hidden: boolean;
  run_update_date: number;
  additional_data: AdditionalData;
  river_id: OID;
  error_message?: string;
}

export interface AdditionalData {
  steps_status_log: StepsStatusLog[];
  steps_counter: number;
}

export interface StepsStatusLog {
  status: RunStatus;
  is_container: boolean;
  step_index: string;
  step_update_time: RiveryId;
  run_id: string;
  iteration_number: number;
  step_insert_time: RiveryId;
  error_description: null;
  step_name: string;
  step_id: string;
  step_run_time: RiveryId;
  error_id: number;
  step_duration: string;
  is_parallel: boolean | null;
  step_end_time: null;
}

export interface TasksRunDetail {
  task_activity_id: null;
  task_update_date: number;
  task_id: OID;
  task_status_message: string;
  task_insert_date: number;
  task_name: string;
  task_status: RunStatus;
}

export interface ICheckRunPayload
  extends Run,
    Pick<IRiverRunResult, '_id' | 'total' | 'runs' | 'current'> {}

export enum RiverTypes {
  LOGIC = 'logic',
  ACTION = 'actions',
  SOURCE_TO_TARGET = 'src_to_trgt',
  MULTI_ACTION = 'multi_action',
  REST_ACTION = 'rest_action',
  // TODO: to be deprecated
  SOURCE_TO_FZ = 'src_to_fz',
}
export interface ICreateRiverType {
  target_datasource_type_id: string;
  river_type_id: RiverTypes;
  _id: OID;
  properties: Exclude<RiverTypeProperties, 'type' | '_id'>;
}

export interface RiverTypeProperties {
  icon_url: string;
  desc: string;
  tooltip: string;
  title: string;
  type: RiverTypes;
  _id: OID;
}
