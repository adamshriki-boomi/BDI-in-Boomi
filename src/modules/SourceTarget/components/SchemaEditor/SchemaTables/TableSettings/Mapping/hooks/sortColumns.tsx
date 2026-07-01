import { IModifiedColumn } from 'modules/SourceTarget/store';
import { compareNumericItems } from 'utils/array.utils';

// // display order -> none calculated, target, source (sort by order)
export const sortColumns = (combinedColumns: any[]) => {
  const nonCalculated = combinedColumns.filter(
    (column: IModifiedColumn) => !Boolean(column?.calculated_column_mode),
  );
  const targetolumns = combinedColumns.filter(
    (column: IModifiedColumn) => column?.calculated_column_mode === 'target',
  );
  const sourceColumns = combinedColumns
    .filter(
      (column: IModifiedColumn) => column?.calculated_column_mode === 'source',
    )
    .sort((a: IModifiedColumn, b: IModifiedColumn) =>
      compareNumericItems(a?.order, b?.order),
    );
  return [...nonCalculated, ...targetolumns, ...sourceColumns];
};
