import { IModifiedColumn } from 'modules/SourceTarget/store';
import { compare } from 'utils/array.utils';
import { useTableSettings } from '../../form.hooks';
import { createModifiedColumn } from '../utils';
import { useCombinedColumns } from './useCombinedColumns';
import { TargetTypesV1 } from 'api/types';
import { useMainFormColumnsDefinitions } from 'modules/SourceTarget/components/form';

export type IColumnsMap = Map<string, IModifiedColumn>;

/**
 * expose an api object for: map of IModifiedColumn from the river, onChange function to update a column on river based on column name
 */
export const useModifiedColumns = () => {
  const { targetType } = useMainFormColumnsDefinitions();
  const modifiedColumns =
    useTableSettings<IModifiedColumn[]>('modified_columns');
  const modifiedColumnsMap: IColumnsMap = (
    modifiedColumns.value as any
  )?.reduce((map, value) => {
    map.set(value.name, value);
    return map;
  }, new Map<string, IModifiedColumn>());

  const [allColumns] = useCombinedColumns(modifiedColumnsMap, null, null);

  /**
   * if "source", an "order" prop should be added accroding to the latest order value that exists
   */
  const addOne = (column: IModifiedColumn) => {
    const shouldAddOrder = column?.calculated_column_mode === 'source';
    const normalizedColumn = shouldAddOrder
      ? createColumnWithNextOrder(column, modifiedColumns?.value)
      : column;
    modifiedColumns.update(modifiedColumns.value.concat(normalizedColumn));
  };
  const updateOne = (
    columns: IModifiedColumn[],
    sourceName: string,
    props: Partial<IModifiedColumn>,
  ) => {
    const columnIndex = columns.findIndex(compare('name', sourceName));
    //These extra fields are returned from columns
    const {
      column_db_type,
      is_default_increment_column,
      updated_at,
      can_increment,
      length,
      ...restProps
    } = props as any;
    const newColumn = conditional(
      () =>
        assigner(columns[columnIndex], {
          ...restProps,
          //Only redshift & synapse target are allowed to modify column length
          ...([TargetTypesV1.REDSHIFT, TargetTypesV1.AZURE_SQL_DWH].includes(
            targetType,
          )
            ? { length }
            : {}),
        }),
      () =>
        createModifiedColumn({
          name: sourceName,
          alias: Boolean(props?.alias) ? props.alias : sourceName,
          //Only redshift & synapse target are allowed to modify column length
          ...([TargetTypesV1.REDSHIFT, TargetTypesV1.AZURE_SQL_DWH].includes(
            targetType,
          )
            ? { length }
            : {}),
          ...restProps,
        }),
      isValidArrayIndex(columnIndex),
    );
    const newColumns = conditionalInvoker(
      replace,
      push,
      isValidArrayIndex(columnIndex),
    )(newColumn, columns, columnIndex);
    return newColumns;
  };

  const updateColumn = (
    sourceName: string,
    props: Partial<IModifiedColumn>,
  ) => {
    const newColumns = updateOne(modifiedColumns.value, sourceName, props);
    modifiedColumns.update(newColumns);
  };

  const updateMany = (sources: string[], props: Partial<IModifiedColumn>) => {
    const newColumns = sources.reduce(
      (columns, sourceName) => updateOne(columns, sourceName, props),
      modifiedColumns.value,
    );
    modifiedColumns.update(newColumns);
  };

  const updateSortOrderByIndex = (sources: string[]) => {
    updateSortOrderMany(sources, 1);
  };

  const updateSortOrderMany = (sources: string[], nextIndex: number) => {
    const newColumns = sources.reduce(
      (columns, sourceName, index) =>
        updateOne(columns, sourceName, {
          sort_order: nextIndex + index,
        }),
      modifiedColumns.value,
    );
    modifiedColumns.update(newColumns);
  };

  const updateClusterKeyByIndex = (sources: string[]) => {
    updateClusterKeyMany(sources, 1);
  };

  const updateClusterKeyMany = (sources: string[], nextIndex: number) => {
    const newColumns = sources.reduce((columns, sourceName, index) => {
      const column = allColumns?.find(compare('name', sourceName));
      return updateOne(columns, sourceName, {
        ...column,
        cluster_key: nextIndex + index,
      });
    }, modifiedColumns.value);

    modifiedColumns.update(newColumns);
  };

  const updateClusterIndexByOrder = (mappingOrder: string[]) => {
    const columnsWithNullIndex = modifiedColumns.value.map(column => ({
      ...column,
      cluster_index: null,
    }));

    const newColumns = mappingOrder.reduce((columns, sourceName, index) => {
      const column = allColumns?.find(compare('name', sourceName));
      return updateOne(columns, sourceName, {
        ...column,
        cluster_index: index + 1,
      });
    }, columnsWithNullIndex);

    modifiedColumns.update(newColumns);
  };

  const removeColumn = (name: string) => {
    modifiedColumns.update(
      modifiedColumns.value.filter(value => value.name !== name),
    );
  };

  const updateManyWithIndividualProps = (
    updates: Array<{ name: string; props: Partial<IModifiedColumn> }>,
  ) => {
    const newColumns = updates.reduce(
      (columns, { name, props }) => updateOne(columns, name, props),
      modifiedColumns.value,
    );
    modifiedColumns.update(newColumns);
  };

  return {
    modifiedColumnsMap,
    addOne,
    updateColumn,
    removeColumn,
    updateMany,
    updateManyWithIndividualProps,
    updateSortOrderMany,
    updateSortOrderByIndex,
    updateClusterKeyMany,
    updateClusterKeyByIndex,
    updateClusterIndexByOrder,
  };
};

/// Functional Utils Joy ///
const conditional = (returnTrue, returnFalse, condition: boolean) => {
  return condition ? invoke(returnTrue) : invoke(returnFalse);
};
// invokes the result only
const conditionalInvoker =
  (returnTrue: Function, returnFalse: Function, condition: boolean) =>
  (...rest) => {
    return condition
      ? returnTrue.apply(returnTrue, rest)
      : returnFalse.apply(returnFalse, rest);
  };
const push = (item, arr = []) => [item, ...arr];
const replace = (item, arr: any[], indexToReplace: number) => {
  return arr.map((oldItem, index) =>
    conditional(item, oldItem, index === indexToReplace),
  );
};
const isValidArrayIndex = (index: number) => index > -1;
const assigner = (...rest) =>
  rest.reduce((result, item) => ({ ...result, ...item }), {});
const invoke = func => (typeof func === 'function' ? func() : func);

const ORDER_START_VALUE = 1;
const createColumnWithNextOrder = (
  column: IModifiedColumn,
  columns: IModifiedColumn[],
) => {
  const ordered = columns.filter(compare('calculated_column_mode', 'source'));
  const lastOrdered = ordered[ordered.length - 1];
  const latestOrderValue = lastOrdered?.order
    ? lastOrdered?.order + 1
    : ORDER_START_VALUE;
  return { ...column, order: latestOrderValue };
};
