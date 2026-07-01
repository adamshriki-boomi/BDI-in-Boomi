import { RiveryCheckbox } from 'components/Form';
import {
  deriveExtractFromInterfaceParams,
  getCachedReportParams,
} from 'containers/BluePrints/helpers';
import { validateRiverTables } from 'containers/River/new/source-to-target/components/riverValidation';
import {
  useSttFormContext,
  useTableField,
} from 'modules/SourceTarget/components/form';
import { IReport, ISelectedTable } from 'modules/SourceTarget/store';
import { useCallback } from 'react';
import { useWatch } from 'react-hook-form';
import { useAccount } from 'store/core';
import { useGetSchemaTable } from '../SchemaTables/rows.state.api';
import {
  useErrorToastForTablesValidation,
  useReachedTablesLimit,
} from '../SchemaTables/components/TableLimitMessage';

type BlueprintSingleCheckProps = {
  row: { original: IReport };
  column: { getProps };
};

function buildSelectedReportTable(
  reportName: string,
  schemaName: string,
  blueprintSourceInterfaceParams: any[] | null,
  reportInterfaceParams: any,
): ISelectedTable {
  const derived = deriveExtractFromInterfaceParams(reportInterfaceParams);
  return {
    is_selected: true,
    schemaName,
    name: reportName,
    target_table: reportName,
    ...(blueprintSourceInterfaceParams?.length && {
      additional_source_settings: {
        interface_parameters: { source: blueprintSourceInterfaceParams },
      },
    }),
    ...derived,
  } as any;
}

export function BlueprintSingleCheck({
  row: { original },
  column: { getProps },
}: BlueprintSingleCheckProps) {
  const triggerTablesWarning = useErrorToastForTablesValidation();
  const form = useSttFormContext();
  const { isSettingOn } = useAccount();
  const schemas = useWatch({
    control: form.control,
    name: 'river.properties.schemas',
  });
  const { source, isPredefined } = getProps.riverProperties;
  const { currentTablesLength, shouldLimit } = useReachedTablesLimit(schemas);
  const { schemaName, tableName } = useGetSchemaTable(
    original,
    source,
    isPredefined,
  );
  const { value, update } = useTableField(schemaName, tableName);
  const isChecked = Boolean(value?.is_selected);
  const blueprintId = form?.watch(
    'river.properties.source.additional_settings.recipe_id',
  );

  const onChange = useCallback(async () => {
    const isSelected = !isChecked;
    let newTable: ISelectedTable;

    if (isSelected) {
      const validationErrors = await validateRiverTables(schemas, schemaName, [
        tableName,
      ]);
      if (validationErrors) {
        triggerTablesWarning('Error', validationErrors, false);
        return;
      }
      const limitTableSelection = isSettingOn('max_selected_tables');
      if (currentTablesLength + 1 > limitTableSelection && shouldLimit) {
        triggerTablesWarning();
        return;
      }
      // Re-select an existing row without rebuilding
      if (value && typeof value === 'object' && !value.is_selected) {
        update({ ...value, is_selected: true } as ISelectedTable);
        return;
      }
      const cachedParams = getCachedReportParams(blueprintId, tableName);
      const blueprintValue: any = form.getValues('blueprint' as any);
      const legacyDateRange = blueprintValue?.date_range;
      const reportInterfaceParams = legacyDateRange?.name
        ? { ...(cachedParams ?? {}), date_range: legacyDateRange }
        : cachedParams;
      const blueprintSourceInterfaceParams =
        form.getValues(
          'river.properties.source.additional_settings.interface_parameters.source',
        ) ?? null;
      newTable = buildSelectedReportTable(
        tableName,
        schemaName,
        blueprintSourceInterfaceParams,
        reportInterfaceParams,
      );
      update(newTable);
      return;
    }
    update({ ...value, is_selected: false } as ISelectedTable);
  }, [
    isChecked,
    schemas,
    schemaName,
    tableName,
    value,
    isSettingOn,
    currentTablesLength,
    shouldLimit,
    update,
    triggerTablesWarning,
    blueprintId,
    form,
  ]);

  return (
    <RiveryCheckbox
      aria-label={`select table ${tableName}`}
      name={`${schemaName}.${tableName}.is_selected`}
      label={null}
      isChecked={isChecked}
      onChange={onChange}
    />
  );
}
