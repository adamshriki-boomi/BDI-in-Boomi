import { Flex } from 'components';
import { RiveryCheckbox } from 'components/Form';
import { validateRiverTables } from 'containers/River/new/source-to-target/components/riverValidation';
import { Schema, useShouldDisplayExtractMethod } from 'modules/SourceTarget';
import {
  useGetRiverCommonProps,
  useIsBlueprint,
  useSchemaField,
  useSchemaTables,
  useSttFormContext,
} from 'modules/SourceTarget/components/form';
import { defineNewTable } from './TableSingleCheck';
import { useWatch } from 'react-hook-form';
import { useAccount } from 'store/core';
import { useGetSchemaTable } from '../rows.state.api';
import {
  useErrorToastForTablesValidation,
  useReachedTablesLimit,
} from './TableLimitMessage';

const getTableNames = (rows: any[]) => rows.map(({ original }) => original?.id);
const getSelected = (rows: any[], tables: Schema) =>
  rows?.filter(row => tables?.[row?.original?.id]?.is_selected);
const isAllChecked = (rows: any[], tables) =>
  rows?.length > 0 && getSelected(rows, tables)?.length === rows?.length;

export function TablesMultiCheck({ rows, column: { getProps } }) {
  const triggerTablesWarning = useErrorToastForTablesValidation();
  const form = useSttFormContext();
  const schemas = useWatch({
    control: form.control,
    name: 'river.properties.schemas',
  });
  const { currentTablesLength, shouldLimit } = useReachedTablesLimit(schemas);

  const { source, isPredefined } = getProps.riverProperties;
  const { schemaName } = useGetSchemaTable(
    rows?.[0]?.original,
    source,
    isPredefined,
  );
  const { update } = useSchemaField(schemaName);
  const tables = useSchemaTables(schemaName);
  const { isSettingOn } = useAccount();
  const isBlueprint = useIsBlueprint();
  const { isNotStandard } = useGetRiverCommonProps();
  const shouldDisplayExtractMethod = useShouldDisplayExtractMethod();
  const isChecked = isAllChecked(rows, tables);
  const currVal = schemas?.[schemaName];

  const toggleAllSelection = async (checked: boolean) => {
    if (!checked) {
      const updatedTables = Object.entries(currVal).reduce(
        (acc, [tableName, table]) => {
          if (table && typeof table === 'object') {
            acc[tableName] = { ...table, is_selected: false };
          }
          return acc;
        },
        {},
      );
      update(updatedTables);
      return;
    }
    const tableNames = getTableNames(rows);

    const validationErrors = await validateRiverTables(
      schemas,
      schemaName,
      tableNames,
    );
    if (!validationErrors) {
      // Count how many tables are being newly selected (not already selected)
      const newlySelectedCount = tableNames.filter(tableName => {
        const existingTable = currVal?.[tableName];
        return (
          !existingTable ||
          typeof existingTable !== 'object' ||
          !existingTable.is_selected
        );
      }).length;

      const maxSelectedTables = isSettingOn('max_selected_tables');
      if (
        maxSelectedTables &&
        currentTablesLength + newlySelectedCount > maxSelectedTables &&
        shouldLimit
      ) {
        triggerTablesWarning();
        return;
      }

      const blueprintSourceInterfaceParams = isBlueprint
        ? form.getValues(
            'river.properties.source.additional_settings.interface_parameters.source',
          ) ?? null
        : null;
      // Preserve existing table data if it exists, otherwise create new
      const newValue = rows.reduce(
        (acc, { original }) => {
          const tableName = isPredefined
            ? `${original?.report_id}`
            : original?.id;
          const existingTable = currVal?.[tableName];
          if (existingTable && typeof existingTable === 'object') {
            acc[tableName] = { ...existingTable, is_selected: true };
          } else {
            acc[tableName] = {
              ...defineNewTable(
                tableName,
                isPredefined,
                isNotStandard,
                original,
                schemaName,
                blueprintSourceInterfaceParams,
              ),
            };
          }
          return acc;
        },
        { ...currVal },
      );

      update(newValue);
    } else {
      triggerTablesWarning('Error', validationErrors, false);
    }
  };

  return (
    <Flex>
      <RiveryCheckbox
        aria-label={`select ${schemaName} tables`}
        isChecked={isChecked}
        name={`${schemaName}.tables`}
        label={null}
        onChange={() =>
          toggleAllSelection(
            !isChecked && getSelected(rows, tables)?.length === 0,
          )
        }
        isIndeterminate={!isChecked && getSelected(rows, tables)?.length > 0}
      />
    </Flex>
  );
}
