import { GridBox, PageOverlaySpinner, RenderGuard, Text } from 'components';
import {
  useIsDisabledRiverForm,
  useMainFormColumnsDefinitions,
} from 'modules/SourceTarget';
import { useEffect, useMemo, useRef } from 'react';
import { FormProvider, useFormContext } from 'react-hook-form';
import { useTableSettingsForm } from '../SchemaTables/TableSettings/form.hooks';
import { SelectedTarget } from '../SchemaTables/TableSettings/Mapping';

interface CustomQueryMappingProps {
  mappingResult: any;
  isLoading: boolean;
  isFreshResult: boolean;
}

/**
 * Wrapper component that provides the table settings form context
 * needed by the target-specific mapping components.
 * Also syncs changes back to the main river form.
 */
export function CustomQueryMapping({
  mappingResult,
  isLoading,
  isFreshResult,
}: CustomQueryMappingProps) {
  const { targetType, sourceType, sourceConnectionId } =
    useMainFormColumnsDefinitions();
  const isDisabled = useIsDisabledRiverForm();
  const Component = SelectedTarget?.[targetType];

  // Get the main river form to sync mapping changes
  const riverFormApi = useFormContext();

  // Dedupe by name — some sources (e.g. NetSuite) return the column set more than once.
  // It's a BE bug that needs to be resolved, but we handle it here for now.
  const columns = useMemo(() => {
    if (!Array.isArray(mappingResult)) return [];
    const seen = new Set<string>();
    return mappingResult.filter(col => {
      const key = col?.name?.toLowerCase();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [mappingResult]);

  // Create form with mapping result as definitions
  const formMethods = useTableSettingsForm({
    defaultValues: {
      table: {
        modified_columns: columns,
      },
      definitions: {
        id: 'custom_query',
        name: 'Custom Query',
        columns: columns,
        database_properties: {
          type: sourceType,
        },
      } as any,
      connectionId: sourceConnectionId,
    },
    mode: 'onChange',
  });

  // Track previous columns prop to detect fresh mapping results
  const prevColumnsRef = useRef<any[]>([]);
  // Track if we're currently applying fresh mapping results
  const isApplyingFreshResultsRef = useRef(false);
  // Track what we've already synced to river form (to prevent re-syncing)
  const lastSyncedRef = useRef<string>('');

  // Update form whenever columns prop changes (initial load or fresh mapping result)
  useEffect(() => {
    if (columns.length > 0 && formMethods) {
      const columnsJson = JSON.stringify(columns);
      const prevColumnsJson = JSON.stringify(prevColumnsRef.current);

      // Only process if columns prop actually changed (fresh mapping results)
      if (columnsJson !== prevColumnsJson) {
        isApplyingFreshResultsRef.current = true;

        formMethods.setValue('definitions' as any, {
          id: 'custom_query',
          name: 'Custom Query',
          columns: columns,
          database_properties: {
            type: sourceType,
          },
        });
        formMethods.setValue('table.modified_columns' as any, columns);

        // Save to main river form when fresh mapping result received
        // (not on initial load of saved mapping to avoid marking form dirty)
        if (isFreshResult) {
          riverFormApi?.setValue(
            'river.properties.target.single_table_settings.mapping',
            columns,
            {
              shouldDirty: true,
            },
          );
        }

        prevColumnsRef.current = columns;
        // Update lastSyncedRef so second effect doesn't re-sync
        lastSyncedRef.current = columnsJson;

        // Reset flag after React has processed the state updates
        requestAnimationFrame(() => {
          isApplyingFreshResultsRef.current = false;
        });
      }
    }
  }, [columns, formMethods, sourceType, riverFormApi, isFreshResult]);

  // Watch for changes in table settings and sync to river form (user edits like delete)
  const watchedColumns = formMethods.watch('table.modified_columns' as any);
  useEffect(() => {
    // Skip if we're currently applying fresh mapping results
    if (isApplyingFreshResultsRef.current) {
      return;
    }

    if (watchedColumns && riverFormApi) {
      const watchedJson = JSON.stringify(watchedColumns);

      // Only sync if we haven't already synced this exact value (prevent infinite loop)
      if (watchedJson !== lastSyncedRef.current) {
        lastSyncedRef.current = watchedJson;
        riverFormApi.setValue(
          'river.properties.target.single_table_settings.mapping',
          watchedColumns,
          {
            shouldDirty: true,
          },
        );
        // Also sync definitions.columns to prevent deleted columns from reappearing
        const currentDefinitions = formMethods.getValues('definitions' as any);
        formMethods.setValue('definitions' as any, {
          ...currentDefinitions,
          columns: watchedColumns,
        });
      }
    }
  }, [watchedColumns, riverFormApi, formMethods]);

  if (!Component) {
    return (
      <GridBox h="full" alignContent="center" justifyContent="center">
        <Text color="font-secondary">
          {targetType
            ? `Mapping not available for ${targetType}`
            : 'Please select a target to view column mapping'}
        </Text>
      </GridBox>
    );
  }

  // Show initial state if no columns exist (never ran mapping) or all columns were deleted
  const hasNoColumns = !columns.length || !watchedColumns?.length;
  if (hasNoColumns && !isLoading) {
    return (
      <GridBox h="full" alignContent="center" justifyContent="center">
        <Text color="font-secondary">
          Click "Run Mapping" to fetch column definitions
        </Text>
      </GridBox>
    );
  }

  return (
    <FormProvider {...formMethods}>
      <GridBox position="relative" h="full" overflow="hidden">
        <RenderGuard condition={isLoading}>
          <PageOverlaySpinner />
        </RenderGuard>
        <Component isDisabled={isDisabled} />
      </GridBox>
    </FormProvider>
  );
}
