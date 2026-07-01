import { IReport, ISelectedTable, ITable } from 'modules/SourceTarget/store';
import { useCallback } from 'react';
import { FieldPath, useForm, useFormContext } from 'react-hook-form';

type TableSettingsForm = {
  table: ISelectedTable;
  definitions: ITable | IReport;
  connectionId: string;
  blueprintId?: string;
};

export const useTableSettingsForm = config => {
  return useForm<TableSettingsForm>({
    ...config,
  });
};
export const useTableSettingsFormContext = () =>
  useFormContext<TableSettingsForm>();

export const useTableDefinition = <T = unknown>(path: FieldPath<ITable>) => {
  const { setValue, watch } = useTableSettingsFormContext();
  const fullPath = `definitions.${path}` as FieldPath<TableSettingsForm>;
  const value = watch(fullPath) as T;
  const update = useCallback(
    (data: T) => {
      setValue(fullPath, data, {
        shouldDirty: true,
        shouldValidate: true,
        shouldTouch: true,
      });
    },
    [setValue, fullPath],
  );
  return { value, update };
};

export const useTableSettings = <T = unknown>(
  path: FieldPath<ISelectedTable>,
) => {
  const { setValue, watch } = useTableSettingsFormContext();
  const fullPath = `table.${path}` as FieldPath<TableSettingsForm>;
  const value = watch(fullPath as any) as T;

  const update = useCallback(
    (data: T) => {
      setValue(fullPath, data);
    },
    [setValue, fullPath],
  );
  return { value, update };
};

export function initiateMongoTableSettings(value) {
  const tableSourceSettings = value?.additional_source_settings;
  if (!tableSourceSettings || !tableSourceSettings?.mapping_settings_type) {
    return {
      additional_source_settings: {
        ...(tableSourceSettings ? tableSourceSettings : {}),
        mapping_settings_type: 'mapping_number_of_records',
        chunk_size_type: 'dynamic',
        mapping_num_of_records: 100,
        mapping_records_order: 'Last',
        max_results_file: 300000,
        concurrent_requests_number: 1,
      },
    };
  }
}
