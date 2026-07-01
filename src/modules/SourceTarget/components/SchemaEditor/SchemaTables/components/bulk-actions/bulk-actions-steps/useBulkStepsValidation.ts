import {
  BulkExtractMethodStandardValues,
  BulkStandardLoadingModeValues,
  BulkTableSelectionTypeValues,
} from '../consts';
import { BulkForm } from 'modules/SourceTarget/components/SchemaEditor/SchemaTables/components/bulk-actions/hooks';
import { UseFormReturn } from 'react-hook-form';

export const useBulkStepsValidation = (
  currentStep: number,
  form: UseFormReturn<BulkForm>,
) => {
  const formData = form?.watch();

  switch (currentStep) {
    case 0: {
      return {
        0: true,
        1: isTableSelectionValid(formData),
        2: false,
      };
    }
    case 1: {
      return {
        0: true,
        1: true,
        2: hasAtListOneBulkAction(formData),
      };
    }
    case 2: {
      return {
        0: true,
        1: true,
        2: true,
      };
    }
    default:
      return null;
  }
};

const isTableSelectionValid = (formData: BulkForm) => {
  const selectedTablesType = formData?.selectionType;
  switch (selectedTablesType) {
    case BulkTableSelectionTypeValues.ALL:
      return true;
    case BulkTableSelectionTypeValues.SCHEMAS:
      return Boolean(formData?.selectedSchemas?.length);
    case BulkTableSelectionTypeValues.SPECIFIC:
      const specificTables = formData?.specificTables;
      return (
        Object.keys(specificTables).length === 0 ||
        Object.values(specificTables)
          .flatMap(parent => Object.values(parent))
          .some(Boolean)
      );
    case BulkTableSelectionTypeValues.CONDITIONS:
      const filteredTables = formData?.filteredTables;
      return Object.values(filteredTables)
        .flatMap(parent => Object.values(parent))
        .some(Boolean);
    default:
      return false;
  }
};

const hasAtListOneBulkAction = (formData: BulkForm) => {
  const isCDC = formData?.isCDC;
  if (isCDC) {
    if (
      !formData?.actions?.initialMigration &&
      !formData?.actions?.newCalculatedColumns?.length &&
      formData?.actions?.loadingMode === BulkStandardLoadingModeValues.KEEP
    ) {
      return false; // No bulk actions selected
    }
  }
  if (!isCDC) {
    if (
      formData?.actions?.extractMethod ===
        BulkExtractMethodStandardValues.KEEP &&
      formData?.actions?.loadingMode === BulkStandardLoadingModeValues.KEEP &&
      !formData?.actions?.newCalculatedColumns?.length
    ) {
      return false; // No bulk actions selected
    }
  }
  return (
    isValidStandardLoadingMode(formData) &&
    isValidStandardExtractMethod(formData)
  );
};

const isValidStandardLoadingMode = (formData: BulkForm) => {
  const loadingMode = formData?.actions?.loadingMode;
  switch (loadingMode) {
    case BulkStandardLoadingModeValues.DEFAULT:
      return Boolean(
        formData?.actions?.loadingMethod &&
          (formData.actions.loadingMethod !== 'merge' ||
            formData?.actions?.mergeMethod),
      );
    default: // Keep
      return true;
  }
};

const isValidStandardExtractMethod = (formData: BulkForm) => {
  const extractMethod = formData?.actions?.extractMethod;
  switch (extractMethod) {
    case BulkExtractMethodStandardValues.INCREMENTAL:
      const hasIncrementalField = formData?.table?.incremental_field;
      const incrementalType = formData?.table?.incremental_type;

      if (!hasIncrementalField || !incrementalType) {
        return false;
      }

      const hasValidRunningNumber =
        formData?.table?.running_number?.start_value != null &&
        formData?.table?.running_number?.end_value != null &&
        formData?.table?.running_number?.start_value <=
          formData?.table?.running_number?.end_value;

      const hasValidEpoch =
        formData?.table?.epoch?.start_value != null &&
        formData?.table?.epoch?.end_value != null &&
        formData?.table?.epoch?.start_value <=
          formData?.table?.epoch?.end_value;

      const hasValidDateRange = formData?.table?.date_range?.start_date != null;

      return Boolean(
        hasValidRunningNumber || hasValidDateRange || hasValidEpoch,
      );
    case BulkExtractMethodStandardValues.TIME:
      return Boolean(formData?.actions?.timePeriod);
    default: // Keep, All
      return true;
  }
};
