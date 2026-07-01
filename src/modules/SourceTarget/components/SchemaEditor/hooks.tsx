import { SourceTypes } from 'api/types';
import { CopyIcon } from 'components';
import { CreateErrorToastWithAction } from 'components/ActionToast/ErrorActionToast';
import { ButtonCopy } from 'components/VariableList/ButtonCopy';
import { ErrorsDisplay } from 'containers/River/new/source-to-target/components/DetailedErrorToastComponent';
import { validateRiver } from 'containers/River/new/source-to-target/components/riverValidation';
import { useToastComponent } from 'hooks/useToast';
import {
  useGetSchemasTrigger,
  useGetTablesTrigger,
} from 'modules/SourceTarget/store';
import { useCallback } from 'react';
import { useController, useFormContext } from 'react-hook-form';
import { MetadataType } from 'store/metadata/metadata.types';
import { useMetadataPoller } from 'store/metadata/metadataSvcV1';
import { useRiver } from 'store/river';
import { useSttSource } from '../form';
import {
  useGetBlueprintsColumnsTrigger,
  useGetBlueprintsReportsTrigger,
} from './BluePrints/blueprints.query';
import { useTableSettingsFormContext } from './SchemaTables/TableSettings/form.hooks';
import { useGetColumnsTrigger } from './SchemaTables/TableSettings/Mapping/mapping.query';
import { schemasApi } from 'modules/SourceTarget/store/schemas.query';
import { useDispatch } from 'react-redux';
import { useDataSourcesSections } from 'modules/Datasources';
import { EXTRACT_API } from '../form/form.consts';

const getDatasourceId = (
  isBlueprint: boolean,
  selectedDataSource: any,
  definitions: any,
) => {
  if (isBlueprint) {
    return 'blueprint';
  }

  const shouldOverrideDbType =
    selectedDataSource?.feature_flags?.should_override_db_type;

  if (shouldOverrideDbType) {
    return selectedDataSource?.api_name;
  }

  return definitions?.database_properties?.type;
};

export const useDatasourceIdForMetadata = (
  isBlueprint: boolean,
  definitions: any,
) => {
  const source = useSttSource();
  const { selectedDataSource } = useDataSourcesSections('source', source?.name);
  return getDatasourceId(isBlueprint, selectedDataSource, definitions);
};

export const useReloadMetadata = (
  formApi,
  schemaInView = null,
  setViewingSchema,
) => {
  const source = useSttSource();
  const dispatch = useDispatch();
  const args = {
    items_per_page: 500,
    connectionId: source?.connection_id,
  };
  const { getSchemas } = useGetSchemasTrigger(args);
  const { getTables } = useGetTablesTrigger();

  const { field: connectionIdField } = useController({
    name: 'river.properties.source.connection_id',
    control: formApi.control,
  });

  const { field: dataSourceIDField } = useController({
    name: 'river.properties.source.name',
    control: formApi.control,
  });

  const { field: extractApiField } = useController({
    name: EXTRACT_API,
    control: formApi.control,
  });

  const { startPolling, ...rest } = useMetadataPoller({
    pull_request_inputs: {
      connection_id: connectionIdField?.value,
      ...(extractApiField?.value && { extract_api: extractApiField.value }),
    },
    task: `get_db_metadata` as MetadataType,
    task_type: 'source',
    datasource_id: dataSourceIDField?.value,
  });
  const { error: errorMessage, isError, isFetching, isLoading, data } = rest;

  const reloadSchemas = async singleSchema => {
    if (!singleSchema && schemaInView) {
      //faking schema name so the tables won't be fetched
      setViewingSchema({ name: 'empty_state' });
    }
    const res: any = await startPolling(singleSchema ? schemaInView : null);
    if (!res.error) {
      getSchemas();
      if (singleSchema) {
        getTables({
          connectionId: source?.connection_id,
          schema_name: schemaInView,
          ...(extractApiField?.value && { extract_api: extractApiField.value }),
        });
      }
      // Force all subscribed table list components to refetch — their cache keys differ from the trigger's, so they won't update otherwise
      dispatch(schemasApi.util.invalidateTags(['Schema']));
    }
  };
  return {
    reloadSchemas,
    loading: isFetching || isLoading,
    isError,
    errorMessage,
    // I couldnt reproduce the issur for check, but i think the error_message is a string not a dict by the looks of it in api-service
    warningMessage: (data as any)?.error_message?.message,
  };
};

