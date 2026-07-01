import { storageTargets, TargetTypesV1 } from 'api/types';
import { useShouldShowSidebar } from 'modules/RiverRightBar';
import { IRiverExtractMethod, useGetTablesQuery } from 'modules/SourceTarget';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import {
  useIsDisabledRiverForm,
  useIsSupportedPredefinedReports,
  useSttExtractMethod,
  useSttSource,
} from '../../form/form.hooks';
import { cdcColumns, columns, systemVersioningColumns } from './columns';
import { currentSelectedTablesForSchema } from './components/TableLimitMessage';
import { RtkQueryTable } from './RtkQueryTable';
import { useGetSchemaTableNameCaption } from '../../../hooks';
import { TableSettingsDrawer } from './TableSettings';
import { useToggle } from 'react-use';
import { RenderGuard } from 'components';

interface SchemaTablesProps {
  schema: string;
  total?: number;
}

function getFinalColumns(
  selectedRiverExtractMethod: IRiverExtractMethod,
  tableNameCaption: string,
) {
  return [
    IRiverExtractMethod.LOG,
    IRiverExtractMethod.CHANGE_TRACKING,
  ].includes(selectedRiverExtractMethod)
    ? cdcColumns
    : [IRiverExtractMethod.SYSTEM_VERSIONING].includes(
        selectedRiverExtractMethod,
      )
    ? systemVersioningColumns
    : columns.map(col => {
        return {
          ...col,
          Header: col.Header === 'Table' ? tableNameCaption : col.Header,
        };
      });
}

export function SchemaTables({ schema, total = undefined }: SchemaTablesProps) {
  const [selectedTable, setSelectedTable] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useToggle(false);

  const openDrawer = useCallback(
    table => {
      setSelectedTable(table);
      setIsDrawerOpen(true);
    },
    [setIsDrawerOpen],
  );

  const closeDrawer = useCallback(() => {
    setSelectedTable(null);
    setIsDrawerOpen(false);
  }, [setIsDrawerOpen]);

  const formApi = useFormContext();
  const selectedRiverExtractMethod = useSttExtractMethod();
  const params = useMemo(() => ({ schema_name: schema }), [schema]);
  const isRiverFormDisabled = useIsDisabledRiverForm();
  const target = formApi?.watch('river.properties.target');
  const source = useWatch({
    control: formApi.control,
    name: 'river.properties.source',
  });
  const schemas = useWatch({
    control: formApi.control,
    name: 'river.properties.schemas',
  });
  const isPredefined = useIsSupportedPredefinedReports();
  const isStorageTarget = target?.name
    ? storageTargets.includes(target.name)
    : false;
  const { tableNameCaption } = useGetSchemaTableNameCaption();
  const columnsByType = useMemo(() => {
    const baseColumns = getFinalColumns(
      selectedRiverExtractMethod,
      tableNameCaption,
    );

    // Filter out Loading Mode column for storage targets (except KH which has loading mode)
    if (isStorageTarget && target?.name !== TargetTypesV1.KNOWLEDGE_HUB) {
      return baseColumns.filter(col => col.id !== 'target_loading');
    }

    return baseColumns;
  }, [
    selectedRiverExtractMethod,
    tableNameCaption,
    isStorageTarget,
    target?.name,
  ]);
  const tableColumns = useMemo(
    () =>
      columnsByType.map(col => ({
        ...col,
        getProps: {
          openDrawer,
          isDisabled: isRiverFormDisabled,
          //If any other props need to be passed to the column components from the river, add them here
          riverProperties: {
            source: source.name,
            isPredefined,
            loadingMethod: target?.loading_method,
            defaultMigrationOption:
              source?.cdc_settings?.default_tables_migration_option,
          },
        },
      })),
    [
      columnsByType,
      isPredefined,
      isRiverFormDisabled,
      openDrawer,
      source?.cdc_settings?.default_tables_migration_option,
      source.name,
      target?.loading_method,
    ],
  );

  const selectedTablesForSchema = useMemo(() => {
    if (schemas[schema]) {
      return currentSelectedTablesForSchema(schemas, schema);
    }
    return [];
  }, [schemas, schema]);

  const selectedTableIds = useMemo(
    () => selectedTablesForSchema?.map(({ name }) => name) ?? [],
    [selectedTablesForSchema],
  );
  return (
    <>
      <RtkQueryTable
        columns={tableColumns}
        useApiQuery={useTablesState}
        apiParams={params}
        resetPaginationKey={schema}
        total={total}
        selectedTableIds={selectedTableIds}
      />
      <RenderGuard condition={selectedTable}>
        <TableSettingsDrawer
          table={selectedTable}
          isOpen={isDrawerOpen}
          onClose={closeDrawer}
        />
      </RenderGuard>
    </>
  );
}

