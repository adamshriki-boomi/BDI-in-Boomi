import { RiveryButton, RiveryButtonProps } from 'components';
import { useRiverId } from 'containers/Activities/helpers';
import { interfaceParamsToSupportBoolean } from 'containers/BluePrints/helpers';
import { useUpdateRiver } from 'containers/River/hooks/useUpdateRiverValues';
import { useEnableEdit } from 'hooks/useEnableEdit';
import { useToastComponent } from 'hooks/useToast';
import { useIsInNewS2TRiver } from 'modules/RiverRightBar';
import {
  IRiverExtractMethod,
  IRiverV1,
  IVariableV1,
  Metadata,
  useCreateRiverMutation,
  useUpdateRiverMutation,
} from 'modules/SourceTarget';
import { useUpdateRiverVariablesMutation } from 'modules/SourceTarget/store/variables.query';
import { useCallback, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { useCore } from 'store/core';
import { useGroupsLoader, useGroupsState } from 'store/groups';
import { useRiver, useRiverActions } from 'store/river';
import {
  haveVariablesChanged,
  moveBPVariablesToVariablesStructure,
  moveToVariablesStructure,
} from 'store/river/river.effects';
import { getOId } from 'utils/api.sanitizer';
import { useCreateSttFormContext } from '../form.hooks';
import { ErrorsDisplay } from './DetailedErrorToastComponent';
import { validateRiver } from './riverValidation';

export const SaveRiverButton = ({
  onSuccess = null,
  onFailure = null,
  showLoader = false,
  isActivateButton = false,
  reActivate = false,
  isDisabled,
  ...props
}: {
  onSuccess?: (result) => void;
  onFailure?: () => void;
  showLoader?: boolean;
  isActivateButton?: boolean;
  reActivate?: boolean;
} & RiveryButtonProps) => {
  const isNewRiver = useIsInNewS2TRiver();
  const buildRiverData = useRiverDataBuilder();
  const { enableEdit } = useEnableEdit();
  const { isLoading, save } = useRiverSaver();
  const formApi = useFormContext();
  const updateForm = useUpdateRiver(formApi);
  const validateRiverStructure = useValidateRiverSaver();
  const saveRiver = useCallback(async () => {
    const river = buildRiverData();
    const valid = await validateRiverStructure(river, {
      isActivateButton,
    });
    if (!formApi.formState.isDirty && valid) {
      onSuccess && onSuccess(river);
      return;
    }
    if (valid) {
      const result: any = await save(river);
      if (!result?.error) {
        !isNewRiver && updateForm();
        onSuccess && onSuccess(result);
      } else {
        onFailure && onFailure();
      }
    }
  }, [
    buildRiverData,
    formApi?.formState?.isDirty,
    isActivateButton,
    isNewRiver,
    onFailure,
    onSuccess,
    save,
    updateForm,
    validateRiverStructure,
  ]);

  return (
    <RiveryButton
      gridArea="save"
      variant="outline"
      size="sm"
      isLoading={showLoader || isLoading}
      isDisabled={[isDisabled, !enableEdit].some(Boolean)}
      onClick={saveRiver}
      {...props}
    />
  );
};

const useRiverMetadata = (): Partial<Metadata> => {
  const formApi = useCreateSttFormContext();
  const description = formApi?.watch('river.metadata.description');
  return {
    description,
  };
};

// MODULAR HOOKS to simplify the save river process
export const useRiverDataBuilder = () => {
  useGroupsLoader(useCore().envId);
  const formApi = useCreateSttFormContext();
  const isNewRiver = useIsInNewS2TRiver();
  const metadata = useRiverMetadata();
  const { defaultGroup } = useGroupsState();
  const defaultGroupId = getOId(defaultGroup?.cross_id);
  return () => {
    const river = formApi.watch('river');
    const blueprint = formApi.watch('blueprint');
    const isBlueprint =
      river?.properties?.source?.additional_settings?.recipe_id;

    const group_id = Boolean(river.group_id) ? river.group_id : defaultGroupId;
    const riverData = {
      ...river,
      name:
        isNewRiver && !river.name
          ? riverNameGenerator(
              river.properties.source.name,
              river.properties.target.name,
            )
          : river.name,
      ...propertiesBuilder(river, isBlueprint ? blueprint : null),
      group_id,

      metadata,
      blueprint,
    };
    return riverData;
  };
};

const propertiesBuilder = (river, blueprint = null) => {
  const emailValue = river.properties.target?.email_list;
  const email_list =
    typeof emailValue == 'string'
      ? emailValue?.split(',').filter(Boolean)
      : emailValue;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { variables = null, ...properties } = river.properties;
  const { cdc_settings = null, ...source } = river.properties.source;
  return {
    properties: {
      ...properties,
      target: { ...river.properties.target, email_list },
      source: {
        ...source,
        name:
          //TODO remove this when we decide to implement blueprint_copilot
          river.properties.source.name === 'blueprint_copilot'
            ? 'blueprint'
            : river.properties.source.name,
        additional_settings: {
          ...river.properties.source.additional_settings,
        },
        ...(river.properties.source.additional_settings?.extract_method ===
          IRiverExtractMethod.LOG && { cdc_settings }),
      },
      schemas: Boolean(blueprint)
        ? interfaceParametersSchemaBuilder(properties.schemas)
        : removeExtraFields(properties.schemas),
    },
  };
};

function removeExtraFields(schemas) {
  if (!schemas) return schemas;
  const processedSchemas = { ...schemas };
  Object.keys(schemas).forEach(schemaName => {
    const schema = schemas[schemaName];
    processedSchemas[schemaName] = Object.entries(schema).reduce(
      (tableAcc, [tableName, tableValues]) => {
        if (tableValues && typeof tableValues === 'object') {
          const {
            incremental_type,
            custom_increment_columns,
            ...newTableValues
          } = tableValues as any;
          tableAcc[tableName] = newTableValues;
        } else {
          tableAcc[tableName] = tableValues;
        }
        return tableAcc;
      },
      {},
    );
  });

  return processedSchemas;
}
function interfaceParametersSchemaBuilder(schemas) {
  const cleaned = removeExtraFields(schemas);
  const report = cleaned?.no_schema;
  if (!report) return cleaned ?? {};
  const reportWithParameters = Object.entries(report).reduce(
    (acc, [key, values]: any) => {
      const params =
        values?.additional_source_settings?.interface_parameters?.source;
      if (params?.length) {
        acc[key] = {
          ...values,
          additional_source_settings: {
            ...values.additional_source_settings,
            interface_parameters: {
              source: interfaceParamsToSupportBoolean(params),
            },
          },
        };
      } else {
        acc[key] = values;
      }
      return acc;
    },
    {},
  );
  return { ...cleaned, no_schema: reportWithParameters };
}

export const useValidateRiverSaver = () => {
  const errorToast = useToastComponent().error;
  return useCallback(
    async (river, context) => {
      const validationErrors = await validateRiver(river, context);
      if (validationErrors) {
        errorToast({
          title: 'Data Flow could not be saved',
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

export const useRiverSaver = (showStatusToast = true) => {
  const riverId = useRiverId();
  const [createRiver, createStatus] = useCreateRiverMutation();
  const [updateRiver, updateStatus] = useUpdateRiverMutation();
  const setVariables = useSetRiverVariables();
  const success = createStatus.isSuccess || updateStatus.isSuccess;
  const { error: errorToast, success: successToast } = useToastComponent();
  const save = useCallback(
    async (river: IRiverV1): Promise<IRiverV1 | Record<'error', string>> => {
      const { variables, encryptedVariables, blueprint, ...rest } =
        river as any;
      const hasId = Boolean(river.cross_id);
      const saveRiver = hasId ? updateRiver : createRiver;
      const savedRiver: any = await saveRiver(rest);
      if (savedRiver?.error) {
        if (showStatusToast) {
          errorToast({
            title: 'Data Flow could not be saved',
            description: (
              <ErrorsDisplay response={savedRiver.error?.data?.detail} />
            ),
            duration: 30000,
          });
        }
        return {
          error:
            savedRiver.error?.data?.detail?.[0].msg ??
            'Something went wrong, data flow could not be saved.',
        };
      }
      await setVariables(
        savedRiver?.data?.cross_id,
        variables,
        encryptedVariables,
      );
      return savedRiver.data as IRiverV1;
    },
    [createRiver, errorToast, setVariables, showStatusToast, updateRiver],
  );

  useEffect(() => {
    if (success && riverId !== 'new' && showStatusToast) {
      successToast({
        description: 'Data Flow successfully saved',
      });
    }
  }, [riverId, showStatusToast, success, successToast]);

  return {
    isLoading: createStatus.isLoading || updateStatus.isLoading,
    save,
    completed: success,
  };
};

const useSetRiverVariables = () => {
  const { selectedVariables, initialVariables } = useRiver();
  const { syncInitialVariables } = useRiverActions();
  const items = moveToVariablesStructure(
    selectedVariables ?? {},
  ) as unknown as IVariableV1[];
  const [setVariables] = useUpdateRiverVariablesMutation();
  return useCallback(
    (crossId, variablesFromForm, encryptedVariables) => {
      const hasReduxVariablesChanged = haveVariablesChanged(
        initialVariables,
        selectedVariables,
      );
      const hasBlueprintVariables = variablesFromForm
        ? Object.entries(variablesFromForm).some(
            ([key]) => !selectedVariables || !(key in selectedVariables),
          )
        : false;

      if (!hasReduxVariablesChanged && !hasBlueprintVariables) {
        return;
      }

      let s2tVariables;
      if (variablesFromForm) {
        s2tVariables = moveBPVariablesToVariablesStructure(
          selectedVariables,
          variablesFromForm,
          encryptedVariables,
        );
      }
      const vars = (items as any)?.items.concat(
        s2tVariables?.items.filter(Boolean) ?? [],
      );
      setVariables({ items: { items: vars } as any, crossId });
      syncInitialVariables();
    },
    [
      items,
      initialVariables,
      selectedVariables,
      setVariables,
      syncInitialVariables,
    ],
  );
};

function riverNameGenerator(source, target) {
  let sourceName = source;
  if (['blueprint', 'blueprint_copilot'].includes(source)) {
    sourceName = 'blueprint_data_connector_agent';
  }
  return `${sourceName}-${target} ${new Date().toLocaleString()}`;
}
