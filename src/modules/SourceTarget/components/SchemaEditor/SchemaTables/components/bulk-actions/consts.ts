import {
  FilterColumn,
  FilterType,
} from 'layout/Sidebar/components/RiveryFilterBuilder/consts';
import { extractionMethods } from 'modules/SourceTarget/components/SchemaEditor/SchemaTables/TableSettings/TableSource/ExtractMethods';
import { RelevantLoadingOptions } from 'modules/SourceTarget/components/SelectDataTarget/DataTargetDefinitions/commonTargetDefinitions';

export enum BulkActionsTabs {
  SELECT_TABLES = 'Select Tables',
  BULK_ACTIONS = 'Bulk Actions',
  SUMMARY_CONFIRMATION = 'Summary & Confirmation',
}

export enum BulkTableSelectionTypeLabels {
  SPECIFIC = 'Specific tables',
  SCHEMAS = 'All tables within the selected schema',
  CONDITIONS = 'Specific tables based on conditions',
  ALL = 'All tables',
}

export enum BulkTableSelectionTypeValues {
  SPECIFIC = 'specific',
  SCHEMAS = 'schemas',
  CONDITIONS = 'conditions',
  ALL = 'all',
}

export enum BulkExtractMethodStandardLabels {
  KEEP = 'Keep Original Settings',
  ALL = 'Set to ‘All’',
  INCREMENTAL = 'Set to ‘Incremental’ Using a Common Incremental Field',
  TIME = 'Set a Time Period for Tables that Use a Timestamp or Date-Based Incremental Field',
}

export enum BulkExtractMethodStandardValues {
  KEEP = 'keep',
  ALL = 'all',
  INCREMENTAL = 'incremental',
  TIME = 'time',
}

export enum BulkCDCExtractionModeLabels {
  OVERWRITE = 'Overwrite the existing Target Table with the initial migration results.',
  MERGE = 'Merge the Initial migration results into the Target Table, if exists.',
}

export enum BulkCDCExtractionModeValues {
  OVERWRITE = 'overwrite',
  MERGE = 'merge',
}

export enum BulkStandardLoadingModeLabels {
  KEEP = 'Keep Original Settings',
  DEFAULT = 'Set Loading Mode',
}

export enum BulkStandardLoadingModeValues {
  KEEP = 'keep',
  DEFAULT = 'default',
}

export enum BulkStandardLoadingModeMethodLabels {
  MERGE = 'Upsert Merge',
  APPEND = 'Append Only',
  OVERWRITE = 'Overwrite',
}

export enum BulkStandardLoadingModeMethodValues {
  MERGE = 'merge',
  APPEND = 'append',
  OVERWRITE = 'overwrite',
}

export enum BulkStandardLoadingMergeMethodLabels {
  SWITCH_TABLES = 'Switch - Merge',
  DELETE_INSERT = 'Delete - Insert',
  MERGE = 'Merge',
}

export enum BulkStandardLoadingMergeMethodValues {
  SWITCH_TABLES = 'switch_tables',
  DELETE_INSERT = 'delete_insert',
  MERGE = 'merge',
}

export enum bulkFilterColumns {
  TABLE_NAME = 'tableName',
  EXTRACT_METHOD = 'extractMethod',
  LOADING_MODE = 'loadingMode',
}

export interface BulkFilterItem {
  schema: string;
  [bulkFilterColumns.TABLE_NAME]: string;
  [bulkFilterColumns.EXTRACT_METHOD]: string;
  [bulkFilterColumns.LOADING_MODE]: string;
  isFilteredIn: boolean;
}

export const getBulkFilterColumns = (): FilterColumn[] => [
  {
    value: bulkFilterColumns.TABLE_NAME,
    label: 'Table Name',
    type: FilterType.STRING,
  },
  {
    value: bulkFilterColumns.EXTRACT_METHOD,
    label: 'Extract Method',
    type: FilterType.IS,
    isStatic: true,
    staticValue: 'is',
    values: extractionMethods,
  },
  {
    value: bulkFilterColumns.LOADING_MODE,
    label: 'Loading Mode',
    type: FilterType.IS,
    values: RelevantLoadingOptions(),
  },
];

export function mapValueToLabel(
  enum1: Record<string, string>,
  enum2: Record<string, string>,
  value: string,
): string {
  const key = Object.keys(enum1).find(
    key => enum1[key as keyof typeof enum1] === value,
  );
  if (key) {
    return enum2[key as keyof typeof enum2];
  }
  return 'No matching value found';
}
