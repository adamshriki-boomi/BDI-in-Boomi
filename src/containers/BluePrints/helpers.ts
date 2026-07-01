import { useToastComponent } from 'hooks/useToast';
import { useCallback, useEffect, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import {
  useController,
  useForm,
  useFormContext,
  useWatch,
} from 'react-hook-form';
import { useCore } from 'store/core';
import { compare } from 'utils/array.utils';
import { convertDateToISO, displayDate } from 'utils/date.utils';
import {
  blueprintsApi,
  useAddBlueprintFileMutation,
  useCreateBlueprintMutation,
  useEditBlueprintFileMutation,
  useEditBlueprintMutation,
  useGetBlueprintFileQuery,
  useGetBlueprintQuery,
  useGetBlueprintReportInterfaceParametersQuery,
  useGetBlueprintsListQuery,
  useGetFileQuery,
  useLazyGetFileQuery,
  useLazyGetReportsInterfaceParametersBatchQuery,
  useTestYamlMutation,
} from './blueprints.query';
import { YamlValidations } from './components/ValidateYaml';
import { useToggle } from 'react-use';

export const useGetBlueprint = selectedBlueprint => {
  const { error } = useToastComponent();
  const formApi = useForm({
    defaultValues: {
      name: !selectedBlueprint
        ? `Untitled_Blueprint_${displayDate(new Date(), 'dd_MM_yyyy')}`
        : '',
      yaml: '',
      fileId: '',
    },
    mode: 'onChange',
  });

  const { data: blueprint, isLoading: blueprintLoading } = useGetBlueprintQuery(
    { id: selectedBlueprint },
    { skip: !selectedBlueprint },
  );
  const { data: file, isError } = useGetBlueprintFileQuery(
    { id: blueprint?.file_cross_id },
    { skip: !selectedBlueprint || !blueprint?.file_cross_id },
  );

  const { data: { content: yaml } = { yaml: '' }, isLoading: yamlLoading } =
    useGetFileQuery(blueprint?.file_cross_id as any, {
      skip: !selectedBlueprint || !blueprint?.file_cross_id,
      refetchOnMountOrArgChange: true,
    });

  useEffect(() => {
    if (yaml !== formApi.watch('yaml')) {
      formApi.reset({
        yaml,
        name: blueprint?.name,
        fileId: blueprint?.file_cross_id,
      });
    }
  }, [formApi, yaml, blueprint?.name, blueprint?.file_cross_id, yamlLoading]);
  useEffect(() => {
    if (isError) {
      error({ description: 'Failed to fetch blueprint file' });
    }
  }, [error, isError]);

  return { file, formApi, loading: blueprintLoading || yamlLoading };
};

export const useBlueprintValidation = () => {
  const { error, success, warning } = useToastComponent();
  const [test, { isLoading }] = useTestYamlMutation();
  const testBlueprintFile = useCallback(
    async content => {
      const res: any = await test({ content });
      if (res.error) {
        error({
          duration: 10000,
          description:
            (typeof res.error.data === 'string' && res.error.data) ||
            'Failed to run YAML validation. Try again later',
        });
      } else if (
        res?.data?.errors?.length > 0 ||
        res?.data?.warnings?.length > 0
      ) {
        if (res?.data?.warnings?.length > 0) {
          warning({
            duration: 60000,
            description: YamlValidations({ data: res?.data }),
          });
        } else {
          error({
            duration: 60000,
            description: YamlValidations({ data: res?.data }),
          });
        }
      } else {
        success({ description: 'YAML validation passed successfully' });
      }
    },
    [error, success, test, warning],
  );

  return {
    testBlueprintFile,
    isLoading,
  };
};

export const useGetBlueprintInterfaceParams = () => {
  const { activeAccountId: account_id } = useCore();
  const { data: blueprints } = useGetBlueprintsListQuery({
    account_id,
    items_per_page: 500,
  } as any);
  const [
    getReportsInterfaceParametersBatch,
    { data: interfaceParameters, isUninitialized },
  ] = useLazyGetReportsInterfaceParametersBatchQuery();
  const getBlueprintInterfaceParams = useCallback(
    id => {
      const selectedBP = blueprints?.items?.find(compare('cross_id', id));
      const file_cross_id = selectedBP?.file_cross_id;
      if (file_cross_id) {
        return getReportsInterfaceParametersBatch({ file_cross_id });
      }
    },
    [blueprints?.items, getReportsInterfaceParametersBatch],
  );
  return { getBlueprintInterfaceParams, interfaceParameters, isUninitialized };
};

const batchReportParamsCache = new Map<string, any>();
const cacheKey = (blueprintId: string, report_name: string) =>
  `${blueprintId}:${report_name}`;

export const getCachedReportParams = (
  blueprintId: string,
  reportName: string,
) =>
  blueprintId && reportName
    ? batchReportParamsCache.get(cacheKey(blueprintId, reportName))
    : null;

export const populateBatchReportParamsCache = (
  blueprintId: string,
  paramsByReport: Record<string, any>,
) => {
  if (!blueprintId) return;
  Object.entries(paramsByReport ?? {}).forEach(([name, params]) => {
    batchReportParamsCache.set(cacheKey(blueprintId, name), params);
  });
};

export const useLegacyBlueprintDateRange = () => {
  const formApi = useFormContext();
  const blueprintValue: any = useWatch({
    control: formApi.control,
    name: 'blueprint' as any,
  });
  const dateRange = blueprintValue?.date_range;
  const isLegacy = Boolean(dateRange?.name);

  const setDateRange = useCallback(
    (value: any) => {
      const current: any = formApi.getValues('blueprint' as any) ?? {};
      const next = {
        ...(current.date_range ?? {}),
        ...(value ?? {}),
        time_period: 'custom',
      };
      formApi.setValue(
        'blueprint' as any,
        { ...current, date_range: next },
        { shouldDirty: true },
      );
      const currentSchemas =
        (formApi.getValues(
          'river.properties.schemas.no_schema' as any,
        ) as any) ?? {};
      const updatedSchemas = Object.fromEntries(
        Object.entries(currentSchemas).map(([reportName, table]: any) => {
          if (!table || typeof table !== 'object' || !table.is_selected) {
            return [reportName, table];
          }
          return [
            reportName,
            {
              ...table,
              extract_method: 'incremental',
              incremental_field: 'blueprint',
              date_range: next,
            },
          ];
        }),
      );
      formApi.setValue(
        'river.properties.schemas.no_schema' as any,
        updatedSchemas,
        { shouldDirty: true },
      );
    },
    [formApi],
  );

  return { dateRange, setDateRange, isLegacy };
};

export const mergeReportsParamsWithGlobalFallback = (
  batchData:
    | {
        global_params?: any;
        reports?: Record<string, any>;
        blueprint_type?: string;
      }
    | undefined,
  reportItems: Array<{ id: string }>,
): Record<string, any> => {
  const reportsMap = batchData?.reports ?? {};
  const globalDateRange = batchData?.global_params?.date_range;
  const isLegacy = batchData?.blueprint_type === 'legacy';
  if (!isLegacy || !globalDateRange?.name) return reportsMap;

  const reportIds = reportItems.length
    ? reportItems.map(item => item.id)
    : Object.keys(reportsMap);
  return reportIds.reduce<Record<string, any>>((acc, id) => {
    const existing = reportsMap[id] ?? { standard: [] };
    acc[id] = {
      ...existing,
      date_range: globalDateRange,
      required_params: Array.from(
        new Set([...(existing.required_params ?? []), 'date_range']),
      ),
    };
    return acc;
  }, {});
};

export const deriveExtractFromInterfaceParams = (params: any) => {
  const dateRange = params?.date_range;
  const hasDateRange = Boolean(dateRange?.name);
  if (!hasDateRange) return { extract_method: 'all' as const };
  return {
    extract_method: 'incremental' as const,
    incremental_field: 'blueprint',
    date_range: {
      time_period: 'custom',
      start_date: dateRange?.start_date ?? convertDateToISO(new Date()),
      end_date: dateRange?.end_date ?? null,
      days_back: 0,
      utc_offset: 0,
    },
  };
};

export const useGetBlueprintReportInterfaceParams = (
  blueprintId: string,
  reportName: string,
) => {
  const { data: blueprint } = useGetBlueprintQuery(
    { id: blueprintId },
    { skip: !blueprintId },
  );
  const file_cross_id = blueprint?.file_cross_id;
  const fromBatch = getCachedReportParams(blueprintId, reportName);
  const {
    data: singleData,
    isFetching,
    isUninitialized,
  } = useGetBlueprintReportInterfaceParametersQuery(
    { file_cross_id: file_cross_id!, report_name: reportName },
    { skip: !file_cross_id || !reportName || Boolean(fromBatch) },
  );
  return {
    reportInterfaceParameters: fromBatch ?? singleData,
    isFetching: !fromBatch && isFetching,
    isUninitialized: !fromBatch && isUninitialized,
  };
};

export const usePrefetchReportInterfaceParameters = (blueprintId: string) => {
  const dispatch = useDispatch() as any;
  const { data: blueprint } = useGetBlueprintQuery(
    { id: blueprintId },
    { skip: !blueprintId },
  );
  const file_cross_id = blueprint?.file_cross_id;

  const prefetchBatch = useCallback(async () => {
    if (!file_cross_id) return;
    const result = await dispatch(
      blueprintsApi.endpoints.getReportsInterfaceParametersBatch.initiate({
        file_cross_id,
      }),
    );
    const data = result?.data;
    if (!data) return;
    populateBatchReportParamsCache(blueprintId, data.reports);
  }, [dispatch, file_cross_id, blueprintId]);

  return { prefetchBatch };
};

export enum ActionTypeEnum {
  ADD = 'add',
  EDIT = 'edit',
}

export type ActionType = ActionTypeEnum.ADD | ActionTypeEnum.EDIT;
export const useSaveBlueprint = (
  action: ActionType,
  addBlueprintToRiverForm = null,
  hidden = false,
) => {
  const [failure, setFailure] = useToggle(false);
  const { error, warning } = useToastComponent();
  const [createBlueprint, { isLoading: addingBlueprint, data: newBlueprint }] =
    useCreateBlueprintMutation();
  const [addBlueprintFile, { isLoading: creating }] =
    useAddBlueprintFileMutation();
  const [updateBlueprint] = useEditBlueprintMutation();
  const [editBlueprintFile, { isLoading: editing }] =
    useEditBlueprintFileMutation();

  const useAddNewBlueprint = useCallback(
    async (content, name, description) => {
      const fileRes: any = await addBlueprintFile({ content, hidden });
      if (fileRes?.data) {
        if (fileRes?.data?.error_message) {
          warning({
            title: 'File Validation',
            description: fileRes?.data?.error_message,
            duration: 10000,
          });
        }
        const bp: any = await createBlueprint({
          file_cross_id: fileRes?.data?.cross_id,
          name: name || fileRes?.data?.filename,
          description,
          hidden,
        });
        if (addBlueprintToRiverForm) {
          addBlueprintToRiverForm(bp.data.cross_id);
        }
      } else {
        error({
          description:
            (typeof fileRes?.error?.data === 'string' && fileRes.error.data) ||
            'Failed to create blueprint',
          duration: 30000,
        });
        setFailure(true);
      }
    },
    [
      addBlueprintFile,
      hidden,
      createBlueprint,
      addBlueprintToRiverForm,
      warning,
      error,
      setFailure,
    ],
  );

  const [getFile] = useLazyGetFileQuery();
  const useEditExistingBlueprint = useCallback(
    async (content, name, description, file, blueprintId): Promise<boolean> => {
      const fileRes: any = await editBlueprintFile({
        content,
        name: file.filename,
        cross_id: file.cross_id,
      });
      if (fileRes?.data) {
        if (fileRes?.data?.error_message) {
          warning({
            title: 'File Validation',
            description: fileRes?.data?.error_message,
            duration: 10000,
          });
        }
        //I'm refetching the file so it will be updated in the cache
        await getFile(fileRes?.data?.cross_id);
        updateBlueprint({
          recipe_id: blueprintId,
          file_cross_id: fileRes?.data?.cross_id,
          name,
          description,
        });
        return true;
      }
      error({
        description: fileRes?.error?.data || 'Failed to update file',
        duration: 30000,
      });
      setFailure(true);
      return false;
    },
    [editBlueprintFile, error, getFile, setFailure, updateBlueprint, warning],
  );

  return {
    loading: [addingBlueprint, editing, creating].some(Boolean),
    saveBlueprint:
      action === ActionTypeEnum.ADD
        ? useAddNewBlueprint
        : useEditExistingBlueprint,
    newBlueprint,
    error: failure,
  };
};

export const isBlueprintParametersSetOnRiver = river => {
  const sourceInterfaceParams =
    river?.properties?.source?.additional_settings?.interface_parameters;
  if (sourceInterfaceParams) {
    return { interface_parameters: sourceInterfaceParams };
  }
  return null;
};

export const useIsInterfacePrametersSet = () => {
  const formApi = useFormContext();

  const { field: blueprint } = useController({
    name: 'blueprint',
    control: formApi.control,
  });
  const sourceInterfaceParams = formApi?.watch(
    'river.properties.source.additional_settings.interface_parameters',
  );
  const blueprintAuthentication = blueprint?.value?.authentication;
  const hasSelectedInterfaceParams = useMemo(
    () =>
      [
        sourceInterfaceParams && Boolean(sourceInterfaceParams?.source?.length),
        blueprintAuthentication && Object.keys(blueprintAuthentication)?.length,
      ].some(Boolean),
    [blueprintAuthentication, sourceInterfaceParams],
  );

  return {
    hasSelectedInterfaceParams,
  };
};

export function mergeArraysWithOverride(arr1, arr2) {
  const mergedMap = new Map(arr1.map(item => [item.name, item]));

  arr2.forEach(item => {
    if (mergedMap.has(item.name)) {
      mergedMap.set(item.name, item);
    }
  });

  return Array.from(mergedMap.values());
}

export const interfaceParamsToSupportBoolean = interface_parameters =>
  interface_parameters.map(param => {
    if (param?.type === 'boolean') {
      return {
        ...param,
        value: JSON.parse(param.value),
      };
    }
    return param;
  });
