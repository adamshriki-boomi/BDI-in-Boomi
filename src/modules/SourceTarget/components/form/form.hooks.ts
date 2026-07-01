import { API } from 'api';
import { storageTargets } from 'api/types';

import { RiverForm } from 'containers/River/new/source-to-target/form.hooks';
import { useMainRiverFormContext as useMainRiverForm } from 'hooks/useMainRiverFormContext';
import {
  useDataSourcesSections,
  useIsCustomQuerySupported,
} from 'modules/Datasources';
import { useIsInNewS2TRiver } from 'modules/RiverRightBar';
import {
  useDisableRiverMutation,
  useEnableRiverMutation,
} from 'modules/SourceTarget/store/riverActivation.query';
import { useVersionController } from 'modules/Versions/hooks';
import { useCallback, useEffect, useState } from 'react';
import {
  FieldPath,
  useController,
  useFormContext,
  useWatch,
} from 'react-hook-form';
import { useEffectOnce, useInterval } from 'react-use';
import {
  IRiverExtractMethod,
  IRiverStatus,
  IRiverV1,
  ISelectedTable,
  Metadata,
  Schemas,
  Source,
  Target,
} from '../../store';
import { useIsSupportedBW, useIsSupportedCDC } from '../SchemaEditor';
import { EXTRACT_METHOD, RunType } from './form.consts';

export const useSttFormContext = () => {
  // Return the main river form if available
  return useMainRiverForm();
};

/**
 * creates nested generic type
 * ref: https://dev.to/pffigueiredo/typescript-utility-keyof-nested-object-2pa3
 */
function createHook<T>(path: FieldPath<RiverForm>) {
  return () => {
    const formContext = useSttFormContext();
    const result = formContext?.watch(path);
    return result as T;
  };
}

// Form Watches
export const useGroup = createHook<IRiverV1>('river.group_id');
export const useSttSource = createHook<Source>('river.properties.source');
export const useSttExtractMethod =
  createHook<IRiverExtractMethod>(EXTRACT_METHOD);
export const useSttTarget = createHook<Target>('river.properties.target');
export const useIsStorageTarget = () => {
  const target = useSttTarget();
  return target?.name ? storageTargets.includes(target.name) : false;
};
export const useSttMetadata = createHook<Metadata>('river.metadata');
export const useSttSchemas = createHook<Schemas>('river.properties.schemas');
export const useSchemaTables = (schemaName: string) => {
  const schemas = useSttSchemas();
  return schemas?.[schemaName];
};

export const useGetRiverCommonProps = () => {
  const selectedRiverExtractMethod = useSttExtractMethod();
  const isByVersionExtractMethodSelected = [
    IRiverExtractMethod.CHANGE_TRACKING,
    IRiverExtractMethod.SYSTEM_VERSIONING,
  ].includes(selectedRiverExtractMethod);
  const isCDC = selectedRiverExtractMethod === IRiverExtractMethod.LOG;
  return {
    selectedRiverExtractMethod,
    isCDC,
    isByVersionExtractMethodSelected,
    isSystemVersioning:
      selectedRiverExtractMethod === IRiverExtractMethod.SYSTEM_VERSIONING,
    hasIncrement:
      !isCDC &&
      selectedRiverExtractMethod !== IRiverExtractMethod.CHANGE_TRACKING,
    isNotStandard: isCDC || isByVersionExtractMethodSelected,
  };
};
const useIsSystemVersioningSupported = () => {
  const source = useSttSource();
  const { selectedDataSource } = useDataSourcesSections('source', source?.name);
  return selectedDataSource?.feature_flags?.support_system_versioning;
};

export const useIsStandardExtractionSupported = () => {
  const source = useSttSource();
  const { selectedDataSource } = useDataSourcesSections('source', source?.name);
  return (
    selectedDataSource?.feature_flags?.standard_extraction_exists !== false
  );
};

