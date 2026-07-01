import * as React from 'react';
import { useEffect, useState } from 'react';
import { RiveryRadioGroup } from 'components/Form/components/RiveryRadioGroup';
import {
  FormProvider,
  useController,
  useFieldArray,
  useFormContext,
} from 'react-hook-form';
import { CustomSelectForm } from 'components/Form';
import { RdsSchemaSelected, RenderGuard, Text } from 'components';
import { SpecificTables, useBulkActionsSchema } from '../hooks';
import {
  bulkFilterColumns,
  BulkFilterItem,
  BulkTableSelectionTypeLabels,
  BulkTableSelectionTypeValues,
  getBulkFilterColumns,
} from '../consts';
import { RiveryAccordion } from 'layout/Sidebar/components/RiveryAccordion';
import { RiveryFilterBuilder } from 'layout/Sidebar/components/RiveryFilterBuilder/RiveryFilterBuilder';
import { Flex } from '@chakra-ui/react';
import { FilterColumn } from 'layout/Sidebar/components/RiveryFilterBuilder/consts';

export function BulkSelectTablesStep() {
  const formApi = useFormContext();
  const { field: selectionType } = useController({
    name: 'selectionType',
    control: formApi.control,
  });
  const schema = formApi.watch('schema');
  const { field: specificTables } = useController({
    name: 'specificTables',
    control: formApi.control,
  });
  useEffect(() => {
    /**
     * This useEffect is responsible for transforming the schema object into the specificTables object.
     * The specific tables object is a nested object that contains all the tables with default value of true.
     * Once the user removes a table from the specific tables, the value will be set to false, and the bulk action will not be applied to that table.
     */
    if (
      schema &&
      (!specificTables.value || Object.keys(specificTables.value).length === 0)
    ) {
      const sortedSchemaNames = Object.keys(schema).sort((a, b) =>
        a.toLowerCase().localeCompare(b.toLowerCase()),
      );

      const transformedSpecificTables: SpecificTables =
        sortedSchemaNames.reduce((acc, schemaName) => {
          const tables = schema[schemaName];

          const sortedTableNames = Object.keys(tables).sort((a, b) =>
            a.toLowerCase().localeCompare(b.toLowerCase()),
          );

          const tableResult = sortedTableNames.reduce((tableAcc, tableName) => {
            if (tables[tableName]?.is_selected && tables[tableName] !== null) {
              tableAcc[tableName] = true;
            }
            return tableAcc;
          }, {} as { [tableName: string]: boolean });

          if (Object.keys(tableResult).length > 0) {
            acc[schemaName] = tableResult;
          }

          return acc;
        }, {} as SpecificTables);
      specificTables.onChange(transformedSpecificTables);
    }
  }, [schema, specificTables]);
  return (
    <FormProvider {...formApi}>
      <Text mb={4}>
        From the tables you’ve chosen, select the ones you want to apply bulk
        actions to:
      </Text>
      <RiveryRadioGroup
        defaultValue={selectionType.value}
        onChange={option => {
          selectionType.onChange(option);
        }}
        value={selectionType.value}
        values={[
          {
            label: BulkTableSelectionTypeLabels.SPECIFIC,
            value: BulkTableSelectionTypeValues.SPECIFIC,
            content: (
              <RiveryAccordion
                topLevelIcon={RdsSchemaSelected}
                field={specificTables}
              />
            ),
          },
          {
            label: BulkTableSelectionTypeLabels.CONDITIONS,
            value: BulkTableSelectionTypeValues.CONDITIONS,
            content: <ConditionBasedSelection formApi={formApi} />,
          },
          {
            label: BulkTableSelectionTypeLabels.SCHEMAS,
            value: BulkTableSelectionTypeValues.SCHEMAS,
            content: <SchemaSelectionDropDown />,
          },
          {
            label: BulkTableSelectionTypeLabels.ALL,
            value: BulkTableSelectionTypeValues.ALL,
          },
        ]}
      />
    </FormProvider>
  );
}

