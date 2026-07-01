import { IncrementalType, StatusTypes, TargetTypesV1 } from 'api/types';
import { RunType } from '../components/form/form.consts';

export interface IRiverV1 extends Omit<IRiverResponseV1, 'properties'> {
  properties: SourceToTargetRiverProperties;
}
export interface IRiverResponseV1 {
  cross_id?: string;
  account_id?: string;
  kind: IRiverKind;
  type: IRiverTypes;
  name: string;
  environment_id?: string;
  environment_name?: string;
  group_id: string;
  group_name: string;
  metadata: Partial<Metadata>;
  properties: SourceToTargetRiverPropertiesResponse;
  notification_settings: NotificationSettings;
  schedulers: RiverSchedule[];
  settings: Partial<{
    run_timeout_seconds: number;
    notification: {
      warning: NotificationSetting;
      failure: NotificationSetting;
      run_threshold: NotificationSetting;
    };
  }>;
}

export interface IRunResponse {
  runs: [
    {
      sub_river_id?: string;
      run_id: string;
      status: StatusTypes;
      message: string;
    },
  ];
  river_cross_id: string;
  run_group_id: string;
}

export interface NotificationSetting {
  email: string;
  is_enabled: boolean;
  execution_time_limit_seconds?: number;
}

export interface RiverSchedule {
  cron_expression: string;
  is_enabled: boolean;
}
export enum IRiverKind {
  SUB_RIVER = 'sub_river',
  MAIN_RIVER = 'main_river',
}

export enum IRiverTypes {
  LOGIC = 'logic',
  ACTION = 'actions',
  SOURCE_TO_TARGET_OLD = 'src_to_trgt',
  SOURCE_TO_TARGET = 'source_to_target',
}

export enum IRiverStatus {
  ACTIVE = 'active',
  DISABLED = 'disabled',
}

export enum IRiverExtractMethod {
  ALL = 'all',
  LOG = 'log',
  BW = 'bw_extractor',
  CHANGE_TRACKING = 'change_tracking',
  SYSTEM_VERSIONING = 'system_versioning',
}

export interface Metadata {
  created_by: string;
  created_at: string;
  last_updated_by: string;
  last_updated_at: string;
  description: string;
  current_version_id: string;
  river_status: IRiverStatus;
  suspended?: {
    suspension_date: string;
    notification_date: string;
  };
}

export interface NotificationSettings {
  warning: Failure;
  failure: Failure;
  run_threshold: Failure;
}

export interface Failure {
  email: string;
  is_enabled: boolean;
  execution_time_limit_seconds: number;
}

export interface SourceToTargetRiverProperties {
  source: Source;
  target: Target;
  schemas: Schemas;
}

export interface SourceToTargetRiverPropertiesResponse
  extends Omit<SourceToTargetRiverProperties, 'schemas'> {
  schemas: SchemasApiResponse;
}
export type SchemasApiResponse = {
  name: string;
  tables: ISelectedTable[];
}[];

export type Schemas = Record<string, Schema>;

export type Schema = Record<string, ISelectedTable>;

export type TableStatus = 'waiting_for_migration' | 'live';
export type ExtractMethod = 'all' | 'incremental';
export type TimePeriod =
  | 'custom'
  | 'yesterday'
  | 'today'
  | 'last_7_days'
  | 'last_365_days'
  | 'week_to_date'
  | 'previous_week'
  | 'previous_week_to_date'
  | 'last_week'
  | 'month_to_date'
  | 'previous_month'
  | 'previous_month_to_date'
  | 'year_to_date';

export interface DateRange {
  time_period: TimePeriod | '';
  start_date: string;
  end_date: string;
  days_back: number;
  utc_offset: number;
  include_end_value: boolean;
  round_up?: boolean;
  split_time_intervals: Record<string, any>;
  update_increment_on_failures: boolean;
}
export interface ValueDef {
  start_value: string;
  end_value: string;
  include_end_value: boolean;
  rows_in_chunk: number;
}
interface IOptionalTableProps {
  is_selected: boolean;
  extract_method: ExtractMethod;
  incremental_field: string;
  interval_chunk_size: number;
  interval_chunk_by: string;
  date_range: Partial<DateRange>;
  epoch: Partial<ValueDef>;
  running_number: Partial<ValueDef>;
  target_table?: string;
  exporter_chunk_size: number;
  filter_expression: string;
  table_status: TableStatus;
  modified_columns: IModifiedColumn[];
  // exists in old as is_ordered_merge
  additional_target_settings: Partial<AdditionalSettings>;
  additional_source_settings: Partial<AdditionalSettings>;
  // merge_method: MergeMethod | ''; // TODO pending values from
  last_table_run_status: StatusTypes;
  report_id?: string;
  schemaName?: string;
  incremental_type?: IncrementalType;
  custom_increment_columns?: string[];
}
export interface ISelectedTable extends Partial<IOptionalTableProps> {
  name: string;
  target_table: string;
}

export type TargetLoading = 'merge' | 'append' | 'overwrite';
export type MergeMethod = 'switch_tables' | 'merge' | 'delete_insert';
export type CalculatedColumnMode = 'source' | 'target';
export type ColumnMode = 'NULLABLE' | 'REPEATED';
export interface IModifiedColumn {
  is_selected: boolean;
  type?: string;
  name: string;
  alias?: string;
  expression?: string;
  is_key?: boolean;
  is_sort_key?: boolean;
  sort_order?: number;
  cluster_key?: number;
  calculated_column_mode?: CalculatedColumnMode;
  // client set by the last index (1) - add to "source" expression
  // display sort order -> none calculated, target, source (by order)
  order?: number;
  mode?: ColumnMode;
  length?: number;
  precision?: number;
  scale?: number;
}

export interface Source {
  name: string;
  datasource_id: string;
  connection_id: string;
  connection_name: string;
  run_type: RunType;
  additional_settings?: Partial<AdditionalSettings>;
  cdc_settings: Record<any, any>;
  custom_query_source_settings?: Partial<CustomQuerySourceConfig>;
}

export interface CustomQuerySourceConfig {
  extract_method: 'all' | 'incremental';
  incremental_field?: string;
  incremental_type?: string;
  date_range?: Record<string, any>;
  running_number?: Record<string, any>;
  epoch?: Record<string, any>;
  row_version?: Record<string, any>;
  array_size?: number;
  exporter_chunk_size?: number;
}

export interface AdditionalSettings extends Record<string, any> {
  recreate_keys: boolean;
  enforce_masking_policy: boolean;
  escape_character: string;
  timezone_offset: number;
  include_timezone: boolean;
}

export interface Target {
  name: TargetTypesV1;
  connection_id: string;
  connection_name: string;
  database_name: string;
  schema_name: string;
  table_name: string;
  table_prefix: string;
  loading_method:
    | 'overwrite'
    | 'append'
    | 'merge'
    | 'merge_into'
    | 'switch_merge'
    | 'delete_insert';
  merge_method: MergeMethod;
  file_zone_settings: FileZoneSettings;
  additional_settings: AdditionalSettings;
  single_table_settings?: Record<string, any>;
}

export interface FileZoneSettings {
  path: string;
  bucket_name: string;
  partitioned_kind: 'by_day' | 'by_hour' | 'by_minute';
}

export interface IVariableV1 {
  name: string;
  settings: {
    clear_value_on_start: boolean;
    is_multi_value: boolean;
    is_encrypted: boolean;
  };
  value: any;
}

export interface IVariablesV1 {
  next_page: string;
  previous_page: string;
  page: number;
  current_page_size: number;
  total_items: number;
  account_id: string;
  environment_id: string;
  items: IVariableV1[];
}