export const useShouldDisplayExtractMethod = () => {
  const source = useSttSource();
  const { selectedDataSource } = useDataSourcesSections('source', source?.name);
  const isNewRiver = useIsInNewS2TRiver();
  const isCDCSupported = useIsSupportedCDC();
  const isBWSupported = useIsSupportedBW();
  const isSystemVersioningSupported = useIsSystemVersioningSupported();
  const { showCustomQuery, newUICustomQuery } = useIsCustomQuerySupported();
  const noStandardExtractMethod =
    selectedDataSource?.feature_flags?.standard_extraction_exists === false;

  return (
    isNewRiver &&
    (noStandardExtractMethod ||
      isCDCSupported === true ||
      isBWSupported ||
      isSystemVersioningSupported ||
      (showCustomQuery && newUICustomQuery))
  );
};

export const useSchemaTable = (schemaName: string, tableName: string) => {
  const schema = useSchemaTables(schemaName);
  return schema?.[tableName] as ISelectedTable;
};

export const useIsRiverActive = () => {
  const formApi = useFormContext();
  const isNewRiver = useIsInNewS2TRiver();
  // When creating a new riverId, it is always false
  const isSavedActive =
    useWatch({
      control: formApi.control,
      name: 'river.metadata.river_status',
    }) === IRiverStatus.ACTIVE;
  return isNewRiver ? false : isSavedActive;
};

export const useIsDisabledRiverForm = () => {
  const formApi = useFormContext();
  const river = formApi?.watch('river');
  const { version } = useVersionController();
  return Boolean(version) || river?.is_running;
};

export const useIsneedReactivate = form => {
  const extractMethod = useWatch({
    control: form?.control,
    name: EXTRACT_METHOD,
  });
  const isCDCRiver = extractMethod === IRiverExtractMethod.LOG;
  const dirtyFields = form?.formState?.dirtyFields;
  const isRiverPropertiesDirty = Boolean(dirtyFields?.river?.properties);
  const isRiverSchedulersDirty = Boolean(dirtyFields?.river?.schedulers);
  //If extract method is changed from cdc to standard or vice versa we want to re-activate the river
  const isExtractMethodChanged = Boolean(
    dirtyFields?.river?.properties?.source?.additional_settings?.extract_method,
  );

  return (
    (isCDCRiver || isExtractMethodChanged) &&
    (isRiverPropertiesDirty || isRiverSchedulersDirty)
  );
};

