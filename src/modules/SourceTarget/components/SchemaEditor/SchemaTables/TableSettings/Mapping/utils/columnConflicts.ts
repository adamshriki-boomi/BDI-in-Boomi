import { IModifiedColumn } from 'modules/SourceTarget/store';
import { IMappingItem } from '../types';

export interface ConflictDetectionResult {
  calculatedColumns: IModifiedColumn[];
  conflictedColumns: IModifiedColumn[];
  nonConflictedColumns: IModifiedColumn[];
}

const PROPERTIES_TO_COMPARE: Array<keyof IModifiedColumn> = [
  'type',
  'length',
  'precision',
  'scale',
  'mode',
];

/**
 * Detects conflicts between current columns and fresh metadata columns.
 * Calculated columns are always preserved and excluded from conflict detection.
 *
 * @param currentColumns - All current columns (from useCombinedColumns)
 * @param freshMetadata - Fresh metadata columns from the database
 * @returns Object containing calculated, conflicted, and non-conflicted columns
 */
export function detectColumnConflicts(
  currentColumns: (IModifiedColumn | IMappingItem)[],
  freshMetadata: IMappingItem[],
): ConflictDetectionResult {
  const calculatedColumns: IModifiedColumn[] = [];
  const conflictedColumns: IModifiedColumn[] = [];
  const nonConflictedColumns: IModifiedColumn[] = [];

  // Create a map of fresh metadata by column name for quick lookup
  const freshMetadataMap = new Map<string, IMappingItem>();
  freshMetadata.forEach(column => {
    freshMetadataMap.set(column.name, column);
  });

  currentColumns.forEach(currentColumn => {
    // Check if this is a calculated column
    const isCalculated = Boolean(
      (currentColumn as IModifiedColumn).calculated_column_mode,
    );

    // Always preserve calculated columns
    if (isCalculated) {
      calculatedColumns.push(currentColumn as IModifiedColumn);
      return;
    }

    // Find corresponding fresh metadata column
    const freshColumn = freshMetadataMap.get(currentColumn.name);

    // If column doesn't exist in fresh metadata, skip it
    // (it will be removed naturally by not being in modified_columns)
    if (!freshColumn) {
      return;
    }

    // Compare properties to detect conflicts
    const hasConflict = PROPERTIES_TO_COMPARE.some(property => {
      const currentValue = currentColumn[property];
      const freshValue = freshColumn[property];

      // Skip comparison if both values are undefined/null
      if (currentValue == null && freshValue == null) {
        return false;
      }

      return currentValue !== freshValue;
    });

    if (hasConflict) {
      conflictedColumns.push(currentColumn as IModifiedColumn);
    } else {
      nonConflictedColumns.push(currentColumn as IModifiedColumn);
    }
  });

  return {
    calculatedColumns,
    conflictedColumns,
    nonConflictedColumns,
  };
}
