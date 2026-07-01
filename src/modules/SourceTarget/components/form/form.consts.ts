export enum SyncOption {
  SKIP_INITIAL_MIGRATION = 'SKIP_INITIAL_MIGRATION',
  RUN_INITIAL_MIGRATION = 'RUN_INITIAL_MIGRATION',
}
export const SYNC_OPTION =
  'river.properties.source.cdc_settings.default_tables_migration_option';

export const EXTRACT_METHOD =
  'river.properties.source.additional_settings.extract_method';

export const EXTRACT_API =
  'river.properties.source.additional_settings.extract_api';

export enum CDCTableStatus {
  WAITING_FOR_MIGRATION = 'waiting_for_migration',
  WAITING_FOR_SYNC = 'waiting_for_sync',
  LIVE = 'live',
}

export enum RunType {
  CUSTOM_QUERY = 'custom_query',
  MULTI_TABLES = 'multi_tables',
  PREDEFINED_REPORT = 'predefined_report',
}
