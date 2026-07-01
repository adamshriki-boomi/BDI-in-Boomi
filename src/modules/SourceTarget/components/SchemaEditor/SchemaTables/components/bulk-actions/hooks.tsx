import { useController, useForm, useFormContext } from 'react-hook-form';
import {
  DateRange,
  IRiverExtractMethod,
  Schemas,
  Source,
  useGetBulkTablesTrigger,
  ValueDef,
} from '../../../../../store';
import { useCallback, useMemo } from 'react';
import {
  BulkCDCExtractionModeValues,
  BulkExtractMethodStandardValues,
  BulkStandardLoadingMergeMethodValues,
  BulkStandardLoadingModeValues,
  BulkTableSelectionTypeValues,
} from 'modules/SourceTarget/components/SchemaEditor/SchemaTables/components/bulk-actions/consts';
import { FilterValue } from 'layout/Sidebar/components/RiveryFilterBuilder/consts';
import { object, string, array, mixed } from 'yup';

export const filterValidationSchema = object({
  filters: array().of(
    object({
      field: string().required(),
      operator: string().required(),
      value: mixed().required(),
    }),
  ),
  filtersOperator: string().oneOf(['and', 'or']).required(),
});

export function useInitialBulkForm() {
  const schemaForm = useFormContext();
  return useForm<BulkForm>({
    defaultValues: {
      selectionType: BulkTableSelectionTypeValues.SPECIFIC,
      selectedSchemas: [],
      specificTables: {},
      filteredTables: {},
      filters: [{ field: 'tableName', operator: 'is', value: undefined }],
      filtersOperator: 'and',
      isCDC:
        schemaForm.watch(
          'river.properties.source.additional_settings.extract_method',
        ) === IRiverExtractMethod.LOG,
      schema: schemaForm.watch('river.properties.schemas'),
      targetName: schemaForm.watch('river.properties.target.name'),
      source: schemaForm.watch('river.properties.source'),
      defaultLoadingMethod: schemaForm.watch(
        'river.properties.target.loading_method',
      ),
      actions: {
        extractMethod: BulkExtractMethodStandardValues.KEEP,
        loadingMode: BulkStandardLoadingModeValues.KEEP,
        initialMigration: false,
        migrationMode: BulkCDCExtractionModeValues.OVERWRITE,
        newCalculatedColumns: [],
      },
    },
  });
}

export type SpecificTables = {
  [schemaName: string]: {
    [tableName: string]: boolean;
  };
};

export type BulkForm = {
  selectionType: BulkTableSelectionTypeValues;
  selectedSchemas: string[];
  specificTables: SpecificTables;
  filteredTables: SpecificTables;
  filters: FilterValue[];
  filtersOperator: 'and' | 'or';
  isCDC: boolean;
  schema: Schemas;
  targetName: string;
  source: Source;
  defaultLoadingMethod: string;
  actions: {
    extractMethod: BulkExtractMethodStandardValues;
    loadingMode: BulkStandardLoadingModeValues;
    initialMigration: boolean;
    migrationMode: BulkCDCExtractionModeValues;
    newCalculatedColumns: [];
    loadingMethod?: BulkStandardLoadingMergeMethodValues;
    mergeMethod?: BulkStandardLoadingMergeMethodValues;
    timePeriod?: DateRange;
    bulkTablesData?: any[];
  };
  table?: {
    incremental_field?: string;
    running_number?: ValueDef;
    epoch?: ValueDef;
    date_range?: DateRange;
    incremental_type?: string;
  };
};

interface SelectedSchemasTables {
  schemaName: string;
  tableIds: string[];
}

