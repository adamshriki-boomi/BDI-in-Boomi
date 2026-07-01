import { API } from 'api';
import { getQueryParams, useSetQueryParams } from 'hooks/router';
import { useCallback } from 'react';
import { useWatch } from 'react-hook-form';
import { getOId } from 'utils/api.sanitizer';
import {
  useModifyPackageMutation,
  usePreparePackageMutation,
} from '../packages.query';
import { useToastComponent } from 'hooks/useToast';

export enum ViewModes {
  ADD = 'Add',
  EDIT = 'Edit',
  VIEW = 'View',
}

export function paginationData(result) {
  return {
    data: result.data,
    total: result.total_entities,
    totalShowing: result.total_filtered_entities,
    totalPages: result.total_pages,
  };
}

export const useFetchUrl = (entity, sourceEnv, targetEnv) => {
  const { package_id } = getQueryParams(['package_id']);
  const url = `package/entities?entity_type=${entity}&env_src=${sourceEnv}&env_trg=${targetEnv}`;
  if (package_id) {
    return url.concat(`&package_id=${package_id}`);
  }
  return url;
};

const queryKeysMap = {
  pageIndex: 'page',
  pageSize: 'page_size',
};

const allParams = [
  'name_src',
  'is_scheduled_src',
  'group_id_src',
  'type_src',
  'package_id',
  'deployment_id',
  'entity_id',
  'mode',
  'entity_ids',
  'sortBy',
  'sortOrder',
];

export const useResetAllQueryParams = (params = allParams) => {
  const setQueryParams = useSetQueryParams();
  return useCallback(() => {
    params.forEach((param: string) => setQueryParams({ [param]: null }));
  }, [params, setQueryParams]);
};

export const commonParamsDefinitions = {
  pagination: {
    pageIndex: 0,
    pageSize: 20,
  },
  toParamsFunction: params =>
    Object.fromEntries(
      Object.entries(params)
        .map(([key, value]) => [queryKeysMap[key] ?? key, value])
        .map(([key, value]) => [
          key,
          key === 'page' ? Number(value) + 1 : value,
        ])
        .filter(([_, value]) => value || value === 0),
    ),
};

const requiredFirstStep = [
  'package_name',
  'env_id_trg',
  'env_id_trg.$oid',
  'env_id_src.$oid',
];

export const useStepValidation = (formApi, step, isEditMode = false) => {
  const entities = formApi?.watch('entities');
  let hasSelectedEntities = [];
  if (entities) {
    hasSelectedEntities = Object.values(entities)
      .map(entity => Object.entries(entity).some(([_, value]) => value))
      .filter(value => Boolean(value));
  }
  if (step === 0) {
    const errors = requiredFirstStep
      .map(field => formApi?.formState?.errors[field])
      .filter(value => value);
    const values = requiredFirstStep
      .map(field => formApi?.watch(field))
      .filter(value => value);
    return {
      0: true,
      1: Boolean(
        errors?.length === 0 && values.length === requiredFirstStep?.length,
      ),
      2: hasSelectedEntities?.length > 0,
    };
  }
  if (step === 1 || isEditMode) {
    const entities = formApi?.watch('entities');
    if (entities) {
      const hasSelectedEntities = Object.values(entities)
        .map(entity => Object.entries(entity).some(([_, value]) => value))
        .filter(value => Boolean(value));
      return { 0: true, 1: true, 2: hasSelectedEntities?.length > 0 };
    }
    return { 0: true, 1: true, 2: false };
  }
  return { 0: true, 1: true, 2: true };
};

export function filterUnique(item, index, self) {
  return (
    index ===
    self.findIndex(
      o =>
        o.value.toLowerCase() === item.value.toLowerCase() &&
        o.label.toLowerCase() === item.label.toLowerCase(),
    )
  );
}

export const commonSelectStyle = {
  menuPortal: base => ({ ...base, zIndex: 5000 }),
};

