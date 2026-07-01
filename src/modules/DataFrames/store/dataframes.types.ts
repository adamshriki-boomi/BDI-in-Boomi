export interface DataframeContent {
  name: string;
  path?: string;
}

export enum RetentionTimes {
  ALWAYS = 'always',
  NEVER = 'never',
  DEFAULT = '',
}
export interface IDataframe extends DataframeContent {
  _id: string;
  account: string;
  cross_id?: string;
  env_id: string;
  connection_settings?: Partial<ICustomLandingZone>;
  retention?: Record<'clear_river_end', RetentionTimes>;
}

export interface ICustomLandingZone {
  datasource_id: string;
  connection: string;
  default_bucket: string;
  storage_type: string;
}
