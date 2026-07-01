export enum StatusTypes {
  SUCCEEDED = 'succeeded',
  SUCCESS = 'success',
  FAILED = 'failed',
  FAILURE = 'failure',
  RUNNING = 'running',
  PENDING = 'pending',
  CANCELED = 'canceled',
  PARTIAL = 'partially succeeded',
  MOCK = 'mock',
  SKIPPED = 'skipped',
}
export interface IActivity {
  account: string;
  env_id: string;
  cross_id: string;
  river_id: string;
  master_river_id: string;
  river_name: string;
  is_sub_river: boolean;
  is_master_river: boolean;
  is_multi: boolean;
  group_id: string;
  is_scheduled: boolean;
  total_files: number;
  rpu: number;
  total_size: number;
  last_run: number;
  pending: number;
  failed: number;
  running: number;
  succeeded: number;
  canceled: number;
  datasource_id: string;
  dry_runs: number;
  last_runs: ILastRun[];
}

export interface ILastRun {
  status: StatusTypes;
  max_run_duration_milliseconds: number;
  run_group_id: string;
  rpu: number;
  run_date: string;
}
