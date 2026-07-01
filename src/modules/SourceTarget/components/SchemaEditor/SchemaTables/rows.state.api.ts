import { IReport, IReportRow, ITable } from 'modules/SourceTarget/store';
import { useTableField } from '../../form';
import { ITableRow } from './components/TableCells';

export type RowsState = Record<string, RowState>;

export type RowState = {
  tableEdit?: boolean;
  tableTargetEdit?: boolean;
};

export const useGetSchemaTable = (original, source, isPredefined) => {
  const isBlueprint = source?.includes('blueprint');
  const tableName = isPredefined ? `${original?.report_id}` : original?.id;
  const schemaName =
    isPredefined || isBlueprint ? 'no_schema' : original?.schema_name;
  return { schemaName, tableName };
};

export const useIsTableSelected = (
  table: ITableRow<ITable> | IReportRow<IReport>,
) => {
  const { original } = table.row;
  const { source, isPredefined } = table.column.getProps.riverProperties;

  const { schemaName, tableName } = useGetSchemaTable(
    original,
    source,
    isPredefined,
  );
  const apiSchemaName = isPredefined ? 'no_schema' : schemaName;
  const apiTableName = isPredefined
    ? (original as IReport).report_id
    : tableName;
  const { value } = useTableField(apiSchemaName, apiTableName);
  const visibleName = isPredefined
    ? (original as IReport).report_name
    : tableName;

  return { visibleName, isSelected: value?.is_selected, schemaName };
};
