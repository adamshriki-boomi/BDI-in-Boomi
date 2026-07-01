import { apiV1 } from 'api/api.proxy';
import { useDisclosure } from 'components';
import { useToastComponent } from 'hooks/useToast';
import { useGetAllDataSourcesQuery } from 'modules';
import {
  useDeleteConfigMutation,
  useIsBlueprint,
  useIsCustomQuery,
  useIsStorageTarget,
  usePostConfigMutation,
  useRiverActivation,
  useSttSource,
  useGetRiverCommonProps,
} from 'modules/SourceTarget';
import { useCallback, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useAsyncFn } from 'react-use';
import { getV1Path } from 'store/createRiveryApi';
import { compare } from 'utils/array.utils';

export const useSelectedSourceTopology = () => {
  const source = useSttSource();
  const { data: dataSourcesArray } = useGetAllDataSourcesQuery(null);
  const ds = dataSourcesArray?.find(compare('api_name', source?.name));
  return {
    ds: ds?.id,
    log_doc: ds?.feature_flags?.log_doc,
    topology: ds?.feature_flags?.topology,
    feature_flags: ds?.feature_flags,
  };
};

const baseStatusMap = {
  validate_river_target: 'Validating Target',
  update_river_settings: 'Updating Data Flow Settings',
};

export const useRiverStatusMap = () => {
  const CDCStatusMap = {
    enable: 'Enabling Data Flow',
    update_river_settings: 'Updating Data Flow Settings',
  };

  const blueprintStatusMap = {
    ...baseStatusMap,
  };

  const customQueryStatusMap = {
    validate_custom_query_mapping: 'Validating Custom Query Mapping',
    ...baseStatusMap,
  };

  const { isCDC, isByVersionExtractMethodSelected } = useGetRiverCommonProps();
  const isBluePrint = useIsBlueprint();
  const isCustomQuery = useIsCustomQuery();
  const isStorageTarget = useIsStorageTarget();

  if (isByVersionExtractMethodSelected) return baseStatusMap;
  if (isCDC) return CDCStatusMap;
  if (isBluePrint) return blueprintStatusMap;
  if (isCustomQuery && !isStorageTarget) return customQueryStatusMap;
  return baseStatusMap;
};

export const useSelectedValueToggle = (value, option) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  useEffect(() => {
    if (value === option) {
      onOpen();
    } else {
      onClose();
    }
  }, [onClose, onOpen, option, value]);
  return { isOpen };
};

export const useEnableRiver = (
  syncOption,
  riverId,
  config,
  runningOperation,
) => {
  const { error } = useToastComponent();
  const { ds } = useSelectedSourceTopology();
  const {
    setRiverActive,
    statusLog,
    setStatus,
    completed,
    activationError,
    isLoading,
  } = useRiverActivation(runningOperation);
  const [postConfig, { isLoading: pLoading }] = usePostConfigMutation();
  const [deleteConfig, { isLoading: dLoading }] = useDeleteConfigMutation();
  const enableRiver = useCallback(async () => {
    if (syncOption === 'manual') {
      const response: any = await postConfig({
        crossId: riverId,
        config: { ...config, datasource_type: ds },
      });
      if (response?.error) {
        error({
          description:
            response.error?.data?.detail?.[0]?.msg ?? 'Something went wrong',
        });
        return;
      }
    }
    if (syncOption === 'reinitialize') {
      await deleteConfig(riverId);
    }
    setRiverActive(riverId);
  }, [
    config,
    deleteConfig,
    error,
    postConfig,
    riverId,
    setRiverActive,
    ds,
    syncOption,
  ]);

  return {
    enableRiver,
    statusLog,
    clearStatusLog: () => setStatus(null),
    completed,
    activationError,
    loading: isLoading || pLoading || (dLoading && !Boolean(statusLog)),
  };
};

function pathnameForRun(isNewRiver, newRiverId, pathname) {
  return isNewRiver
    ? pathname.replace('new/source-to-target', newRiverId)
    : pathname;
}

export const useCancelPullRequestRun = () => {
  const [{ value }, cancel] = useAsyncFn(async operation_id => {
    return await apiV1.post(
      getV1Path(true, `/pull_requests/${operation_id}/cancel_run`),
      {},
    );
  }, []);
  return { cancel, cancelResponse: value };
};

export const useHandleReplaceRouteAndRun = (
  isNewRiver,
  newRiverId,
  toggle,
  clearStatusLog,
) => {
  const {
    replace,
    location: { pathname, search },
  } = useHistory();
  return useCallback(
    runRiver => {
      replace({
        pathname: pathnameForRun(isNewRiver, newRiverId, pathname),
        state: { runRiver },
        search,
      });
      clearStatusLog();
      toggle(false);
    },
    [clearStatusLog, isNewRiver, newRiverId, pathname, replace, search, toggle],
  );
};