const useSchemaTableSelection = (formApi: any) => {
  const { field: schema } = useController({
    name: 'schema',
    control: formApi.control,
  });
  const selectionType = formApi.watch('selectionType');

  const usedSchemas = useMemo(
    () =>
      Object.entries(schema.value)
        .filter(([_, tables]) =>
          Object.values(tables).some(
            table => typeof table === 'object' && table?.is_selected,
          ),
        )
        .map(([schemaName]) => schemaName),
    [schema.value],
  );

  // Get the appropriate table selection based on type
  const getTableSelection = useCallback(() => {
    switch (selectionType) {
      case BulkTableSelectionTypeValues.SPECIFIC:
        return formApi.watch('specificTables');
      case BulkTableSelectionTypeValues.CONDITIONS:
        return formApi.watch('filteredTables');
      case BulkTableSelectionTypeValues.SCHEMAS:
        const selectedSchemas = formApi.watch('selectedSchemas');
        return Object.keys(schema.value)
          .filter(schemaName => selectedSchemas.includes(schemaName))
          .reduce(
            (acc, schemaName) => ({
              ...acc,
              [schemaName]: schema.value[schemaName],
            }),
            {},
          );
      case BulkTableSelectionTypeValues.ALL:
      default:
        return schema.value;
    }
  }, [formApi, schema.value, selectionType]);

  // Process the selected schemas and tables
  const getSelectedSchemasTables = useCallback(() => {
    const tableSelection = getTableSelection();

    return Object.entries(tableSelection)
      .map(([schemaName, tables]) => {
        const selectedTables =
          selectionType === BulkTableSelectionTypeValues.SPECIFIC ||
          selectionType === BulkTableSelectionTypeValues.CONDITIONS
            ? // For specific/conditions, use the boolean map
              Object.entries(tables)
                .filter(([_, isSelected]) => isSelected)
                .map(([tableName]) => tableName)
            : // For all/schemas, use the is_selected property
              Object.entries(tables)
                .filter(
                  ([_, details]) =>
                    typeof details !== 'boolean' && details?.is_selected,
                )
                .map(([_, details]) => details.name);

        return selectedTables.length > 0
          ? { schemaName, tableIds: selectedTables }
          : null;
      })
      .filter((item): item is SelectedSchemasTables => item !== null);
  }, [getTableSelection, selectionType]);

  return {
    selectedSchemasTables: getSelectedSchemasTables(),
    usedSchemas,
  };
};

export const useBulkActionsSchema = (formApi: any) => {
  const source = formApi.watch('source');
  const { selectedSchemasTables, usedSchemas } =
    useSchemaTableSelection(formApi);
  const { getBulkTables, isLoading } = useGetBulkTablesTrigger();

  const trigger = useCallback(async () => {
    if (selectedSchemasTables.length > 0 && source?.connection_id) {
      const bulkTablesData = await getBulkTables({
        connectionId: source.connection_id,
        schemas: selectedSchemasTables,
      });

      formApi.setValue('actions', {
        ...formApi?.watch('actions'),
        bulkTablesData,
      });
    }
    return {};
  }, [formApi, getBulkTables, selectedSchemasTables, source?.connection_id]);

  const jointColumns = useCallback(() => {
    const bulkTablesData = formApi?.watch('actions.bulkTablesData');
    if (!bulkTablesData?.length) return [];
    const columnsCounter = {};
    const tablesCount = bulkTablesData.reduce(
      (acc, schema) => acc + schema.length,
      0,
    );
    for (let schema of bulkTablesData) {
      for (let table of schema) {
        for (let column of table.increment_columns) {
          const key = `${column.name}-${column.type}-${column.incremental_type}`;

          if (columnsCounter[key]) {
            columnsCounter[key]++;
          } else {
            columnsCounter[key] = 1;
          }
        }
      }
    }

    const result = [];
    for (const [key, count] of Object.entries(columnsCounter)) {
      if (count === tablesCount) {
        const [name, type, incremental_type] = key.split('-');
        const columnDetails = {
          name,
          type,
          incremental_type,
        };
        result.push(columnDetails);
      }
    }

    return result;
  }, [formApi]);

  return {
    usedSchemas,
    jointColumns,
    isLoading,
    trigger,
  };
};