export const useReloadTablesMetadataForNoSchemaStructure = () => {
  const source = useSttSource();
  const { toast } = useToastComponent();
  const formApi = useFormContext();
  const { field: dataSourceIDField } = useController({
    name: 'river.properties.source.name',
    control: formApi.control,
  });
  const { field: extractApiField } = useController({
    name: EXTRACT_API,
    control: formApi.control,
  });
  const { startPolling, ...rest } = useMetadataPoller({
    pull_request_inputs: {
      connection_id: source?.connection_id,
      ...(extractApiField?.value && { extract_api: extractApiField.value }),
    },
    datasource_id: dataSourceIDField?.value,
    task: `get_db_metadata` as MetadataType,
    task_type: 'source',
  });
  const { getTables } = useGetTablesTrigger();
  const reloadTables = async () => {
    const res: any = await startPolling(null);
    if (res.error) {
      createErrorToastWithAction(toast, res?.error.message);
    } else {
      getTables({
        connectionId: source?.connection_id,
        schema_name: 'no_schema',
        ...(extractApiField?.value && { extract_api: extractApiField.value }),
      });
    }
  };
  return {
    reloadTables,
    loading: rest?.isFetching || rest?.isLoading,
  };
};

export const useReloadSingleTableMetadata = (
  isBlueprint = false,
  blueprintDefinition = null,
  targetType = '',
) => {
  const { watch } = useTableSettingsFormContext();
  const { selectedVariables } = useRiver();
  const definitions = watch('definitions');
  const connection_id = watch('connectionId');
  const { toast } = useToastComponent();
  const dispatch = useDispatch();
  const datasource_id = useDatasourceIdForMetadata(isBlueprint, definitions);

  const { getColumns } = useGetColumnsTrigger({
    connectionId: connection_id,
    table_id: definitions?.id,
    schema_name: definitions?.schema_name,
    target_type: targetType,
  });
  const { getBlueprintReports, data: reports } = useGetBlueprintsReportsTrigger(
    {
      recipe_id: blueprintDefinition?.blueprintId,
    },
  );
  const { getBlueprintColumns } = useGetBlueprintsColumnsTrigger({
    recipe_id: blueprintDefinition?.blueprintId,
    report_id: definitions?.id,
    connection_id,
    target_type: targetType,
  });
  const dateRange = blueprintDefinition?.dateRange;
  const interface_parameters = blueprintDefinition?.interfaceParameters;
  const isMongo = definitions?.database_properties?.type === SourceTypes.MONGO;
  const isGenericTableMapping = !isBlueprint && !isMongo;
  const { startPolling, ...rest } = useMetadataPoller({
    pull_request_inputs: {
      connection_id,
      ...(isMongo && {
        table_name: definitions?.id,
        column_mapping_settings: mongoMappingSettings(
          watch('table')?.additional_source_settings,
        ),
      }),
      ...(isGenericTableMapping && {
        table_name: definitions?.id,
      }),
      ...(isBlueprint && {
        ...(dateRange && { date_range: dateRange }),
        ...(interface_parameters && { interface_parameters }),
        recipe_id: blueprintDefinition?.blueprintId,
        river_variables:
          buildVariablesForBlueprintPullRequest(selectedVariables),
      }),
    },
    datasource_id,
    task: isBlueprint ? 'get_source_metadata' : `get_db_metadata`,
    task_type: 'source',
  });
  const { isFetching, isLoading } = rest;

  const reloadColumns = async () => {
    if (isBlueprint) {
      getBlueprintReportsAndColumns(connection_id);
    } else {
      const res: any = await startPolling(
        definitions?.schema_name,
        definitions?.id,
      );
      if (res.error) {
        createErrorToastWithAction(toast, res?.error.message);
      } else {
        getColumns();
        // Invalidate RTK Query caches after successful reload
        dispatch(schemasApi.util.invalidateTags(['Schema']));
      }
    }
  };

  const getBlueprintReportsAndColumns = useCallback(
    async connection_id => {
      const res: any = await startPolling(
        definitions?.schema_name,
        definitions?.id ?? blueprintDefinition?.blueprintId,
        connection_id,
      );
      if (res.error) {
        createErrorToastWithAction(toast, res?.error.message);
      } else {
        await getBlueprintReports(connection_id);
        getBlueprintColumns();
        // Invalidate RTK Query caches after successful reload
        dispatch(schemasApi.util.invalidateTags(['Schema']));
      }
    },
    [
      blueprintDefinition?.blueprintId,
      definitions?.id,
      definitions?.schema_name,
      getBlueprintColumns,
      getBlueprintReports,
      startPolling,
      toast,
      dispatch,
    ],
  );

  return {
    getBlueprintReportsAndColumns,
    reloadColumns,
    loading: isFetching || isLoading,
    status: rest,
    getBlueprintReports,
    reports,
  };
};

