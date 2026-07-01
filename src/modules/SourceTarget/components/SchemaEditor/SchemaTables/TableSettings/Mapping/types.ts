import { ItemsResponse } from 'modules/SourceTarget/store';

export interface IMappingItem {
  is_key?: boolean;
  is_sort_key?: boolean;
  sort_order?: number;
  name: string;
  type: string;
  // type: MappingItemType;
  is_selected?: boolean;
  report?: string;
  fields?: any[];
  datasource_id?: string;
  length?: number;
  is_dist_key?: boolean;
  precision?: number;
  scale?: number;
  order?: number;
}
export type MappingItemType =
  | 'INTEGER'
  | 'TIMESTAMP'
  | 'DATE'
  | 'FLOAT'
  | 'STRING'
  | 'DATETIME'
  | 'BOOLEAN'
  | 'RECORD'
  | 'VARCHAR'
  | 'SMALLINT'
  | 'BIGINT'
  | 'OBJECT'
  | 'NUMBER'
  | 'VARIANT'
  | 'JSON'
  | 'TEXT'
  | 'TIME'
  | 'TINYINT';

export interface ColumnsResponse extends ItemsResponse<IMappingItem> {
  connection_id: string;
}
