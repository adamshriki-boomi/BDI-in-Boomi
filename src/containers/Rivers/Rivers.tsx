import { getData } from 'api/api.proxy';
import {
  Breadcrumbs,
  ButtonCreate,
  defaultPagination,
  Flex,
  HStack,
  NoResults,
  PaginatedRiveryTable,
  RiveryTable,
  Tab,
  TableDateTime,
  TablePaginationContext,
  TabList,
  Tabs,
  Text,
  View,
} from 'components';
import RiveryButton from 'components/Buttons/RiveryButton';
import Dot from 'components/Dot/Dot';
import { GroupListActions } from 'containers/River/components/GroupListActions';
import { Groups } from 'containers/River/components/Groups';
import { getQueryParams, useSetQueryParams } from 'hooks/router';
import React, { useCallback, useContext, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Column, useSortBy } from 'react-table';
import { useLocation, useToggle } from 'react-use';
import { useAccount, useCore } from 'store/core';
import { useGroupsLoader, useGroupsState } from 'store/groups';
import { getCrossId } from 'utils/api.sanitizer';
import { CreateRiverDropdown } from './components/CreateRiversButton';
import { RiversTags } from 'utils/tracking.tags';
import { RiverListActionsCell } from './components/RiverListActionsCell';
import {
  ApiTag,
  GroupsSelect,
  RiverDescription,
  RiverGroup,
  RiverName,
  RiverTypeSelect,
  ScheduledSelector,
  ScheduleIndicator,
} from './components/RiversColumnsComponents';
import { RiverRunDialog } from './components/RunDialog';
import './Rivers.scss';
import { NewRiversGrid } from './RiversV1/RiversGrid';

const VIEW_TYPE_KEY = 'viewType';
enum ViewTypes {
  RIVERS = 'rivers',
  GROUPS = 'groups',
}

const TabsIndex = {
  0: ViewTypes.RIVERS,
  1: ViewTypes.GROUPS,
};

const queryKeysMap = {
  pageIndex: 'page',
  pageSize: 'page_size',
};

const paramIdMap = {
  group_id: 'river_definitions.group_id.name',
  is_scheduled: 'river_definitions.is_scheduled',
  river_type: 'river_definitions.source.name',
  source: 'river_definitions.river_name',
};

const toClearedParams = params => ({ ...clearedParams, ...params });

const toRiversParams = params =>
  Object.fromEntries(
    Object.entries(params)
      .map(([key, value]) => [queryKeysMap[key] ?? key, value])
      .map(([key, value]) => [key, key === 'page' ? Number(value) + 1 : value])
      .filter(([_, value]) => value || value === 0),
  );

function ResetFilters() {
  const { reset } = useContext(TablePaginationContext);

  return <RiveryButton ml={2} variant="text" label="Clear" onClick={reset} />;
}

