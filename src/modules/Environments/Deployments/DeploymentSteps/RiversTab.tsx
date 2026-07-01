import { getData } from 'api/api.proxy';
import {
  Icon,
  PaginatedRiveryTable,
  RenderGuard,
  ScheduleIcon,
  Text,
} from 'components';
import {
  RiverV2Tag,
  StatusTag,
} from 'containers/Rivers/RiversV1/components/StatusTag';
import { getQueryParams } from 'hooks/router';
import { useCallback, useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { useSortBy } from 'react-table';
import { useAccount } from 'store/core';
import {
  commonParamsDefinitions,
  paginationData,
  useFetchUrl,
} from '../components/helpers';
import {
  Arrow,
  GroupFilter,
  LastModifiedCell,
  ModifiedByCell,
  MultiCheck,
  Name,
  ResetFilters,
  ScheduledFilter,
  SingleCheck,
  TargetNameCell,
  TypeFilter,
} from '../components/TabsComponents';

//The Defualt table filter key should not be passed here
const paramIdMap = {
  is_scheduled_src: 'is_scheduled_src',
  group_id_src: 'group_id_src',
  type_src: 'type_src',
  entity_ids: 'entity_ids',
};

export function RiversTab({ targetEnv, sourceEnv, isDisabled }) {
  const { isSettingOn } = useAccount();
  const { deployment_id } = getQueryParams(['deployment_id']);
  const getUrl = useFetchUrl('rivers', sourceEnv, targetEnv);
  const { pagination, toParamsFunction } = commonParamsDefinitions;
  const formApi = useFormContext();
  const fetchData = useCallback(
    async params => {
      const result = await getData(
        getUrl,
        toParamsFunction({ ...pagination, ...params }),
      );
      return paginationData(result);
    },
    [getUrl, pagination, toParamsFunction],
  );

  const riverColumns = useMemo(
    () =>
      columns(
        isDisabled,
        deployment_id,
        isSettingOn('allow_create_new_stt'),
        isSettingOn('enable_activate_river'),
      ),
    [deployment_id, isDisabled, isSettingOn],
  );
  return (
    <PaginatedRiveryTable
      entityType="Data Flows"
      title={null}
      fetchData={fetchData}
      paramIdMap={paramIdMap}
      useSortBy={useSortBy}
      columns={riverColumns}
      rowHandlers={{
        isRowSelected: ({ entity_id }) =>
          Boolean(formApi?.watch(`entities.rivers.${entity_id}`)),
      }}
      paginationConfig={{
        autoResetPage: false,
        autoResetGlobalFilter: false,
        initialState: { pageSize: 0 },
      }}
      filterLabel="Search Data Flow"
      customFilterColumns={['name_src']}
      masterFilterKey="name_src"
      clearFilters={<ResetFilters paramIdMap={paramIdMap} />}
    />
  );
}

const headerProps = { textStyle: 'M7' };

const columns = (
  disabled,
  deployment_id,
  isNewInterfaceAllowed,
  riverActivationEnabled,
) => [
  {
    Header: MultiCheck,
    id: 'entity_ids',
    Cell: SingleCheck,
    weight: 'min-content',
    styleProps: { pl: 3 },
    headerProps: { pl: 3 },
    getProps: { type: 'rivers', disabled },
  },

  {
    Header: 'Name',
    accessor: 'name_src',
    //Added an id here to be able to filter this column by type (necessary to initiate filter ability).
    id: 'type_src',
    Cell: Name,
    weight: 'minmax(350px, 1fr)',
    sortBy: 'name_src',
    getProps: { type: 'river' },
    headerProps,
    styleProps: { pl: 0, py: 3 },
    Filter: deployment_id ? null : TypeFilter,
  },
  {
    Header: ScheduledFilter,
    styleProps: { pl: 4 },
    accessor: 'is_scheduled_src',
    Cell: ({ value, row }) => {
      return (
        <RenderGuard condition={!row?.original?.deleted_src}>
          <Icon
            as={ScheduleIcon}
            color={value ? 'primary' : 'font-secondary'}
            boxSize={4}
          />
        </RenderGuard>
      );
    },
    weight: 'min-content',
  },
  {
    Header: 'Group',
    Cell: ({ row }) => (
      <RenderGuard condition={!row?.original?.deleted_src}>
        <Text
          w="90%"
          textOverflow="ellipsis"
          whiteSpace="nowrap"
          overflow="hidden"
        >
          {row.original.group_name_src}
        </Text>
      </RenderGuard>
    ),
    accessor: 'group_id_src',
    weight: 'minmax(200px, 300px)',
    sortBy: 'group_id_src',
    headerProps,
    Filter: deployment_id ? null : GroupFilter,
  },
  {
    ...(isNewInterfaceAllowed
      ? {
          Header: 'Interface',
          accessor: 'is_api_v2',
          Cell: ({ value, row }) => (
            <RenderGuard condition={!row?.original?.deleted_src}>
              <RiverV2Tag value={value} row={row} />
            </RenderGuard>
          ),
          headerProps: { justifyContent: 'center' },
          styleProps: { justifyContent: 'center' },
          weight: '122px',
        }
      : { id: 'no_tag', styleProps: { p: 0 }, headerProps: { p: 0 } }),
  },
  {
    Header: 'Last Modified',
    Cell: LastModifiedCell,
    accessor: 'modified_date_src',
    weight: '140px',
    sortBy: 'modified_date_src',
    headerProps,
  },
  {
    Header: 'Modified By',
    accessor: 'modified_by_name_src',
    Cell: ModifiedByCell,
    weight: 'minmax(120px, 140px)',
    headerProps,
  },
  {
    ...(riverActivationEnabled
      ? {
          Header: 'Current Status',
          accessor: 'river_status_src',
          headerProps,
          styleProps: {
            // bg: 'background-secondary!important',
            justify: 'center',
          },
          weight: '107px',
          Cell: ({ value, row }) =>
            value && (
              <RenderGuard condition={!row?.original?.deleted_src}>
                <StatusTag value={value} />
              </RenderGuard>
            ),
        }
      : { id: 'not_v2', styleProps: { p: 0 }, headerProps: { p: 0 } }),
  },
  {
    Header: '',
    id: 'arrow',
    Cell: Arrow,
    weight: '100px',
    styleProps: { justifyContent: 'center' },
  },
  {
    Header: 'Replace With',
    Cell: TargetNameCell,
    accessor: 'name_trg',
    weight: 'minmax(350px, 1fr)',
    sortBy: 'name_trg',
    headerProps,
  },
  {
    ...(riverActivationEnabled
      ? {
          Header: 'Future Status',
          accessor: 'river_status_trg',
          Cell: ({ row: { values } }) => {
            return (
              values.river_status_src && (
                <StatusTag
                  value={
                    values.river_status_trg === undefined
                      ? values.river_status_src
                      : values.river_status_trg
                  }
                />
              )
            );
          },
          headerProps,
          weight: '107px',
          styleProps: {
            // bg: 'background-secondary!important',
            justify: 'center',
          },
        }
      : { id: 'not_v2_1', styleProps: { p: 0 }, headerProps: { p: 0 } }),
  },
];
