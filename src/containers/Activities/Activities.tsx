import { IActivity } from 'api/types';
import { Breadcrumbs, Divider, Flex, NoResults, View } from 'components';
import { PaginatedApiRiveryTable } from 'components/RiveryTable/PaginatedApiRiveryTable';
import { Tagger } from 'components/Tracking/Tagger';
import React from 'react';
import { ActivitiesTags } from 'utils/tracking.tags';
import { activitiesColumns } from './components/ActivitiesColumns';
import { ActivitiesFilters } from './components/ActivitiesFilters';
import { ActivitiesStats } from './components/ActivitiesStats';
import { useActivitiesFilterActions } from './store';
import { useFetchActivities, useFetchData } from './useFetchActivities';

const paramIdMap = {
  group_id: 'group_id',
  is_scheduled: 'is_scheduled',
  river_type: 'river_type',
  search: 'search',
  status: 'status',
  end_time: 'end_time',
  start_time: 'start_time',
};
const monitoringBreadcrumbs = [{ label: 'Activities' }];
export function Activities() {
  const { clear } = useActivitiesFilterActions();
  const { params, api } = useFetchActivities(clear);
  return (
    <Tagger tags={ActivitiesTags.VIEW_PAGE}>
      <View as={Flex} p="3" flexDir="column" gap="4">
        <Breadcrumbs links={monitoringBreadcrumbs} />
        <Flex flexDir="column" gap={2}>
          <ActivitiesFilters
            value={params}
            onChange={api.setParam}
            onReset={api.resetParams}
          />
          <Divider />
          <ActivitiesStats params={params} api={api} />
        </Flex>
        <PaginatedApiRiveryTable<IActivity>
          useApiQuery={useFetchData}
          inline
          entityType="Activities"
          aria-label="activities list"
          paramIdMap={paramIdMap}
          columns={activitiesColumns}
          showDefaultFilter={false}
          recordNotFound={NoResults}
          noRecords={NoResults}
        />
      </View>
    </Tagger>
  );
}
