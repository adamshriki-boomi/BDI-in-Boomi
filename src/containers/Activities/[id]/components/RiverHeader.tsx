import { RiverTypes, TasksDefinition } from 'api/types';
import {
  AppRoutes,
  LegacyRoutes,
  RoutesBuilder,
  useAccountRoute,
} from 'app/routes';
import {
  Breadcrumbs,
  ExportIcon,
  Flex,
  HStack,
  Icon,
  PageOverlaySpinner,
  RiveryButton,
  Text,
} from 'components';
import { createSidebarUrl } from 'layout/Sidebar/common';
import { useDataSourcesSections } from 'modules';
import { useEffect } from 'react';
import { generatePath, useHistory, useParams } from 'react-router-dom';
import { useAccount } from 'store/core';
import { useRiverId } from '../../helpers';
import { getRiverName, getRiverType, useFetchRiverQuery } from '../../store';
import { SourceToTargetIcon } from './SourceToTargetIcon';

export const sourceToTargetTypes = [
  RiverTypes.SOURCE_TO_TARGET,
  RiverTypes.SOURCE_TO_FZ,
];

const getIcons = (tasks: TasksDefinition[]) => {
  const sourceIcon = tasks?.[0]?.datasource_id;
  const targetIcon = tasks?.[1]?.datasource_id;
  return { sourceIcon, targetIcon };
};

export function RiverHeader() {
  const {
    data: river,
    isFetching,
    isLoading,
    isError,
  } = useFetchRiverQuery(useRiverId());
  const { account: accountId, env: envId } = useParams<{
    account: string;
    env: string;
  }>();
  const { push } = useHistory();
  const riverType = getRiverType(river);
  const riverName = getRiverName(river);
  const isDeleted = Boolean(river?.river_definitions?.is_deleted);
  const loading = isLoading || isFetching;
  const sourceID = river?.tasks_definitions?.find(
    task => task?.ordinal === 0,
  )?.datasource_id;
  const { selectedDataSource } = useDataSourcesSections('source', sourceID);
  const isNewInterface =
    selectedDataSource?.data_source_type_settings?.is_new_interface;

  //If we don't have a river, we redirect to the activities page
  //This can happen when switching envs for example
  useEffect(() => {
    if (isError && !river) {
      push(createSidebarUrl('activities', 'activities')({ accountId, envId }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [river, isError]);

  return (
    <BreadCrumbsContainer riverName={riverName}>
      {loading ? (
        <PageOverlaySpinner />
      ) : (
        <HStack
          justify="space-between"
          pb={2}
          borderBottom="1px solid"
          borderColor="gray.300"
        >
          <RiverTitle
            riverName={riverName}
            enableGoToRiverLink={!isDeleted}
            riverType={riverType}
            justify="space-between"
            isV2={river?.river_definitions?.is_api_v2}
            isSourceNewInterface={isNewInterface}
          >
            <SourceToTargetIcon
              {...getIcons(river?.tasks_definitions)}
              riverType={riverType}
            />
          </RiverTitle>
        </HStack>
      )}
    </BreadCrumbsContainer>
  );
}

const BreadCrumbsContainer = ({ riverName, children }) => {
  const monitoringUrl = useAccountRoute(RoutesBuilder.monitoring);

  return (
    <>
      <Breadcrumbs
        links={[
          { label: 'Activities', href: monitoringUrl },
          {
            label: riverName,
          },
        ]}
      />
      {children}
    </>
  );
};

const RiverTitle = ({
  enableGoToRiverLink,
  riverType,
  riverName,
  children,
  isV2,
  isSourceNewInterface,
  ...styleProps
}) => {
  const { isSettingOn } = useAccount();
  const showNeStt =
    isSettingOn('allow_create_new_stt') && isV2 & isSourceNewInterface;
  const pattern =
    riverType === RiverTypes.LOGIC || showNeStt
      ? AppRoutes.RIVER
      : LegacyRoutes.RIVER;

  const url = generatePath(pattern, {
    ...useParams(),
  });
  return (
    <Flex w="full" alignItems="center" {...styleProps}>
      <HStack w="full">
        {children}
        <HStack w="full" justify="space-between">
          <Text fontWeight="medium" fontSize="lg">
            {riverName}
          </Text>
          <RiveryButton
            fontWeight="400!important"
            label="Go to Data Flow"
            variant="link"
            href={url}
            target="_blank"
            rightIcon={<Icon as={ExportIcon} boxSize="14px" />}
          />
        </HStack>
      </HStack>
    </Flex>
  );
};
