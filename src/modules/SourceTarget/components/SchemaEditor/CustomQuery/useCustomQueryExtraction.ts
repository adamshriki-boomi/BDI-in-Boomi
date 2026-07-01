import { useController, useFormContext, useWatch } from 'react-hook-form';
import { useCallback } from 'react';
import { DateRange, ValueDef } from 'modules/SourceTarget/store';
import { ExtractMethod } from 'api/types/rivers.types';

// Base path for custom query extraction settings
const SETTINGS_PATH = 'river.properties.source.custom_query_source_settings';

export type CustomQueryIncrementalType =
  | 'datetime'
  | 'runningnumber'
  | 'epoch'
  | 'row_version';

export interface CustomQueryExtractionSettings {
  extract_method: ExtractMethod;
  incremental_field: string;
  incremental_type: CustomQueryIncrementalType;
  date_range?: Partial<DateRange>;
  running_number?: Partial<ValueDef>;
  epoch?: Partial<ValueDef>;
  row_version?: Partial<ValueDef>;
}

/**
 * Hook for managing custom query extraction settings.
 * All values are stored at river.properties.source.custom_query_source_settings.*
 */
export function useCustomQueryExtraction() {
  const formApi = useFormContext();

  // Extract method controller (all/incremental)
  const { field: extractMethodField } = useController({
    name: `${SETTINGS_PATH}.extract_method`,
    control: formApi.control,
    defaultValue: 'all',
  });

  // Incremental field controller (user-typed column name)
  const { field: incrementalFieldField } = useController({
    name: `${SETTINGS_PATH}.incremental_field`,
    control: formApi.control,
    defaultValue: '',
  });

  // Incremental type controller (datetime/runningnumber/epoch)
  const { field: incrementalTypeField } = useController({
    name: `${SETTINGS_PATH}.incremental_type`,
    control: formApi.control,
    defaultValue: 'datetime',
  });

  // Date range controller (used by DateTimePopover which needs value/onChange)
  const { field: dateRangeField } = useController({
    name: `${SETTINGS_PATH}.date_range`,
    control: formApi.control,
  });

  // Watch running_number, epoch, and row_version values for reading
  // (Input components with api/name props handle their own state for writing)
  const runningNumberValue = useWatch({
    control: formApi.control,
    name: `${SETTINGS_PATH}.running_number`,
  });

  const epochValue = useWatch({
    control: formApi.control,
    name: `${SETTINGS_PATH}.epoch`,
  });

  const rowVersionValue = useWatch({
    control: formApi.control,
    name: `${SETTINGS_PATH}.row_version`,
  });

  // Array size controller
  useController({
    name: `${SETTINGS_PATH}.array_size`,
    control: formApi.control,
    defaultValue: 5000,
  });

  const isIncremental = extractMethodField.value === ExtractMethod.INCREMENTAL;
  const incrementalType =
    incrementalTypeField.value as CustomQueryIncrementalType;

  // Handler for changing incremental type - resets type-specific values
  const onIncrementalTypeChange = useCallback(
    (newType: CustomQueryIncrementalType) => {
      incrementalTypeField.onChange(newType);

      // Reset values for other types when switching
      if (newType === 'datetime') {
        formApi.setValue(`${SETTINGS_PATH}.running_number`, undefined);
        formApi.setValue(`${SETTINGS_PATH}.epoch`, undefined);
        formApi.setValue(`${SETTINGS_PATH}.row_version`, undefined);
      } else if (newType === 'runningnumber') {
        dateRangeField.onChange(undefined);
        formApi.setValue(`${SETTINGS_PATH}.epoch`, undefined);
        formApi.setValue(`${SETTINGS_PATH}.row_version`, undefined);
        formApi.setValue(`${SETTINGS_PATH}.date_range`, undefined);
      } else if (newType === 'epoch') {
        dateRangeField.onChange(undefined);
        formApi.setValue(`${SETTINGS_PATH}.running_number`, undefined);
        formApi.setValue(`${SETTINGS_PATH}.row_version`, undefined);
        formApi.setValue(`${SETTINGS_PATH}.date_range`, undefined);
      } else if (newType === 'row_version') {
        dateRangeField.onChange(undefined);
        formApi.setValue(`${SETTINGS_PATH}.running_number`, undefined);
        formApi.setValue(`${SETTINGS_PATH}.epoch`, undefined);
        formApi.setValue(`${SETTINGS_PATH}.date_range`, undefined);
      }
    },
    [incrementalTypeField, dateRangeField, formApi],
  );

  // Handler for updating date range
  const onDateRangeChange = useCallback(
    (value: DateRange) => {
      dateRangeField.onChange(value);
    },
    [dateRangeField],
  );

  return {
    // Form API for components that need it
    formApi,

    // Extract method
    extractMethod: extractMethodField.value as ExtractMethod,
    onExtractMethodChange: extractMethodField.onChange,
    isIncremental,

    // Incremental field (column name)
    incrementalField: incrementalFieldField.value as string,
    onIncrementalFieldChange: incrementalFieldField.onChange,

    // Incremental type
    incrementalType,
    onIncrementalTypeChange,

    // Type-specific values
    dateRange: dateRangeField.value as Partial<DateRange>,
    onDateRangeChange,

    // Read-only watched values (Input components handle their own state)
    runningNumber: runningNumberValue as Partial<ValueDef>,
    epoch: epochValue as Partial<ValueDef>,
    rowVersion: rowVersionValue as Partial<ValueDef>,

    // Settings path for direct access if needed
    settingsPath: SETTINGS_PATH,
  };
}
