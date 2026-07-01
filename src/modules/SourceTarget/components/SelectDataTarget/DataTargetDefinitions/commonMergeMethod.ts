import { storageTargets, TargetTypesV1 } from 'api/types';

export interface IMergeMethod {
  label: string;
  value: EMergeOptions;
  description: string;
}

export const getMergeMethods = (target: TargetTypesV1): IMergeMethod[] => {
  const targetMappings: Partial<Record<TargetTypesV1, IMergeMethod[]>> = {
    [TargetTypesV1.BIG_QUERY]: [
      MergeMethodMerge,
      MergeMethodSwitchMerge,
      MergeMethodDeleteInsert,
    ],
    [TargetTypesV1.SNOWFLAKE]: [
      MergeMethodMerge,
      MergeMethodSwitchMerge,
      MergeMethodDeleteInsert,
    ],
    [TargetTypesV1.ONELAKE]: [
      MergeMethodSwitchMerge,
      MergeMethodDeleteInsert,
      MergeMethodMerge,
    ],
    [TargetTypesV1.POSTGRES]: [
      MergeMethodDeleteInsert,
      MergeMethodInsertOnConflict,
    ],
    [TargetTypesV1.DATABRICKS]: [MergeMethodSwitchMerge, MergeMethodMerge],
    [TargetTypesV1.REDSHIFT]: [
      MergeMethodSwitchMerge,
      MergeMethodDeleteInsert,
      MergeMethodMerge,
    ],
    [TargetTypesV1.AZURE_SQL_DWH]: [MergeMethodSwitchMerge],
    [TargetTypesV1.ATHENA]: [],
    [TargetTypesV1.AZURE_SQL]: [MergeMethodMerge, MergeMethodDeleteInsert],
    [TargetTypesV1.KNOWLEDGE_HUB]: [MergeMethodDeleteInsert],
  };

  const methods = targetMappings[target];
  if (!methods && !storageTargets.includes(target)) {
    throw new Error(`Unsupported target type: ${target}`);
  }

  return methods;
};

enum EMergeOptions {
  SWITCH_TABLES = 'switch_tables',
  DELETE_INSERT = 'delete_insert',
  MERGE = 'merge',
  INSERT_ON_CONFLICT = 'insert_on_conflict',
}

const MergeMethodSwitchMerge = {
  label: 'Switch - Merge',
  value: EMergeOptions.SWITCH_TABLES,
  description:
    'This method switches the entire table with new merged data using matched keys. Using this method provides the best performance for most cases, but scans the entire table data in every load',
};

const MergeMethodDeleteInsert = {
  label: 'Delete - Insert',
  value: EMergeOptions.DELETE_INSERT,
  description:
    'This method deletes existing rows (when keys match between new and existing data) and inserts new data. Using this merge method does not preserve any key duplication',
};

const MergeMethodMerge = {
  label: 'Merge',
  value: EMergeOptions.MERGE,
  description:
    'This method inserts new rows when they do not yet exist in the Target, and updates existing rows by MERGE clause. Duplications in the data may raise an error',
};

const MergeMethodInsertOnConflict = {
  label: 'Insert On Conflict',
  value: EMergeOptions.INSERT_ON_CONFLICT,
  description:
    'This method uses INSERT INTO and ON CONFLICT clauses based on primary keys selected in the table mapping.',
};
