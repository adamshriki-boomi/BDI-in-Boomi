import { OID, RiveryDate, RiveryId, RunStatus } from './common.types';
import { RiverTypes } from './river.types';

export interface IRiver {
  cross_id: OID;
  river_definitions: RiverDefinitions;
  tasks_definitions: TasksDefinition[];
  _id: OID;
}

export interface RiverDefinitions {
  account: OID;
  group_id: RiveryId;
  updated_by: OID;
  updated_by_name: string;
  shared_params: Partial<SharedParams>;
  river_date_updated: RiveryDate;
  is_sub_river: boolean;
  version_id: OID;
  is_deleted: boolean;
  source_type: string;
  is_scheduled: boolean;
  river_date_inserted: RiveryDate;
  river_desc: string;
  river_name: string;
  river_type: RiverTypes;
  cross_id: OID;
  env_id: OID;
  _id: OID;
  is_locked: boolean;
  created_by: OID;
  river_type_id: string;
  river_insert_date: RiveryDate;
  river_modified_date: RiveryDate;
  river_time_created: RiveryDate;
  river_type_title: string;
  is_master_river: boolean;
  subrivers_enabled: null;
  source: Source;
  river_time_updated: RiveryDate;
  river_type_icon_url: string;
  target: Source;
  subrivers: {
    enabled: boolean;
  };
  is_api_v2?: boolean;
  schedulers?: any[];
  suspended?: {
    suspension_date?: string;
    notification_date?: string;
  };
}

export interface Source {
  size: number;
  name: string;
  icon: string;
}

export interface SharedParams {
  notifications: Notifications;
  fz_connection: FzConnection;
  run_timeout: number;
  is_migration?: boolean;
  river_variables?: Record<string, Variable>;
}

export interface FzConnection {
  enabled: boolean;
  email: string;
}

export interface Notifications {
  on_warning: Partial<FzConnection>;
  on_failure: Partial<FzConnection>;
  on_run_threshold: Partial<FzConnection>;
}

export interface TasksDefinition {
  task_type_name: string;
  related: Related;
  global_keys: GlobalKeys;
  task_label: string;
  env_id: OID;
  created_by: OID;
  feeder_module: string;
  task_config: TaskConfig;
  task_type_id: string;
  task_process_module: string;
  is_target_task: boolean;
  river_id: OID;
  ordinal: number;
  move_as_is: boolean;
  datasource_id: string;
  updated_by: OID;
  schedule: Schedule;
  task_method: string;
  pull_translate: PullTranslate;
  connection_id: FzConnection;
  version_id: OID;
  is_synchronized: boolean;
  current_workers_running: number;
  task_date_inserted: RiveryDate;
  account: OID;
  task_date_updated: RiveryDate;
  is_deleted: boolean;
  is_feeder_lock: boolean;
  task_name: string;
  task_display_name: string;
  pull_target: string;
  _id: OID;
  is_worker_lock: boolean;
}

export interface GlobalKeys {
  target_name: string;
}

export interface PullTranslate {
  fields: string;
  databases: string;
  datasets: string;
  results: string;
  schemas: string;
}

export interface Related {
  connections: OID[];
  rivers: any[];
}

export interface Schedule {
  endDate_beforeSave: string;
  sched: Sched;
  job_id: string;
  isEnabled: boolean;
  cronExp: string;
  endDate: FzConnection;
  currentTab: string;
}

export interface Sched {
  hour: number;
  min: number;
  year: Year;
  days: Days;
  month: Month;
  hours: Hours;
  showCrontab: boolean;
  minutes: number;
}

export interface Days {
  days: number;
}

export interface Hours {
  hours: number;
  radioHour: number;
}

export interface Month {
  radioMon: number;
  months: number;
  days: number;
  month: number;
}

export interface Year {
  radioYear: number;
  days: number;
}

export interface TaskConfig {
  logic_steps: ILogicStep[];
  condition_name_counter: number;
  variables: Record<string, Variable>;
  datasource_id: string;
  fz_batched: boolean;
  container_name_counter: number;
  step_name_counter: number;
  should_run_data_quality_tests: boolean;
  extract_method: string;
}

export enum ContainerRunningTypes {
  RUN_ONCE = 'run_once',
  LOOP_OVER = 'loop_over',
  CONDITION = 'condition',
}

export enum PartitionGranularity {
  YEAR = 'YEAR',
  MONTH = 'MONTH',
  DAY = 'DAY',
  HOUR = 'HOUR',
}

