import {
  LabelsSources,
  useGetAllDataSourcesQuery,
  useGetAllSectionsQuery,
} from 'modules/Datasources/store';
import { useGetTargetTypesQuery } from 'modules/Datasources/store/targets.query';
import { compare } from 'utils/array.utils';
import { useAccount, useCore } from 'store/core';
import { IDataSourceV1, SourceTypes } from 'api/types';
import { useSttSource } from 'modules/SourceTarget';

export const isRolloutConnectorAccount = ({ source, account }) => {
  return source?.feature_flags?.rollout_connector_accounts?.includes(account);
};

const isSourceRolloutConnectorAccount = ({ source, account, isSettingOn }) => {
  return (
    source.status === LabelsSources.SOON &&
    (isRolloutConnectorAccount({ source, account }) ||
      (source.api_name === SourceTypes.BLUEPRINT &&
        isSettingOn('allow_recipe')))
  );
};

const getLabelsAndStatus = ({ source, account, isSettingOn }) => {
  const ignoreComingSoon = isSourceRolloutConnectorAccount({
    source,
    account,
    isSettingOn,
  });
  return {
    labels: source.labels?.filter(label =>
      ignoreComingSoon ? label !== LabelsSources.SOON : true,
    ),
    status: ignoreComingSoon ? LabelsSources.ENABLED : source.status,
  };
};

const isSourceNewInterface = ({ source, account }) =>
  source?.data_source_type_settings?.is_new_interface ||
  (source?.status !== LabelsSources.SOON &&
    !source?.labels?.includes(LabelsSources.ALPHA) &&
    isRolloutConnectorAccount({ source, account }));

export function getSourceFromAPIName(
  sources: any,
  sourceAPIName: string,
): IDataSourceV1 {
  return sources?.find(compare('api_name', sourceAPIName));
}

const isTargetNewInterface = ({ target, account, targetTypes }) =>
  //For ALPHA sources skip rollout connector account condirion for new interface
  (!target?.labels?.includes(LabelsSources.ALPHA) &&
    target?.feature_flags?.rollout_connector_accounts?.includes(account)) ||
  targetTypes?.find(t => t.datasource_type_id === target?.id)?.target_settings
    ?.is_new_interface;

export function useDataSourcesSections(segment, sourceAPIName = null) {
  const { isSettingOn } = useAccount();
  const { data: entities } = useGetAllDataSourcesQuery(segment);
  const { data: dataSourcesSectionsArray } = useGetAllSectionsQuery(segment);
  const { data: targetTypes } = useGetTargetTypesQuery(undefined, {
    skip: segment !== 'target',
  });
  const { selectedAccountId } = useCore();

  const entities_filtered = entities?.map(section => {
    const { labels, status } = getLabelsAndStatus({
      source: section,
      account: selectedAccountId,
      isSettingOn,
    });

    const is_new_interface =
      segment === 'source'
        ? isSourceNewInterface({
            source: section,
            account: selectedAccountId,
          })
        : isTargetNewInterface({
            target: section,
            account: selectedAccountId,
            targetTypes,
          });

    return segment === 'target' && !targetTypes
      ? null
      : {
          ...section,
          labels,
          status,
          data_source_type_settings: {
            ...section?.data_source_type_settings,
            is_new_interface,
          },
        };
  });
  const sections = dataSourcesSectionsArray?.map(({ data_source_section }) => {
    return {
      section_name: data_source_section.name,
      section_description: data_source_section.description,
      section_datasources: entities_filtered
        ?.filter(compare('section_id', data_source_section.id))
        .map(section => ({
          ...section,
          section_name: data_source_section.name,
        })),
    };
  });
  const selectedDataSource = sourceAPIName
    ? entities_filtered?.find(compare('name', sourceAPIName)) ??
      entities_filtered?.find(compare('api_name', sourceAPIName)) ??
      entities_filtered?.find(compare('id', sourceAPIName))
    : null;

  return {
    sections,
    entities: entities_filtered,
    selectedDataSource,
  };
}

export const useIsTargetOpenForBlueprint = type => {
  const { data: targetTypes } = useGetTargetTypesQuery(undefined, {
    skip: type !== 'Target',
  });
  const allowedTargets = targetTypes?.reduce((acc, target) => {
    if (target?.target_settings?.allowed_for_blueprint) {
      acc.push(target?.api_name);
    }
    return acc;
  }, []);
  return allowedTargets ?? [];
};

export const useIsCustomQuerySupported = () => {
  const source = useSttSource();
  const { selectedDataSource } = useDataSourcesSections('source', source?.name);
  const hideCustomQuery =
    selectedDataSource?.feature_flags?.custom_query === false;
  const newUICustomQuery =
    selectedDataSource?.feature_flags?.custom_query_new_ui;
  return {
    showCustomQuery: !hideCustomQuery,
    newUICustomQuery,
  };
};
