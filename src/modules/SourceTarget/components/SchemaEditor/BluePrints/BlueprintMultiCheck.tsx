import { Flex } from 'components';
import { RiveryCheckbox } from 'components/Form';
import {
  deriveExtractFromInterfaceParams,
  getCachedReportParams,
  usePrefetchReportInterfaceParameters,
} from 'containers/BluePrints/helpers';
import { validateRiverTables } from 'containers/River/new/source-to-target/components/riverValidation';
import { Schema } from 'modules/SourceTarget';
import {
  useSchemaField,
  useSchemaTables,
  useSttFormContext,
} from 'modules/SourceTarget/components/form';
import { useWatch } from 'react-hook-form';
import { useAccount } from 'store/core';
import { useGetSchemaTable } from '../SchemaTables/rows.state.api';
import {
  useErrorToastForTablesValidation,
  useReachedTablesLimit,
} from '../SchemaTables/components/TableLimitMessage';

const getReportNames = (rows: any[]) =>
  rows.map(({ original }) => original?.id);
const getSelected = (rows: any[], tables: Schema) =>
  rows?.filter(row => tables?.[row?.original?.id]?.is_selected);
const isAllChecked = (rows: any[], tables) =>
  rows?.length > 0 && getSelected(rows, tables)?.length === rows?.length;

export function BlueprintMultiCheck({ rows, column: { getProps } }) {
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
  const isChecked = isAllChecked(rows, tables);
  const currVal = schemas?.[schemaName];
  const blueprintId = form?.watch(
    'river.properties.source.additional_settings.recipe_id',
  );
  const { prefetchBatch } = usePrefetchReportInterfaceParameters(blueprintId);

  const toggleAllSelection = async (checked: boolean) => {
    if (!checked) {
      const updatedTables = Object.entries(currVal).reduce(
        (acc, [reportName, table]) => {
          if (table && typeof table === 'object') {
            acc[reportName] = { ...table, is_selected: false };
          }
          return acc;
        },
        {},
      );
      update(updatedTables);
      return;
    }
    const reportNames = getReportNames(rows);

    const validationErrors = await validateRiverTables(
      schemas,
      schemaName,
      reportNames,
    );
    if (validationErrors) {
      triggerTablesWarning('Error', validationErrors, false);
      return;
    }

    const newlySelectedCount = reportNames.filter(reportName => {
      const existingTable = currVal?.[reportName];
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

    await prefetchBatch();

    const blueprintSourceInterfaceParams =
      form.getValues(
        'river.properties.source.additional_settings.interface_parameters.source',
      ) ?? null;
    const blueprintValue: any = form.getValues('blueprint' as any);
    const legacyDateRange = blueprintValue?.date_range;

    const newValue = reportNames.reduce(
      (acc, reportName) => {
        const existingTable = currVal?.[reportName];
        if (existingTable && typeof existingTable === 'object') {
          acc[reportName] = { ...existingTable, is_selected: true };
        } else {
          const cachedParams = getCachedReportParams(blueprintId, reportName);
          const reportParams = legacyDateRange?.name
            ? { ...(cachedParams ?? {}), date_range: legacyDateRange }
            : cachedParams;
          const derived = deriveExtractFromInterfaceParams(reportParams);
          acc[reportName] = {
            name: reportName,
            target_table: reportName,
            is_selected: true,
            ...(blueprintSourceInterfaceParams?.length && {
              additional_source_settings: {
                interface_parameters: {
                  source: blueprintSourceInterfaceParams,
                },
              },
            }),
            ...derived,
          };
        }
        return acc;
      },
      { ...currVal },
    );

    update(newValue);
  };

  return (
    <Flex>
      <RiveryCheckbox
        aria-label={`select ${schemaName} reports`}
        isChecked={isChecked}
        name={`${schemaName}.reports`}
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