function SchemaSelectionDropDown() {
  const formApi = useFormContext();
  const { usedSchemas } = useBulkActionsSchema(formApi);

  const { replace } = useFieldArray({
    name: 'selectedSchemas',
    control: formApi.control,
  });
  const [selectedValues, setSelectedValues] = useState([]);
  const options = usedSchemas
    ?.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
    .map(schemaKey => ({
      value: schemaKey,
      label: schemaKey,
    }));
  useEffect(() => {
    const formValues = formApi.watch('selectedSchemas') || [];
    const selectedOptions = formValues.map(value => ({
      value,
      label: value,
    }));
    setSelectedValues(selectedOptions);
  }, [formApi]);

  const handleSelectionChange = selected => {
    const selectedValues = selected.map(item => item.value);
    replace(selectedValues);
    setSelectedValues(selected);
  };

  return (
    <CustomSelectForm
      options={options}
      controlId="selected schemas"
      chakra
      isClearable
      displayIcon={RdsSchemaSelected}
      name="selectedSchemas"
      value={selectedValues}
      onChange={handleSelectionChange}
    />
  );
}

function ConditionBasedSelection({ formApi }) {
  const filterColumns: FilterColumn[] = getBulkFilterColumns();
  const [showFilteredResults, setShowFilteredResults] = useState(false);

  const dataSet = getBulkFiltersDataSet(formApi);

  const handleApplyFilters = filteredDataSet => {
    const filteredTables: SpecificTables = filteredDataSet.reduce(
      (acc, item) => {
        if (item.isFilteredIn) {
          if (!acc[item.schema]) {
            acc[item.schema] = {};
          }
          acc[item.schema][item.tableName] = true;
        }
        return acc;
      },
      {} as SpecificTables,
    );

    const sortedSchemas = Object.keys(filteredTables).sort((a, b) =>
      a.toLowerCase().localeCompare(b.toLowerCase()),
    );

    const sortedFilteredTables = sortedSchemas.reduce((acc, schema) => {
      const sortedTables = Object.keys(filteredTables[schema]).sort((a, b) =>
        a.toLowerCase().localeCompare(b.toLowerCase()),
      );

      acc[schema] = sortedTables.reduce((tableAcc, table) => {
        tableAcc[table] = true;
        return tableAcc;
      }, {});

      return acc;
    }, {} as SpecificTables);

    formApi.setValue('filteredTables', sortedFilteredTables);
    setShowFilteredResults(true);
  };
  return (
    <Flex flexDir="column" w="full">
      <RiveryFilterBuilder
        formApi={formApi}
        filterColumns={filterColumns}
        dataSet={dataSet}
        onOuterApply={handleApplyFilters}
        onOuterClear={() => setShowFilteredResults(false)}
      />
      <RenderGuard condition={showFilteredResults}>
        <RiveryAccordion
          topLevelIcon={RdsSchemaSelected}
          field={{
            value: formApi.watch('filteredTables'),
            onChange: value => formApi.setValue('filteredTables', value),
          }}
          treeOnly
          editable={false}
        />
      </RenderGuard>
    </Flex>
  );
}

function getBulkFiltersDataSet(formApi): BulkFilterItem[] {
  /**
   * This function creates the data set for the bulk filters.
   * every object in the list should hold the relevant keys that the filters are querying,
   * and it should have a boolean field 'isFilteredIn' that will be used to determine if the object is filtered in or not.
   * @returns Array of objects containing filter-relevant keys and isFilteredIn flag
   * Each object includes:
   * - schema: The schema name
   * - tableName: The table name
   * - extractMethod: The extraction method
   * - loadingMode: The loading mode (specific or default)
   * - isFilteredIn: Whether the object passes the filters (initially false)
   */

  const schema = formApi.watch('schema');
  const defaultLoadingMethod = formApi.watch('defaultLoadingMethod');

  if (!schema || !defaultLoadingMethod) {
    return [];
  }

  return Object.entries(schema).flatMap(([schemaName, schemaContent]) =>
    Object.entries(schemaContent)
      .map(([tableName, tableContent]) => {
        if (tableContent === false) return null;

        return {
          schema: schemaName,
          [bulkFilterColumns.TABLE_NAME]: tableName,
          [bulkFilterColumns.EXTRACT_METHOD]: tableContent.extract_method,
          [bulkFilterColumns.LOADING_MODE]:
            tableContent.additional_target_settings?.target_loading ||
            defaultLoadingMethod,
          isFilteredIn: false,
        };
      })
      .filter(Boolean),
  );
}
