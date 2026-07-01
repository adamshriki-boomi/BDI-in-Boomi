import { IActivity, StatusTypes } from 'api/types';

export interface ICollectionResponse<T> {
  items: T[];
}
export interface IRiverCreds {
  riverId: string;
}
export interface IAccountCreds {
  river_cross_id: string;
  environment_id: string;
  account_id: string;
}
export interface IDateRange {
  start_time: number;
  end_time: number;
}
export interface ActivitiesStatsResponse {
  running: number;
  pending: number;
  succeeded: number;
  failed: number;
  canceled: number;
  skipped?: number;
  total_rpu: number;
  env_id: string;
  account: string;
}
export interface ActivitiesResponse extends ICollectionResponse<IActivity> {
  cache_context_id?: string;
  next_page: string;
  total_pages: number;
  total_items: number;
  page: number;
  current_page_size: number;
}

export interface ActivityRiverRunsResponse
  extends IAccountCreds,
    ICollectionResponse<IRunScheduler> {
  next_page: string;
  total_items: number;
  current_page_size: number;
  page: number;
}

export interface ISubRiver {
  sub_river_id: string;
  sub_river_name: string;
}

export interface IRunScheduler {
  run_group_id: string;
  status: StatusTypes;
  rpu: number;
  max_duration_in_milliseconds: number;
  run_date_epoch_milliseconds: number;
  run_date_utc: string;
}

// Activities Targets
export interface ActivitiesTargetsPayload {
  /**
   * these are auto-sent by apiQueryV1
   */
  account_id?: string;
  environment_id?: string;
  // river_cross_id: string;
  riverId: string;
  start_time: string;
  end_time: string;
  status?: StatusTypes;
  run_group_id?: string;
  sub_river_id?: string;
}

export interface IActivityTarget {
  target_name: string;
  status: StatusTypes;
  rpu: number;
}
export interface ActivitiesTargetsResponse extends IAccountCreds {
  runs: IActivityTarget[];
}

export interface ActivitiesConsistencResponse {
  items: RiverConsistency[];
}

export interface RiverConsistency {
  river_id: string;
  last_runs: LastRuns[];
}

interface LastRuns {
  status: string;
  max_run_duration_milliseconds: number;
  run_group_id: string;
  rpu: number;
  run_date: string;
}
