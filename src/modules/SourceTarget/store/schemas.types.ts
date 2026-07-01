export interface ItemsResponse<ItemType> {
  next_page: string;
  previous_page: string;
  page: number;
  current_page_size: number;
  total_items: number;
  account_id: string;
  connection_id: string;
  items: ItemType[];
}
export interface SchemasResponse extends ItemsResponse<SchemaItem> {}

export interface SchemaItem {
  name: string;
  display_name: string | null;
  tables_count: number;
  database_properties: SchemaProperties;
}

type SchemaType =
  | 'vertica'
  | 'sap_hana'
  | 'postgres_rds'
  | 'oracle'
  | 'mysql'
  | 'mariadb'
  | 'mssql'
  | 'azure_sql'
  | 'athena'
  | 'redshift_src'
  | 'teradata'
  | 'salesforce'
  | 'netsuite_analytics';
export interface SchemaProperties {
  name: string;
  type: SchemaType;
}

export interface TablesResponse extends ItemsResponse<ITable> {}
export interface ITable {
  id: string;
  increment_columns: IncrementColumn[];
  updated_at: string;
  schema_name: string;
  database_properties: DatabaseProperties;
  no_increment?: boolean | null;
  increment_required?: boolean | null;
  increment_defaults?: Record<string, any> | null;
  object_type?: string | null;
  resolved_object_type?: string | null;
}

export interface DatabaseProperties {
  name: string;
  type: string;
}

export type IntervalTypes =
  | 'datetime'
  | 'runningnumber'
  | 'epoch'
  | 'row_version'
  | 'date';
export interface IncrementColumn {
  name: string;
  type: 'INTEGER' | 'TIMESTAMP' | 'DATE' | 'FLOAT' | 'STRING' | 'DATETIME';
  incremental_type: IntervalTypes;
  is_default: boolean;
  is_custom?: boolean;
}

export interface IReportRow<OriginalType> extends Record<string, any> {
  row: Record<string, any> & { original: OriginalType };
}

export interface IReport extends ITable {
  datasource_id: string;
  no_increment: boolean;
  predefined_params: Record<string, any>;
  report_id: string;
  report_name: string;
  user_params: any[];
  blueprintId?: string;
}

export interface ReportsResponse extends ItemsResponse<IReport> {}