export function Rivers() {
  const setQueryParams = useSetQueryParams();
  const { envId, activeAccountId } = useCore();
  const { isSettingOn } = useAccount();
  const { groups } = useGroupsState();
  useGroupsLoader(envId);
  const runDialog = RiverRunDialog();
  const fetchRivers = useCallback(
    async params => {
      const result = await getData(
        '/rivers',
        toRiversParams({ ...defaultPagination, ...params }),
      );
      return {
        data: result.data,
        total: result.total_rivers,
        totalShowing: result.total_filtered_rivers,
        totalPages: result.total_pages,
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [envId, activeAccountId],
  );

  const { [VIEW_TYPE_KEY]: viewType } = getQueryParams([VIEW_TYPE_KEY]);

  const [showCreate, toggleShowCreate] = useToggle(false);
  const groupAddDialog = useMemo(() => {
    return showCreate ? (
      <Groups modalOnly groupId={undefined} onClose={toggleShowCreate} />
    ) : null;
  }, [showCreate, toggleShowCreate]);

  const isGroupsView = viewType === ViewTypes.GROUPS;
  const selectedTab = viewType => {
    const reversed = Object.assign(
      {},
      ...Object.entries(TabsIndex).map(([key, value]) => ({ [value]: key })),
    );
    return viewType ? reversed[viewType] : 0;
  };

  return (
    <View p={3} as={Flex} flexDir="column" gap={4}>
      {runDialog}
      {groupAddDialog}
      <Breadcrumbs
        links={[
          { label: 'Data Flows' },
          { label: `${isGroupsView ? 'Groups' : 'Data Flows'} List` },
        ]}
        pb={0}
      />
      <Tabs
        defaultIndex={Number(selectedTab(viewType))}
        isLazy
        onChange={index => {
          setQueryParams(
            toClearedParams({ [VIEW_TYPE_KEY]: TabsIndex[index] }),
          );
        }}
      >
        <TabList>
          <Tab py={2} px={6} data-pendo-id={RiversTags.LIST_TAB}>
            Data Flows List
          </Tab>
          <Tab py={2} px={6} data-pendo-id={RiversTags.GROUPS_TAB}>
            Groups
          </Tab>
        </TabList>
      </Tabs>
      {isGroupsView ? (
        <HStack justify="space-between">
          <Text color="font-secondary">
            Create and manage your Data Flows (Rivers)
          </Text>
          <ButtonCreate
            onClick={toggleShowCreate}
            fontWeight="bold"
            mr={2}
            aria-label="New Group"
          >
            New Group
          </ButtonCreate>
        </HStack>
      ) : (
        <HStack justify="space-between">
          <Text color="font-secondary">
            Create and manage your Data Flows (Rivers)
          </Text>
          <CreateRiverDropdown />
        </HStack>
      )}
      {isGroupsView ? (
        <RiveryTable
          ariaLabel="rivers list"
          entityType="Groups"
          columns={groupHeaders}
          data={groups}
          paginationConfig={{
            autoResetPage: false,
            autoResetGlobalFilter: false,
            initialState: { pageSize: 20 },
          }}
          useSortBy={useSortBy}
          title={null}
          filterLabel="Search Group"
          clearFilters={<ResetFilters />}
        />
      ) : isSettingOn('use_new_river_list') ? (
        <NewRiversGrid />
      ) : (
        <PaginatedRiveryTable
          entityType="Data Flows"
          paramIdMap={paramIdMap}
          columns={riverHeaders}
          fetchData={fetchRivers}
          useSortBy={useSortBy}
          recordNotFound={() => <NoResults />}
          filterLabel="Search Data Flow"
          masterFilterKey="name"
          title={null}
          clearFilters={<ResetFilters />}
          filterInputProps={{ 'data-pendo-id': RiversTags.SEARCH_INPUT }}
        />
      )}
    </View>
  );
}

const GroupRiversLink = ({ group, children }) => {
  const { pathname } = useLocation();
  return (
    <RiveryButton
      pl={0}
      variant="text-link"
      _hover={{ textDecoration: 'none' }}
      color="font"
      as={Link}
      to={{ pathname, search: `group_id=${getCrossId(group)}` }}
      label={children}
    />
  );
};

export const GroupName = ({ row: { original: group } }) => (
  <GroupRiversLink group={group}>
    <HStack gap={2}>
      <Dot color={group.color} icon={group.icon} />
      <Text
        noOfLines={1}
        whiteSpace="nowrap"
        title={group.name}
        maxWidth="50vw"
        display="block"
      >
        {group.name}
      </Text>
    </HStack>
  </GroupRiversLink>
);

const groupHeaders: Column[] = [
  {
    Header: 'Group Name',
    Cell: GroupName,
    accessor: 'name',
    sortBy: 'name',
    sortType: 'string',
  },
  {
    Header: 'Number of Data Flows',
    accessor: 'river_count',
    weight: 'min-content',
    styleProps: { justifyContent: 'center' },
    headerProps: { justifyContent: 'center' },
    sortBy: 'river_count',
    sortType: 'number',
  },
  {
    Header: 'Last Modified',
    accessor: 'update_time',
    Cell: TableDateTime,
    sortBy: 'lastModified',
    weight: 'min-content',
    styleProps: { whiteSpace: 'nowrap' },
  },
  {
    Header: '',
    accessor: 'actions.delete',
    Cell: GroupListActions,
    headerProps: { justifyContent: 'center' },
    styleProps: { justifyContent: 'center' },
    weight: 'min-content',
  },
];

const headerProps = {
  px: 3,
  py: 3,
  fontWeight: 'medium',
};

const styleProps = {
  px: 3,
};

const riverHeaders: Column[] = [
  {
    Header: 'Name',
    accessor: 'river_definitions.river_name',
    id: 'river_definitions.source.name',
    Cell: RiverName,
    sortBy: 'name',
    headerProps,
    styleProps: { py: 0 },
    Filter: RiverTypeSelect,
    weight: 'minmax(max-content, 2fr)',
  },
  {
    Header: 'Group',
    Cell: RiverGroup,
    accessor: 'river_definitions.group_id.name',
    Filter: GroupsSelect,
    headerProps,
    styleProps,
    sortBy: 'group',
    weight: 'minmax(150px, 2fr)',
  },
  {
    Header: 'Scheduled',
    accessor: 'river_definitions.is_scheduled',
    id: 'river_definitions.is_scheduled',
    Cell: ScheduleIndicator,
    headerProps: { px: 2 },
    weight: 'minmax(120px, 1fr)',
    Filter: ScheduledSelector,
  },
  {
    Header: 'Modified By',
    accessor: 'river_definitions.updated_by_name',
    weight: 'minmax(130px, 200px)',
    styleProps: { pl: 3, whiteSpace: 'nowrap' },
    headerProps,
    sortBy: 'modifiedBy',
  },
  {
    Header: 'Last Modified',
    accessor: 'river_definitions.river_modified_date',
    Cell: TableDateTime,
    weight: '150px',
    sortBy: 'lastModified',
    headerProps,
    styleProps: { pl: 3, whiteSpace: 'nowrap' },
  },
  {
    Header: '',
    accessor: 'river_definitions.is_api_v2',
    Cell: ApiTag,
    headerProps: { justifyContent: 'center' },
    styleProps: { justifyContent: 'center' },
    weight: 'min-content',
  },
  {
    Header: '',
    accessor: 'river_definitions.river_desc',
    Cell: RiverDescription,
    headerProps: { justifyContent: 'center' },
    styleProps: { justifyContent: 'center' },
    weight: 'min-content',
  },
  {
    Header: '',
    id: 'river-actions',
    Cell: RiverListActionsCell,
    headerProps: { justifyContent: 'center' },
    styleProps: { justifyContent: 'center' },
    weight: 'min-content',
  },
];

const clearedParams = Object.fromEntries(
  ['text', 'sortBy', 'sortOrder', 'river_type']
    .concat(Object.keys(queryKeysMap))
    .concat(Object.keys(paramIdMap))
    .map(key => [key, undefined]),
);
