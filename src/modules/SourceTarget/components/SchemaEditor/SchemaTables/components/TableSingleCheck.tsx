import { RiveryCheckbox } from 'components/Form';
import { validateRiverTables } from 'containers/River/new/source-to-target/components/riverValidation';
import {
  useGetRiverCommonProps,
  useIsBlueprint,
  useSttFormContext,
  useTableField,
} from 'modules/SourceTarget/components/form';
import { IReport, ISelectedTable, ITable } from 'modules/SourceTarget/store';
import { useCallback } from 'react';
import { useWatch } from 'react-hook-form';
import { useEffectOnce } from 'react-use';
import { useGetSchemaTable } from '../rows.state.api';
import {
  useErrorToastForTablesValidation,
  useReachedTablesLimit,
} from './TableLimitMessage';
import { useIsInNewS2TRiver } from 'modules/RiverRightBar';
import { useAccount } from 'store/core';
import { ExtractMethod } from 'api/types';

type TableSingleCheckProps = {
  row: {
    original: ITable | IReport;
  };
  column: { getProps };
  data?: any[];
};

export function defineNewTable(
  tableName: string,
  isPredefinedReport: boolean,
  isNotStandard: boolean,
  reportData: IReport,
  schemaName: string = 'no_schema',
  blueprintSourceInterfaceParams: any[] | null = null,
) {
  const baseTable: any = { is_selected: true, schemaName };
  const seed = blueprintSourceInterfaceParams?.length
    ? {
        additional_source_settings: {
          interface_parameters: { source: blueprintSourceInterfaceParams },
        },
      }
    : {};
  if (isPredefinedReport) {
    return {
      ...baseTable,
      report_id: tableName,
      target_table: `${reportData?.datasource_id}_${reportData?.report_name}`,
      extract_method: reportData?.increment_required
        ? ExtractMethod.INCREMENTAL
        : ExtractMethod.ALL,
      incremental_field: reportData?.increment_columns?.[0]?.name,
    };
  }
  if (isNotStandard) {
    return {
      ...baseTable,
      name: tableName,
      target_table: tableName,
      ...seed,
    };
  }
  return {
    ...baseTable,
    name: tableName,
    target_table: tableName,
    extract_method: reportData?.increment_required
      ? ExtractMethod.INCREMENTAL
      : ExtractMethod.ALL,
    ...seed,
  };
}

export function TableSingleCheck({
  row: { original },
  column: { getProps },
  data,
}: TableSingleCheckProps) {
  const triggerTablesWarning = useErrorToastForTablesValidation();
  const form = useSttFormContext();
  const { isNotStandard } = useGetRiverCommonProps();
  const isBlueprint = useIsBlueprint();
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
  const onChange = useCallback(async () => {
    const isSelected = !Boolean(isChecked);
    let newTable: ISelectedTable | false;

    if (isSelected) {
      // If re-selecting and table already has data, preserve it
      if (value && typeof value === 'object' && !value.is_selected) {
        newTable = { ...value, is_selected: true } as ISelectedTable;
      } else {
        // First time selecting, create new table
        const blueprintSourceInterfaceParams = isBlueprint
          ? form.getValues(
              'river.properties.source.additional_settings.interface_parameters.source',
            ) ?? null
          : null;
        newTable = {
          ...defineNewTable(
            tableName,
            isPredefined,
            isNotStandard,
            original as IReport,
            schemaName,
            blueprintSourceInterfaceParams,
          ),
        } as ISelectedTable;
      }
    } else {
      // Deselecting, preserve all data
      newTable = { ...value, is_selected: false } as ISelectedTable;
    }
    const validationErrors = await validateRiverTables(schemas, schemaName, [
      tableName,
    ]);
    if (!validationErrors) {
      const limitTableSelection = isSettingOn('max_selected_tables');
      if (
        currentTablesLength + 1 > limitTableSelection &&
        shouldLimit &&
        isSelected
      ) {
        triggerTablesWarning();
        return;
      }
      update(newTable);
    } else {
      triggerTablesWarning('Error', validationErrors, false);
    }
  }, [
    isChecked,
    schemas,
    schemaName,
    tableName,
    value,
    isBlueprint,
    form,
    isPredefined,
    isNotStandard,
    original,
    isSettingOn,
    currentTablesLength,
    shouldLimit,
    update,
    triggerTablesWarning,
  ]);
  const isNewRiver = useIsInNewS2TRiver();
  useEffectOnce(() => {
    if (getProps?.isBlueprint && isNewRiver) {
      if (data?.length === 1 && !isChecked) {
        onChange();
      }
    }
  });
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