enum FormValues {
  PACKAGE_NAME = 'package_name',
  SOURCE = 'env_id_src.$oid',
  SOURCE_NAME = 'env_src_name',
  TARGET = 'env_id_trg.$oid',
  ID = '_id',
  ENTITIES = 'entities',
}

export const useGetFormValues = control => {
  const name = useWatch({
    control,
    name: FormValues.PACKAGE_NAME,
  });
  const id = useWatch({
    control,
    name: FormValues.ID,
  });
  const sourceEnv = useWatch({
    control,
    name: FormValues.SOURCE,
  });
  const targetEnv = useWatch({
    control,
    name: FormValues.TARGET,
  });
  const entities = useWatch({
    control,
    name: FormValues.ENTITIES,
  });
  return { name, id, sourceEnv, targetEnv, entities };
};

export function preparePayload(values) {
  const rawEntities = values?.entities;
  let entities = {};
  let entities_total = {};
  if (rawEntities) {
    entities = Object.entries(rawEntities).reduce((acc, [key, values]) => {
      const selected = Object.entries(values).filter(([k, v]) => {
        if (v) return k;
        return null;
      });
      acc[key] = Object.assign({}, ...selected.map(([k, v]) => ({ [k]: v })));
      return acc;
    }, {});

    entities_total = Object.assign(
      {},
      ...Object.entries(entities)?.map(([key, values]) => {
        const length = Object.values(values).length;
        return { [key]: length };
      }),
    );
  }

  return {
    ...values,
    entities,
    entities_total,
  };
}

export function modifyExcludedEntities(values) {
  const entities = values?.excluded_entities;
  if (entities) {
    const excluded_entities = Object.entries(entities).reduce(
      (acc, [entity, excluded]) => {
        const markExcluded = Object.entries(excluded).reduce(
          (acc, [id, value]) => {
            if (value === false) {
              acc[id] = true;
            }
            return acc;
          },
          {},
        );
        acc[entity] = markExcluded;
        return acc;
      },
      {},
    );
    return { ...values, excluded_entities };
  }
  return values;
}

export const useModifyAndSave = (formApi, cb = null, setDeploying = null) => {
  const { error } = useToastComponent();
  const [modify] = useModifyPackageMutation();
  const withExcluded = modifyExcludedEntities(formApi?.watch());
  const package_definition = preparePayload(withExcluded);
  return useCallback(
    async (methodType, package_id = null, shouldUpdateForm = true) => {
      const res: any = await modify({
        package_definition,
        methodType,
        package_id,
      });
      if (res?.error) {
        error({ description: res?.error?.data?.message });
        setDeploying(false);
        return;
      } else {
        cb && cb();
        shouldUpdateForm && formApi?.reset({ ...res.data, package_id });
        return res.data;
      }
    },
    [cb, error, formApi, modify, package_definition, setDeploying],
  );
};

export const usePreparePackage = (successCB, errorCB) => {
  const [prepare] = usePreparePackageMutation();
  return useCallback(
    async (package_id, isNew = false) => {
      const status: any = await prepare(package_id);
      if (status?.error) {
        errorCB(status.error.data.message);
      }
      pollResponse({
        id: getOId(status.data._id),
        additionalData: { isNew, package_id },
        successCB,
        errorCB,
      });
    },
    [prepare, successCB, errorCB],
  );
};

export async function pollResponse({
  id,
  successCB,
  errorCB,
  additionalData = null,
  intervalPoll = null,
}) {
  const polling = await API.metadata.pollMetadata(id);
  if (['W', 'R'].includes(polling?.request_status)) {
    if (intervalPoll) {
      intervalPoll();
    }
    setTimeout(
      () =>
        pollResponse({ additionalData, id, successCB, errorCB, intervalPoll }),
      1500,
    );
    return;
  }
  if (polling?.request_status === 'E') {
    return errorCB(polling?.error_msg);
  }
  if (polling?.request_status === 'D') {
    return successCB({ ...additionalData, ...polling?.results });
  }
}