export interface ILogicStep {
  loop_over_variable_name: string[];
  loop_over_value: string;
  status: RunStatus;
  hash_key_init: string;
  isEnabled: boolean;
  isParallel?: boolean;
  container_running: ContainerRunningTypes;
  content?: Content;
  disable_errors?: boolean;
  hideBlock?: boolean;
  error_description: string;
  step_name: string;
  // nodes: ILogicStep[];
  nodes: any;
  condition?: ConditionType;
  data_quality_tests_ids: DataQualityTestMeta[];
  step_id: string;
}

export interface DataQualityTestMeta {
  id: string;
  is_active: boolean;
}

export enum LogicTargetType {
  TABLE = 'table',
  VARIABLE = 'variable',
  FILES_EXPORT = 'files_export',
  DATAFRAME = 'dataframe',
}

export interface Content {
  file_type?: FileTypes;
  file_cross_id?: string;
  source_dataframe?: string;
  target_dataframe?: string;
  source_dataframe_id?: string;
  target_dataframe_id?: string;
  file_name?: string;
  block_primary_type?: BlockTypes;
  csv_details?: CSVDetails;
  split_interval?: SplitInterval;
  compression?: FileCompressions;
  drop_after?: boolean;
  target_loading?: TargetLoading;
  variable_name?: string;
  gConnection?: OID | string;
  source_type?: SourceType;
  load_into_one_file?: boolean;
  execute_sql_command?: boolean;
  block_type: StepTypes | string;
  is_global_variable?: boolean;
  fzConnection?: FzConnection;
  connection_id?: FzConnection;
  bucket_name?: string;
  split_tables?: SplitTables;
  file_path_destination?: string;
  fields: FieldColumn[];
  target_type?: LogicTargetType;
  target_table?: string;
  block_db_type?: StepTypes | string;
  query_priority?: QueryPriority;
  use_standard_sql?: boolean;
  sql_query?: string;
  partition_type?: string;
  partition_granularity?: string;
  is_ordered_merge?: boolean;
  order_expression?: string;
  river_id?: OID;
  action_id?: string;
  connection_oid?: string;
  input_variables?: Record<string, any>;
  action_vars?: {
    action_variables: Record<string, any>;
    interval_params: Record<string, any>;
  };
  output_vars_mapping?: Record<string, any>;
  merge_method?: MergeMethods;
  distribution_method?: DistributionMethodTypes;
  logicode_resource?: string;
  additional_packages?: string;
  billing_tier?: number;
  autocommit?: boolean;
}

export interface ConditionType {
  condition_name: string;
  condition_then: ConditionThenType;
  key: string;
  val: string;
  operator: OperatorType;
}

export enum ConditionThenType {
  RUN_STEP = 'run_step',
  PASS = 'pass',
  STOP = 'stop',
  Failed = 'failed',
}

export enum OperatorType {
  EQUALS = 'equals',
  DOES_NOT_EQUAL = 'does_not_equal',
  LIKE = 'like',
  NOT_LIKE = 'not_like',
  LESS_THAN = 'less_than',
  GREATER_THAN = 'greater_than',
  LESS_THAN_EQUALS = 'less_than_equals',
  GREATER_THAN_EQUALS = 'greater_than_equals',
}

export enum TableType {
  COLUMNSTORE = 'columnstore',
  ROWSTORE = 'rowstore',
  FACT = 'FACT',
  DIMENSION = 'DIMENSION',
}

export enum DistributionMethodTypes {
  ALL = 'all',
  EVEN = 'even',
  KEY = 'key',
  ROUND_ROBIN = 'round_robin',
  HASH = 'hash',
  RANGE = 'range',
  REPLICATE = 'replicate',
}

export enum MergeMethods {
  SWITCH_TABLES = 'switch_tables',
  DELETE_INSERT = 'delete_insert',
  MERGE = 'merge',
  INSERT_ON_CONFLICT = 'insert_on_conflict',
}

export enum QueryPriority {
  INTERACTIVE = 'interactive',
  BATCH = 'batch',
}

export enum FileCompressions {
  NONE = 'none',
  GZIP = 'gzip',
  BZ2 = 'bzip2',
  ZST = 'zstd',
}

export enum FileTypes {
  CSV = 'csv',
  JSON = 'json',
  AVRO = 'avro',
  TXT = 'txt',
  XML = 'xml',
}

export enum SplitInterval {
  HOURLY = 'h',
  DAILY = 'd',
  MONTHLY = 'm',
  YEARLY = 'y',
}

export enum SplitTables {
  NO = 'no',
  RECORD = 'record',
  FORMULA = 'formula',
}

export enum TargetLoading {
  APPEND = 'append',
  MERGE = 'merge',
  OVERWRITE = 'overwrite',
}