function createErrorToastWithAction(toast, errorMessage) {
  CreateErrorToastWithAction(
    toast,
    'Unable to load schema',
    errorMessage,
    <ButtonCopy
      variant="default"
      leftIcon={<CopyIcon />}
      value={errorMessage}
      buttontype="text"
      w="fit-content"
    />,
  );
}

function buildVariablesForBlueprintPullRequest(vars) {
  return (
    vars &&
    Object.entries(vars).reduce((acc, [key, value]) => {
      const variable = {
        name: key,
        value: (value as any)?.value,
        settings: { is_encrypted: (value as any)?.is_encrypted },
      };
      acc.push(variable);
      return acc;
    }, [])
  );
}

function mongoMappingSettings(additional_source_settings) {
  const {
    mapping_settings_type,
    mapping_records_order = null,
    mapping_num_of_records = null,
    mapping_documents_ids = null,
    json_example = null,
  } = additional_source_settings;
  return {
    mapping_records_order,
    mapping_num_of_records,
    mapping_settings_type,
    mapping_documents_ids,
    json_example,
  };
}

export const useValidateRiverTables = () => {
  const errorToast = useToastComponent().error;
  return useCallback(
    async (river, context) => {
      const validationErrors = await validateRiver(river, context);
      if (validationErrors) {
        errorToast({
          title: 'Error',
          description: <ErrorsDisplay response={validationErrors} />,
          duration: 30000,
        });
        return false;
      }
      return true;
    },
    [errorToast],
  );
};
export const useRunTestBlueprints = () => {
  const { startPolling, ...rest } = useMetadataPoller({
    pull_request_inputs: {
      connection_id: null,
    },
    datasource_id: SourceTypes.BLUEPRINT,
    task: 'preview_data',
    task_type: 'source',
  });

  const getBlueprintRunResult = useCallback(
    async (blueprintId, connectionId, blueprintParameters) => {
      await startPolling(
        null,
        null,
        connectionId,
        blueprintId,
        blueprintParameters,
      );
    },
    [startPolling],
  );

  return {
    status: rest,
    getBlueprintRunResult,
  };
};
// export const useReloadReportMetadata = () => {
//   const { watch } = useTableSettingsFormContext();
//   const definitions = watch('definitions') as IReport;
//   const connection_id = watch('connectionId');
//   const { error } = useToastComponent();
//   const { getColumns } = useGetColumnsTrigger({
//     connectionId: connection_id,
//     table_id: definitions?.report_id,
//     schema_name: 'no_schema',
//   });
//   const { startPolling, ...rest } = useMetadataPoller({
//     connection_id,
//     datasource_id: definitions?.datasource_id,
//     type: `get_db_metadata` as MetadataType,
//     task_type: 'source',
//   });
//   const { isError, isFetching, isLoading } = rest;

//   const reloadColumns = async () => {
//     await startPolling(definitions?.schema_name, definitions?.id);
//     getColumns();
//   };

//   useEffect(() => {
//     if (isError) {
//       error({ description: 'Error fetching metadata' });
//     }
//   }, [error, isError]);

//   return {
//     reloadColumns,
//     loading: isFetching || isLoading,
//   };
// };
