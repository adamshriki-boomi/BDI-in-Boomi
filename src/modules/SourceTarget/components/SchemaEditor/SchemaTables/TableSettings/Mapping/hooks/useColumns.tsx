import { useToastComponent } from 'hooks/useToast';
import { useGetBlueprintColumnsQuery } from 'modules/SourceTarget/components/SchemaEditor/BluePrints/blueprints.query';
import { useReloadSingleTableMetadata } from 'modules/SourceTarget/components/SchemaEditor/hooks';
import { IReport } from 'modules/SourceTarget/store';
import { useGetPredefinedColumnsQuery } from 'modules/SourceTarget/store/predefined.query';
import { useEffect, useMemo } from 'react';
import { useTableSettingsFormContext } from '../../form.hooks';
import { useTableSettingsTabs } from '../../TableSettingsDrawer';
import { useGetColumnsQuery } from '../mapping.query';
import { useMainFormColumnsDefinitions } from 'modules/SourceTarget/components/form';

/**
 * gets columns from api according to source connection id, table & schema
 */

function shouldSkipRequest(definitions, connectionId) {
  return ![definitions?.id, definitions?.schema_name, connectionId].every(
    Boolean,
  );
}

export const useColumns = () => {
  const { targetType, isBlueprint, isCustomQuery } =
    useMainFormColumnsDefinitions();
  const { watch } = useTableSettingsFormContext();
  const definitions = watch('definitions');
  const connectionId = watch('connectionId');
  const blueprintId = (definitions as IReport)?.blueprintId;
  const predefinedDefinitions = { ...definitions } as IReport;
  const isPredefinedReport =
    predefinedDefinitions?.report_id?.includes('predefined');

  // For custom query, get columns from form context instead of API
  const customQueryColumns = useMemo(
    () => (isCustomQuery ? (definitions as any)?.columns : []),
    [isCustomQuery, definitions],
  );

  const { data, isFetching } = useGetColumnsQuery(
    {
      connectionId: connectionId,
      table_id: definitions?.id,
      schema_name: definitions?.schema_name,
      target_type: targetType,
    },
    {
      skip:
        isCustomQuery ||
        isBlueprint ||
        isPredefinedReport ||
        !targetType ||
        shouldSkipRequest(definitions, connectionId),
    },
  );

  const { data: predefinedColumns, isFetching: fetching } =
    useGetPredefinedColumnsQuery(
      {
        datasource_id: predefinedDefinitions?.datasource_id,
        report: predefinedDefinitions?.report_id,
      },
      {
        skip:
          isCustomQuery ||
          definitions?.schema_name === 'no_schema' ||
          isBlueprint ||
          !predefinedDefinitions?.report_id ||
          !predefinedDefinitions?.datasource_id,
      },
    );
  const { data: blueprintColumns, isFetching: blueprintFetching } =
    useGetBlueprintColumnsQuery(
      {
        recipe_id: blueprintId,
        report_id: definitions?.id,
        connection_id: connectionId,
        target_type: targetType,
      },
      {
        skip: isCustomQuery || !isBlueprint || !definitions?.id || !targetType,
      },
    );

  const { setTabIndex, emptyMappingRedirectedRef } = useTableSettingsTabs();
  const { info } = useToastComponent();

  useEffect(() => {
    if (
      isBlueprint &&
      !blueprintFetching &&
      blueprintColumns &&
      (blueprintColumns.items?.length ?? 0) === 0 &&
      !emptyMappingRedirectedRef.current
    ) {
      emptyMappingRedirectedRef.current = true;
      info({
        description:
          'No mapping found for this report. Make sure you fill all source interface parameters and report parameteres and then reload the metadata.',
        duration: 10000,
      });
      setTabIndex(1);
    }
  }, [
    isBlueprint,
    blueprintFetching,
    blueprintColumns,
    info,
    setTabIndex,
    emptyMappingRedirectedRef,
  ]);

  const columns = useMemo(
    () =>
      isCustomQuery
        ? customQueryColumns
        : predefinedColumns?.items ||
          data?.items ||
          blueprintColumns?.items ||
          [],
    [
      isCustomQuery,
      customQueryColumns,
      blueprintColumns?.items,
      data?.items,
      predefinedColumns?.items,
    ],
  );

  const isLoading = fetching || isFetching || blueprintFetching;

  const {
    reloadColumns,
    loading: loadingMetadata,
    status,
  } = useReloadSingleTableMetadata(false, null, targetType);

  const columnsLoaded = Boolean(columns?.length);

  useEffect(() => {
    // Skip auto-reload for custom query - columns come from mapping result
    if (
      !isCustomQuery &&
      !blueprintId &&
      !columnsLoaded &&
      !isLoading &&
      status?.isUninitialized
    ) {
      reloadColumns();
    }
  }, [
    isCustomQuery,
    blueprintId,
    columnsLoaded,
    isLoading,
    reloadColumns,
    status?.isUninitialized,
  ]);

  return {
    columns,
    isLoading,
    loadingMetadata,
  };
};
