import { BlockTypes, TargetTypes } from './rivers.types';

export interface IDataTarget {
  name: string;
  api_name: string;
  target_type: TargetTypes;
  datasource_type_id: string;
  connection_type: string;
  target_task_type_id: string;
  logic_step_type: BlockTypes;
  target_settings: TargetSettings;
  segment: any;
  river_type_id: any;
  icon: string;
  file_zone_settings: FileZoneSettings;
}

export interface TargetFileTypes {
  bq: Bq[];
}

export enum Bq {
  Avro = 'avro',
  CSV = 'csv',
  JSON = 'json',
}

export enum SectionID {
  SECOrganization = 'sec_organization',
  SECRelational = 'sec_relational',
  SECStorage = 'sec_storage',
}

export interface TargetSettings {
  enable_sql_results?: boolean;
  enable_cdc?: boolean;
  dataframe_as_source?: boolean;
  dataframe_landing_zone?: boolean;
  dataframe_as_target?: boolean;
  allowed_for_blueprint?: boolean;
  custom_fz_loading_modes?: boolean;
  include_set_target_order?: boolean;
  allow_partition_integer?: boolean;
  allow_partition_string?: boolean;
}

export interface FileZoneSettings {
  target_type_id: string;
  default_connection_definition: any;
  is_default: boolean;
  bucket: '{gcs_file_zone}';
  is_connection: true;
  fields_mapping: {};
  target_type_options: {};
}

export enum Status {
  Enabled = 'enabled',
}
