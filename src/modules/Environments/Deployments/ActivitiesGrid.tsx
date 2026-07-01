import { Flex } from '@chakra-ui/react';
import { Box, Center, NoEntities, NoResults } from 'components';
import { PageOverlaySpinner } from 'components/Loaders/Loader';
import { getQueryParams } from 'hooks/router';
import { useEffect, useMemo, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { DeploymentsGridComponent } from './components/DeploymentGrid';
import { pollResponse, ViewModes } from './components/helpers';
import './Deployments.scss';
import { useGetActivitiesQuery, ViewTypes } from './packages.query';
import { SearchComponent } from './SearchComponent';

export const DEFAULT_TIME_RANGE = 'Last 7 Days';

function statusFilter(filters, revert_status, deployment_status) {
  const statusArray = filters?.package_status?.map(({ value }) => value);
  return statusArray?.some(
    status =>
      (status?.revert_status && status?.revert_status === revert_status) ||
      status?.deployment_status === deployment_status,
  );
}

function nameFilter(filters, package_name) {
  return package_name
    .toLowerCase()
    .includes(filters?.package_name.toLowerCase());
}

function dateFilter(filters, deployed_at) {
  return (
    filters?.date_range?.time.event_end_time > deployed_at?.$date &&
    deployed_at?.$date > filters?.date_range?.time.event_start_time
  );
}

function filterResults(filters, activities) {
  return activities?.filter(item => {
    const { revert_status, deployment_status, deployed_at, package_name } =
      item;
    const includesStatus = filters?.package_status
      ? statusFilter(filters, revert_status, deployment_status)
      : true;
    const includesName = filters?.package_name
      ? nameFilter(filters, package_name)
      : true;
    const includesDate =
      filters?.date_range && filters?.date_range?.label !== DEFAULT_TIME_RANGE
        ? dateFilter(filters, deployed_at)
        : true;

    if (includesStatus && includesName && includesDate) {
      return item;
    }
    return null;
  });
}

function arrangeData(data) {
  return data?.map(item => {
    if (item?.revert_status && item.deployment_status) {
      return { ...item, deployment_status: null };
    }
    return item;
  });
}

const useActivities = (filters, data) => {
  const [activities, setActivities] = useState(null);
  useEffect(() => {
    if (data) {
      if (filters && Object.values(filters).some(filter => Boolean(filter))) {
        setActivities(filterResults(filters, arrangeData(data)));
        return;
      }
      setActivities(arrangeData(data));
    }
  }, [data, filters]);
  return activities;
};

export function ActivitiesView({
  isDeploying = null,
  onOpen = null,
  mode = 'Add',
}) {
  const { control } = useFormContext();
  const filters = useWatch({
    control,
    name: ViewTypes.ACTIVITY,
  });
  const packageId = getQueryParams(['package_id']);
  const package_id = useMemo(
    () => (packageId ? packageId.package_id : null),
    [packageId],
  );
  const {
    data,
    isFetching: loadingActivities,
    refetch,
  } = useGetActivitiesQuery({ package_id, dateRange: filters?.date_range });
  const activities = useActivities(filters, data);

  useEffect(() => {
    if (packageId?.package_id) {
      refetch();
    }
    if (isDeploying) {
      pollResponse({
        id: isDeploying,
        successCB: refetch,
        errorCB: null,
        intervalPoll: refetch,
      });
    }
  }, [isDeploying, packageId?.package_id, refetch]);

  if (mode === ViewModes.VIEW) {
    return null;
  }

  return (
    <Flex direction="column" overflow="hidden">
      <Flex pb={2} borderBottom="1px" borderBottomColor="gray.300">
        <SearchComponent
          inlineView={Boolean(packageId.package_id)}
          type={ViewTypes.ACTIVITY}
          minW={1000}
          allDisabled={activities === null}
        />
      </Flex>
      <Box w="100%" overflow="hidden">
        {loadingActivities && !isDeploying ? <PageOverlaySpinner /> : null}
        {activities === null && !loadingActivities && (
          <Center mt={12}>
            <NoEntities entity="Deployment Activity" />
          </Center>
        )}
        {activities?.length === 0 && !loadingActivities ? (
          <NoResults />
        ) : (
          <DeploymentsGridComponent
            type={ViewTypes.ACTIVITY}
            list={activities}
            loading={null}
            onRevertDeployment={refetch}
            onOpenDrawer={onOpen}
          />
        )}
      </Box>
    </Flex>
  );
}