// const shouldResetParams = (prevParams, currentParams) => {
//   return prevParams?.schema_name !== currentParams?.schema_name;
// };
/**
 * returns a composed array of the tables request + any schema's tables that exist on the river
 * i.e, returns: Array<{ ...table_from_request, ...river_schemas_name_table }>
 */

const useTablesState = tableParams => {
  const { isInNewRiverPage } = useShouldShowSidebar({ params: null });
  const formApi = useFormContext();
  const source = useSttSource();
  const schemas = useWatch({
    control: formApi.control,
    name: 'river.properties.schemas',
  });
  const extract_api = useWatch({
    control: formApi.control,
    name: 'river.properties.source.additional_settings.extract_api',
  });
  const extractMethod = useSttExtractMethod();

  // Track previous extract_api value to detect changes
  const prevExtractApiRef = useRef(extract_api);
  const hasExtractApiChanged = prevExtractApiRef.current !== extract_api;

  // Clear showSelectedTables when extract_api changes
  useEffect(() => {
    if (hasExtractApiChanged) {
      tableParams.setParams(state => ({
        ...state,
        showSelectedTables: {},
      }));
    }
    prevExtractApiRef.current = extract_api;
  }, [extract_api, hasExtractApiChanged, tableParams]);

  const selectedForSchema = useMemo(() => {
    if (schemas[tableParams.params.schema_name]) {
      return currentSelectedTablesForSchema(
        schemas,
        tableParams.params.schema_name,
      );
    }
    return undefined;
  }, [schemas, tableParams.params.schema_name]);

  const { searchValue, showSelectedTables, ...restParams } = tableParams.params;
  useEffect(() => {
    if (
      !isInNewRiverPage &&
      tableParams.params.schema_name &&
      !showSelectedTables?.hasOwnProperty(tableParams.params.schema_name)
    ) {
      tableParams.setParams(state => ({
        ...state,
        showSelectedTables: {
          ...state.showSelectedTables,
          [tableParams.params.schema_name]:
            selectedForSchema?.length > 0
              ? selectedForSchema.map(({ name }) => name)
              : undefined,
        },
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableParams?.params?.schema_name]);

  useEffect(() => {
    if (
      tableParams.params.schema_name &&
      showSelectedTables?.[tableParams.params.schema_name]?.length > 0 &&
      showSelectedTables?.[tableParams.params.schema_name]?.length !==
        selectedForSchema?.length
    ) {
      tableParams.setParams(state => ({
        ...state,
        showSelectedTables: {
          ...state.showSelectedTables,
          [tableParams.params.schema_name]:
            selectedForSchema?.length > 0
              ? selectedForSchema.map(({ name }) => name)
              : undefined,
        },
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableParams?.params?.schema_name]);

  const { data, isFetching, isError, error } = useGetTablesQuery(
    {
      connectionId: source?.connection_id,
      tableName: searchValue,
      // Don't send table_ids when extract_api has changed - we want all tables for the new API
      ...(tableParams.params?.schema_name &&
        !hasExtractApiChanged &&
        showSelectedTables?.[tableParams.params.schema_name] !== undefined && {
          tableIds: showSelectedTables?.[tableParams.params.schema_name],
        }),
      ...restParams,
      ...(extract_api && { extract_api }),
      ...(extractMethod && { extractMethod }),
    },
    {
      skip: !Boolean(
        [source?.connection_id, tableParams.params.schema_name].every(Boolean),
      ),
    },
  );

  return {
    data: tableParams.params?.schema_name === 'empty_state' ? undefined : data,
    isFetching,
    isError,
    error,
  };
};
