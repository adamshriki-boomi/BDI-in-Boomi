import { Box, Flex, Icon } from '@chakra-ui/react';
import { ExoText } from 'components/Exosphere/ExoText';
import { ExSegmentedControls } from '@boomi/exosphere/dist/react/segmentedcontrols';
import { ExSegmentedControl } from '@boomi/exosphere/dist/react/segmentedcontrol';
import { useState } from 'react';
import { RiveryTable } from 'components/RiveryTable/RiveryTable';
import { activitiesColumns } from 'containers/Activities/components/ActivitiesColumns';
import { useDashboardRecentActivities } from './hooks/useDashboardRecentActivities';
import { useCore } from 'store/core';
import { useGetEnvironmentsQuery } from 'modules/Environments/environments.query';
import { compare } from 'utils/array.utils';
import {
  getHasRivers as fetchHasRivers,
  HasRiversResponse,
} from 'containers/Rivers/RiversV1/riversV1.query';
import { useAsyncFn, useEffectOnce } from 'react-use';
import { generatePath, Link } from 'react-router-dom';
import { AppRoutes } from 'app/routes';
import { FiExternalLink } from 'react-icons/fi';
import { RiveryOverlay } from 'components/RiveryOverlay/RiveryOverlay';
import { DashboardRecentActivitiesTags } from 'utils/tracking.tags';

type FilterType = 'all' | 'success' | 'failed';

function renderFilterControls(
  selectedFilter: FilterType,
  setSelectedFilter: (filter: FilterType) => void,
) {
  return (
    <ExSegmentedControls
      onSelectionChange={(e: any) => {
        const index =
          e?.detail?.index ?? e?.detail?.selectedIndex ?? e?.detail?.selected;
        if (index === 0) setSelectedFilter('all');
        else if (index === 1) setSelectedFilter('success');
        else if (index === 2) setSelectedFilter('failed');
      }}
    >
      <ExSegmentedControl
        label="All"
        selected={selectedFilter === 'all'}
        data-pendo-id={DashboardRecentActivitiesTags.ALL_FILTER}
      />
      <ExSegmentedControl
        data-pendo-id={DashboardRecentActivitiesTags.SUCCESS_FILTER}
        label="Success"
        selected={selectedFilter === 'success'}
      />
      <ExSegmentedControl
        data-pendo-id={DashboardRecentActivitiesTags.FAILED_FILTER}
        label="Failure"
        selected={selectedFilter === 'failed'}
      />
    </ExSegmentedControls>
  );
}

export function DashboardRecentActivities() {
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
  const { data, isLoading } = useDashboardRecentActivities(selectedFilter);
  const { envId, activeAccountId } = useCore();
  const { data: environmentEntities } = useGetEnvironmentsQuery('');
  const currentEnv = environmentEntities?.find(compare('_id', envId));
  const envName = currentEnv?.environment_name || '';
  const [{ value: hasRiversData }, getHasRivers] = useAsyncFn(
    async (account_id: string, environment_id?: string) =>
      fetchHasRivers(
        account_id,
        environment_id ? { env_id: environment_id } : {},
      ) as Promise<HasRiversResponse>,
    [],
  );

  useEffectOnce(() => {
    if (activeAccountId) {
      getHasRivers(activeAccountId, envId);
    }
  });

  if (!hasRiversData?.has_rivers) {
    return null;
  }

  const activitiesPath = generatePath(AppRoutes.ACTIVITIES, {
    account: activeAccountId || '',
    env: envId || '',
  });

  return (
    <Box
      bg="background"
      borderRadius="var(--exo-spacing-x-small, 8px)"
      border="1px solid"
      borderColor="border-secondary"
      padding="var(--exo-spacing-large, 24px)"
    >
      <Flex flexDirection="column" gap="var(--exo-spacing-standard, 16px)">
        <Flex justifyContent="space-between" alignItems="center">
          <Flex alignItems="center" gap={3}>
            <ExoText styleName="Subhead 1 Bold">
              Recent Activity in {envName} Environment
            </ExoText>
            <RiveryOverlay description="Go To All Activities" placement="top">
              <Link to={activitiesPath}>
                <Flex
                  alignItems="center"
                  gap={1}
                  color="blue.500"
                  fontSize="sm"
                  alignSelf="center"
                >
                  <Icon
                    as={FiExternalLink}
                    boxSize={4}
                    color={'var(--exo-palette-blue-60)'}
                  />
                </Flex>
              </Link>
            </RiveryOverlay>
          </Flex>
          <Flex alignItems="center" gap={3}>
            {renderFilterControls(selectedFilter, setSelectedFilter)}
          </Flex>
        </Flex>
        <Box>
          <RiveryTable
            columns={activitiesColumns}
            data={data || []}
            noPagination
            inline
            ariaLabel="recent activities"
            loader={isLoading}
          />
        </Box>
      </Flex>
    </Box>
  );
}