export enum SourceType {
  SQL_QUERY = 'sql_query',
  SQL_SCRIPT = 'sql_script',
  DATAFRAME = 'dataframe',
}

export enum PartitionType {
  TIMESTAMP = 'TIMESTAMP',
  DATETIME = 'DATETIME',
  DATE = 'DATE',
}

export enum BlockTypes {
  DEFAULT = 'sql',
  SQL = 'sql',
  RIVER = 'river',
  ACTION = 'action',
  LOGICODE = 'logicode',
  PYTHON = 'python',
}

export interface CSVDetails {
  quote: string;
  delimiter: string;
  include_header: boolean;
}

export interface Variable {
  is_encrypted?: any;
  clear_value_on_start: boolean;
  is_multi_value?: boolean;
  value: string;
}

export enum StepTypes {
  BIG_QUERY_SQL = 'big_query_sql',
  REDSHIFT = 'redshift',
  SNOWFLAKE = 'snowflake',
  ONELAKE = 'onelake',
  DATABRICKS = 'databricks',
  AZURE_SQL_DWH = 'azure_sql_dwh',
  FIREBOLT = 'firebolt',
  ATHENA = 'athena',
  POSTGRES = 'postgres',
  AZURE_DATALAKE = 'azure_datalake',
}

export enum SourceTypes {
  MARIADB = 'mariadb',
  MYSQL = 'mysql',
  BIGQUERY = 'bigquery',
  MSSQL = 'mssql',
  VERTICA = 'vertica',
  MONGO = 'mongodb',
  BLUEPRINT = 'blueprint',
  POSTGRES = 'postgresql',
  ORACLE = 'oracle',
  AMAZON_S3 = 's3',
  GOOGLE_CLOUD_STORAGE = 'gcs',
  WEBHOOK = 'webhook',
  NETSUITE_ANALYTICS = 'netsuite_analytics',
  SALESFORCE = 'salesforce',
}

export enum TargetTypesV1 {
  BIG_QUERY = 'bigquery',
  REDSHIFT = 'redshift',
  SNOWFLAKE = 'snowflake',
  ONELAKE = 'onelake',
  DATABRICKS = 'databricks',
  FIREBOLT = 'firebolt',
  POSTGRES = 'postgres_rds',
  ATHENA = 'athena',
  AZURE_SQL = 'azure_sql',
  AZURE_DATALAKE = 'azure_datalake',
  AMAZON_S3 = 's3',
  EMAIL = 'target_email',
  AZURE_BLOB = 'blob_storage',
  GOOGLE_CLOUD_STORAGE = 'gcs',
  AZURE_SQL_DWH = 'azure_synapse_analytics',
  KNOWLEDGE_HUB = 'knowledge_hub',
}

export enum TargetTypes {
  BIG_QUERY = 'bq',
  REDSHIFT = 'redshift',
  SNOWFLAKE = 'snowflake',
  ONELAKE = 'onelake',
  AZURE_SQL_DWH = 'azure_sql_dwh',
  DATABRICKS = 'databricks',
  FIREBOLT = 'firebolt',
  POSTGRES = 'postgres',
  ATHENA = 'athena',
  AZURE_SQL = 'azure_sql',
  AZURE_DATALAKE = 'azure_datalake',
  AMAZON_S3 = 's3',
  GOOGLE_CLOUD_STORAGE = 'gcs',
}

export enum ConnectionTypes {
  GCLOUD = 'gcloud',
  BQ_SRC = 'bq_src',
}

export type FieldColumn = {
  name: string;
  fields: any[];
  fieldName: string;
  mode: 'NULLABLE' | 'REQUIRED' | 'REPEATED';
  type:
    | 'STRING'
    | 'BIGINT'
    | 'FLOAT'
    | 'BOOLEAN'
    | 'TIMESTAMP'
    | 'TIME'
    | 'INTEGER'
    | 'SMALLINT'
    | 'TINYINT'
    | 'DOUBLE'
    | 'DATE'
    | 'BINARY'
    | 'NUMERIC'
    | 'JSON';
  id: string;
};

export enum IncrementalType {
  DATETIME = 'datetime',
  EPOCH = 'epoch',
  RUNNING_NUMBER = 'runningnumber',
}

export enum ExtractMethod {
  ALL = 'all',
  INCREMENTAL = 'incremental',
}

export const storageTargets = [
  TargetTypesV1.AMAZON_S3,
  TargetTypesV1.GOOGLE_CLOUD_STORAGE,
  TargetTypesV1.AZURE_BLOB,

  // Email is included here even though it's not a storage target
  // All the storage limits are applied to the email target
  TargetTypesV1.EMAIL,
  TargetTypesV1.KNOWLEDGE_HUB,
];
