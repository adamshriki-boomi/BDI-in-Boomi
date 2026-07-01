import { ILastRun } from 'api/types';
import { useDataSourcesSections } from 'modules';
import {
  createRiverTemplate,
  IRiverV1,
  PollTestResponse,
} from 'modules/SourceTarget';
import { createSourceLegacyRoute } from 'modules/SourceTarget/hooks';
import { useCallback } from 'react';
import { useFormContext } from 'react-hook-form';
import { useHistory } from 'react-router-dom';
import { useSearchParam } from 'react-use';
import { useAccount, useCore } from 'store/core';

export type RiverForm = {
  river: IRiverV1;
  lastRun?: ILastRun;
  blueprint?: { authentication?: any; interface_parameters?: any };
  tests?: {
    source: PollTestResponse;
    target: PollTestResponse;
  };
};

export const useGetAndValidateDataSource = type => {
  const { isSettingOn } = useAccount();
  const {
    push,
    location: { search, pathname },
  } = useHistory();
  const { selectedAccountId: account, envId: env } = useCore();
  const allow_new_stt = isSettingOn('allow_create_new_stt');
  const sourceFromURL = useSearchParam(`selected_${type}`);
  const { selectedDataSource: selectedDS } = useDataSourcesSections(
    type,
    sourceFromURL,
  );
  if (Boolean(selectedDS)) {
    const isV2 = selectedDS?.data_source_type_settings?.is_new_interface;
    if (isV2 && allow_new_stt) {
      return selectedDS?.api_name ?? sourceFromURL;
    }
    if (pathname.includes('rivers')) {
      //if not in legacy route
      push(createSourceLegacyRoute(account, env, search));
    }
  }
  if (allow_new_stt === false && pathname.includes('rivers')) {
    push(createSourceLegacyRoute(account, env, search));
  }
  return null;
};

export const usePrepopulateFields = (sourceFromURL, targetFromURL) => {
  const initialFormValues = createRiverTemplate();
  const repositoryIdFromURL = useSearchParam('repository_id');
  const knowledgeBaseIdFromURL = useSearchParam('kb_id');

  const createRiverDefaults = useCallback(() => {
    return {
      ...initialFormValues,
      properties: {
        ...initialFormValues.properties,
        source: {
          ...initialFormValues.properties.source,
          name: sourceFromURL,
        },
        target: {
          ...initialFormValues.properties.target,
          name: targetFromURL,
          ...(repositoryIdFromURL && { repository_id: repositoryIdFromURL }),
          ...(knowledgeBaseIdFromURL && {
            knowledge_base_id: knowledgeBaseIdFromURL,
          }),
        },
      },
    } as Omit<
      IRiverV1,
      | 'cross_id'
      | 'account_id'
      | 'notification_settings'
      | 'environment_cross_id'
      | 'environment_name'
    >;
  }, [
    initialFormValues,
    sourceFromURL,
    targetFromURL,
    repositoryIdFromURL,
    knowledgeBaseIdFromURL,
  ]);
  return createRiverDefaults;
};

export const useCreateSttFormContext = () => useFormContext<RiverForm>();
