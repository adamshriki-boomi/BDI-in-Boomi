import { storageTargets, TargetTypesV1 } from 'api/types';
import {
  Center,
  Divider,
  Flex,
  HStack,
  Icon,
  RdsRecipeFile,
  RefreshIcon,
  RenderGuard,
  RiveryButton,
  RiveryTable,
  Text,
} from 'components';
import {
  mergeReportsParamsWithGlobalFallback,
  populateBatchReportParamsCache,
} from 'containers/BluePrints/helpers';
import {
  useGetBlueprintQuery,
  useGetReportsInterfaceParametersBatchQuery,
} from 'containers/BluePrints/blueprints.query';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useEffectOnce, useToggle } from 'react-use';
import { useReloadSingleTableMetadata } from '../hooks';
import { blueprintColumns } from './columns';
import { ErrorSchemas, LoadingSchemas } from '../SchemasLoader';

import { SchemaDefinitions } from '../SchemaTables/components/SchemaDefinitions';
import { useSttSource } from '../../form';
import { TableSettingsDrawer } from '../SchemaTables/TableSettings';

export default function BlueprintsReportsExplorer({ targetType }) {
  const form = useFormContext();

  const formData = form.watch();
  const connectionId = formData?.river?.properties?.source.connection_id;
  const blueprintId =
    formData?.river?.properties?.source?.additional_settings?.recipe_id;
  const interfaceParameters =
    formData?.river?.properties?.source?.additional_settings
      ?.interface_parameters;
  const blueprintFormValue = (formData as any)?.blueprint;
  const legacyDateRange =
    blueprintFormValue?.type === 'legacy' &&
    blueprintFormValue?.date_range?.name
      ? blueprintFormValue.date_range
      : undefined;
  const blueprintDefinition = {
    interfaceParameters,
    blueprintId,
    ...(legacyDateRange && { dateRange: legacyDateRange }),
  };
  const {
    getBlueprintReports,
    reports,
    getBlueprintReportsAndColumns,
    status,
    loading: metadataLoading,
  } = useReloadSingleTableMetadata(true, blueprintDefinition, targetType);

  const { isUninitialized, isLoading, isError } = status;
  const showLoader = isLoading || metadataLoading;
  const error = isError;
  const reloadReports = useCallback(
    () => getBlueprintReportsAndColumns(connectionId),
    [connectionId, getBlueprintReportsAndColumns],
  );

  useEffectOnce(() => {
    getBlueprintReports(connectionId);
  });

  useEffect(() => {
    const shouldReload = reports?.items?.length === 0 && isUninitialized;
    if (shouldReload) {
      let isSubscribed = true;
      const loadReports = async () => {
        if (isSubscribed) {
          await reloadReports();
        }
      };
      loadReports();
      return () => {
        isSubscribed = false;
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reports?.items?.length]);

  const { data: blueprint } = useGetBlueprintQuery(
    { id: blueprintId },
    { skip: !blueprintId },
  );
  const file_cross_id = blueprint?.file_cross_id;
  const shouldFetchBatchParams = Boolean(file_cross_id);
  const { data: reportsInterfaceParams, isFetching: isFetchingBatchParams } =
    useGetReportsInterfaceParametersBatchQuery(
      { file_cross_id: file_cross_id! },
      { skip: !shouldFetchBatchParams },
    );
  const effectiveReportsParams = useMemo(
    () =>
      mergeReportsParamsWithGlobalFallback(
        reportsInterfaceParams,
        reports?.items ?? [],
      ),
    [reportsInterfaceParams, reports?.items],
  );
  useEffect(() => {
    if (blueprintId && reportsInterfaceParams) {
      populateBatchReportParamsCache(blueprintId, effectiveReportsParams);
    }
  }, [blueprintId, reportsInterfaceParams, effectiveReportsParams]);
  const waitingForBatchParams =
    shouldFetchBatchParams &&
    (isFetchingBatchParams || !reportsInterfaceParams);

  const filteredReportItems = reports?.items ?? [];

  return (
    <Flex flexDir="column">
      <Flex justify="space-between">
        <HStack>
          <Center borderRadius="50px" bg="background-selected-weak" boxSize={8}>
            <Icon as={RdsRecipeFile} color="primary" boxSize={6} />
          </Center>
          <Text color="primary" textStyle="M6">
            Blueprint
          </Text>
        </HStack>
        <Flex gap={2}>
          <SchemaDefinitions />
          <RiveryButton
            label="Reload Blueprint Metadata"
            variant="ghost"
            leftIcon={<Icon as={RefreshIcon} />}
            mr="auto"
            onClick={reloadReports}
          />
        </Flex>
      </Flex>
      <Divider orientation="horizontal" my={3} />
      {showLoader || waitingForBatchParams ? (
        <Center h="full">
          <LoadingSchemas entity="reports" />
        </Center>
      ) : error ? (
        <Center h="full">
          <ErrorSchemas entity="reports" />
        </Center>
      ) : filteredReportItems.length > 0 ? (
        <ReportsTable
          data={filteredReportItems}
          blueprintDefinition={blueprintDefinition}
          reportsInterfaceParams={effectiveReportsParams}
        />
      ) : null}
    </Flex>
  );
}

export function ReportsTable({
  data,
  blueprintDefinition,
  reportsInterfaceParams,
}: {
  data: any[];
  blueprintDefinition: any;
  reportsInterfaceParams?: Record<string, any>;
}) {
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
  const source = useSttSource();
  const target = useWatch({
    control: useFormContext().control,
    name: 'river.properties.target',
  });
  const hideLoadingMode =
    target?.name &&
    storageTargets.includes(target.name) &&
    target.name !== TargetTypesV1.KNOWLEDGE_HUB;
  const columns = useMemo(
    () =>
      blueprintColumns
        .filter(col => !hideLoadingMode || col.id !== 'target_loading')
        .map(col => ({
          ...col,
          getProps: {
            openDrawer,
            isBlueprint: true,
            blueprintDefinition,
            reportsInterfaceParams,
            riverProperties: {
              source: source.name,
              isPredefined: false,
              loadingMethod: target?.loading_method,
              defaultMigrationOption: null,
            },
          },
        })),
    [
      blueprintDefinition,
      openDrawer,
      reportsInterfaceParams,
      source.name,
      target?.loading_method,
      hideLoadingMode,
    ],
  );
  return (
    <>
      <RenderGuard condition={selectedTable}>
        <TableSettingsDrawer
          table={selectedTable}
          isOpen={isDrawerOpen}
          onClose={closeDrawer}
        />
      </RenderGuard>
      <RiveryTable
        ariaLabel="reports list"
        entityType="Reports"
        columns={columns}
        data={data}
        noPagination
        title={null}
        inline
      />
    </>
  );
}
