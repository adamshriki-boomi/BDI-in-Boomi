import { IModifiedColumn } from 'modules/SourceTarget/store';
import { useCallback } from 'react';
import { useColumns } from '../hooks/useColumns';
import { IMappingItem } from '../types';
import { sortColumns } from './sortColumns';
import type { IColumnsMap } from './useModifiedColumns';

/**
 * creates a combination of modified columns and metadata columns
 * NOTE: a column that has modified entry is not included in the combined result (no duplciates)
 * @divisionProp if exists, it divides the combined result to 2 arrays: with and without the prop
 * @example
 *  const [combinedColumns, withSort, withoutSort] useCombinedColumns(api, 'sort_order)
 */

export const useCombinedColumns = (
  columnsMap: IColumnsMap,
  divisionProp?: keyof IModifiedColumn | keyof IMappingItem,
  filterExpression?: string,
) => {
  const { columns: metaColumns } = useColumns();
  const order = metaColumns?.map(column => column.name);

  const customModifiedColumns = [...columnsMap?.values()];

  const filteredMetaColumns = metaColumns?.filter(
    column => !columnsMap?.has(column.name),
  );
  ///Make sure the order is kept in the table and the rows don't get mixed up
  const combinedColumns = [
    ...filteredMetaColumns,
    ...customModifiedColumns,
  ].sort((a, b) => order.indexOf(a.name) - order.indexOf(b.name));

  const withoutProp = divisionProp
    ? combinedColumns.filter(item => !Boolean((item as any)?.[divisionProp]))
    : [];
  const withProp = divisionProp
    ? combinedColumns.filter(item => Boolean((item as any)?.[divisionProp]))
    : [];

  const filterByName = useCallback(
    arr =>
      filterExpression
        ? arr.filter(({ name }) => name.includes(filterExpression))
        : arr,
    [filterExpression],
  );
  const allColumns = sortColumns(combinedColumns);
  return [allColumns, withProp, filterByName(withoutProp)];
};