export const useRiverActivation = (runningOperation = null) => {
  const [changeStatus, { error: activationError, isLoading }] =
    useEnableRiverMutation();
  const [statusLog, setStatus] = useState(null);
  const setRiverActive = useCallback(
    async crossId => {
      setStatus(null);
      const response = await changeStatus({ crossId });
      setStatus((response as any)?.data);
    },
    [changeStatus],
  );

  useEffect(() => {
    if (runningOperation?.operation_id) {
      setStatus(runningOperation);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runningOperation?.operation_id]);

  useInterval(
    async () => {
      if (['R', 'W'].includes(statusLog?.status)) {
        const pollingResponse = await API.metadata.pollMetadataV1(
          statusLog?.operation_id,
        );
        setStatus({ ...pollingResponse, operation_id: statusLog.operation_id });
      }
    },
    ['D', 'E'].includes(statusLog?.status) ? null : 1000,
  );

  return {
    statusLog,
    setStatus,
    setRiverActive,
    activationError,
    isLoading,
    running: ['W', 'R'].includes(statusLog?.status),
    completed: ['D', 'E'].includes(statusLog?.status),
  };
};

export const useDisableRiver = (runningOperation = null) => {
  const [changeStatus, { error, isLoading }] = useDisableRiverMutation();
  const [statusLog, setStatus] = useState(null);
  const disableRiver = useCallback(
    async crossId => {
      setStatus(null);
      const response = await changeStatus({ crossId });
      setStatus((response as any)?.data);
    },
    [changeStatus],
  );

  useEffect(() => {
    if (runningOperation?.operation_id) {
      setStatus(runningOperation);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runningOperation?.operation_id]);

  useInterval(
    async () => {
      if (['R', 'W'].includes(statusLog?.status)) {
        const pollingResponse = await API.metadata.pollMetadataV1(
          statusLog?.operation_id,
        );
        setStatus({ ...pollingResponse, operation_id: statusLog.operation_id });
      }
    },
    ['D', 'E'].includes(statusLog?.status) ? null : 1000,
  );

  return {
    statusLog,
    disableRiver,
    error,
    running: ['W', 'R'].includes(statusLog?.status) || isLoading,
    completed: ['D', 'E'].includes(statusLog?.status),
  };
};

export const useIsSupportedPredefinedReports = () => {
  const formApi = useSttFormContext();
  const { field: sourceField } = useController({
    name: 'river.properties.source.name',
    control: formApi.control,
  });

  const { field: run_type } = useController({
    name: 'river.properties.source.run_type',
    control: formApi.control,
  });

  const { selectedDataSource } = useDataSourcesSections(
    'source',
    sourceField?.value,
  );

  const isPredefined =
    selectedDataSource?.data_source_type_settings?.support_predefined_reports;
  useEffectOnce(() => {
    // Only set run_type if it's not already set (for new rivers)
    // Don't override existing run_type for saved rivers
    if (!run_type.value) {
      if (isPredefined) {
        run_type.onChange(RunType.PREDEFINED_REPORT);
      } else {
        run_type.onChange(RunType.MULTI_TABLES);
      }
    }
  });

  return isPredefined;
};

export const useIsBlueprint = () => {
  const formApi = useSttFormContext();
  const sourceName = useWatch({
    control: formApi.control,
    name: 'river.properties.source.name',
  });
  return ['blueprint', 'blueprint_copilot'].includes(sourceName?.toLowerCase());
};

export const useResetSource = () => {
  const formApi = useFormContext();

  return useCallback(() => {
    formApi.setValue(
      'river',
      {
        ...formApi.watch('river'),
        properties: {
          ...formApi.watch('river.properties'),
          source: { name: null },
        },
      },
      { shouldDirty: true },
    );
  }, [formApi]);
};

export const useResetTarget = () => {
  const formApi = useFormContext();

  return useCallback(() => {
    formApi.setValue(
      'river',
      {
        ...formApi.watch('river'),
        properties: {
          ...formApi.watch('river.properties'),
          target: {
            name: null,
            loading_method: 'merge',
            merge_method: 'merge',
          },
        },
      },
      { shouldDirty: true },
    );
  }, [formApi]);
};

export const useIsBlueprintSelected = () => {
  const formApi = useFormContext();
  const { field: blueprintId } = useController({
    name: 'river.properties.source.additional_settings.recipe_id',
    control: formApi.control,
  });

  return Boolean(blueprintId.value);
};

export const useIsCustomQuery = () => {
  const formApi = useSttFormContext();
  const { field: run_type } = useController({
    name: 'river.properties.source.run_type',
    control: formApi.control,
  });
  return run_type.value === RunType.CUSTOM_QUERY;
};

export const useMainFormColumnsDefinitions = () => {
  const mainRiverForm = useSttFormContext();
  const targetType = mainRiverForm?.watch('river.properties.target.name');
  const sourceType = mainRiverForm?.watch('river.properties.source.name');
  const sourceConnectionId = mainRiverForm?.watch(
    'river.properties.source.connection_id',
  );
  const isBlueprint = useIsBlueprint();
  const isCustomQuery = useIsCustomQuery();
  const isPredefined = useIsSupportedPredefinedReports();
  return {
    sourceType,
    sourceConnectionId,
    targetType,
    isBlueprint,
    isCustomQuery,
    isPredefined,
  };
};
