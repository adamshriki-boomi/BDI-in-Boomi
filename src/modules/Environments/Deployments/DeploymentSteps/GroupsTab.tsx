import { getData } from 'api/api.proxy';
import { NoResults, PaginatedRiveryTable } from 'components';
import { useCallback, useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { useSortBy } from 'react-table';
import { useGroupsLoader } from 'store/groups';
import {
  commonParamsDefinitions,
  paginationData,
  useFetchUrl,
} from '../components/helpers';
import {
  Arrow,
  LastModifiedCell,
  ModifiedByCell,
  MultiCheck,
  ResetFilters,
  SingleCheck,
  TargetNameCell,
} from '../components/TabsComponents';

const paramIdMap = {
  name_src: 'name_src',
  entity_ids: 'entity_ids',
};

export function GroupsTab({ targetEnv, sourceEnv, isDisabled }) {
  const getUrl = useFetchUrl('river_groups', sourceEnv, targetEnv);
  useGroupsLoader(sourceEnv);
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

  const groupColumns = useMemo(() => columns(isDisabled), [isDisabled]);

  return (
    <PaginatedRiveryTable
      entityType="Groups"
      title={null}
      fetchData={fetchData}
      paramIdMap={paramIdMap}
      useSortBy={useSortBy}
      columns={groupColumns}
      rowHandlers={{
        isRowSelected: ({ entity_id }) =>
          Boolean(formApi?.watch(`entities.river_groups.${entity_id}`)),
      }}
      paginationConfig={{
        autoResetPage: false,
        autoResetGlobalFilter: false,
        initialState: { pageSize: 0 },
      }}
      noRecords={() => <NoResults />}
      clearFilters={<ResetFilters paramIdMap={paramIdMap} />}
      filterLabel="Search Groups"
      customFilterColumns={['name_src']}
      masterFilterKey="name_src"
    />
  );
}

const columns = disabled => [
  {
    Header: MultiCheck,
    id: 'entity_ids',
    Cell: SingleCheck,
    weight: 'min-content',
    styleProps: { pl: 3 },
    headerProps: { pl: 3 },
    getProps: { type: 'river_groups', disabled },
  },
  {
    Header: 'Name',
    accessor: 'name_src',
    // Cell: Name,
    weight: 'minmax(250px, 500px)',
    sortBy: 'name_src',
    getProps: { type: 'group' },
    styleProps: { py: 3 },
  },
  {
    Header: 'Last Modified',
    Cell: LastModifiedCell,
    accessor: 'modified_date_src',
    weight: 'minmax(150px, 1fr)',
    sortBy: 'modified_date_src',
  },
  {
    Header: 'User',
    accessor: 'modified_by_name_src',
    Cell: ModifiedByCell,
    weight: 'minmax(120px, 1fr)',
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
    weight: 'minmax(250px, 1fr)',
    sortBy: 'name_trg',
  },
];
