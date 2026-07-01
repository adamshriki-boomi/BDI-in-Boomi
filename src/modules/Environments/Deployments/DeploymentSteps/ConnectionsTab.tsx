import { getData } from 'api/api.proxy';
import { NoResults, PaginatedRiveryTable } from 'components';
import { getQueryParams } from 'hooks/router';
import { useCallback, useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { useSortBy } from 'react-table';
import {
  commonParamsDefinitions,
  paginationData,
  useFetchUrl,
} from '../components/helpers';
import {
  Arrow,
  ConnectionTypeFilter,
  LastModifiedCell,
  ModifiedByCell,
  MultiCheck,
  Name,
  ResetFilters,
  SingleCheck,
  TargetNameCell,
} from '../components/TabsComponents';

const paramIdMap = {
  type_src: 'type_src',
  entity_ids: 'entity_ids',
};

export function ConnectionsTab({ targetEnv, sourceEnv, isDisabled }) {
  const getUrl = useFetchUrl('connections', sourceEnv, targetEnv);
  const { deployment_id } = getQueryParams(['deployment_id']);
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

  const connectionColumns = useMemo(
    () =>
      columns(isDisabled, deployment_id).map(column => ({
        ...column,
        getProps: { ...column.getProps, targetEnv, sourceEnv },
      })),
    [deployment_id, isDisabled, sourceEnv, targetEnv],
  );

  return (
    <PaginatedRiveryTable
      entityType="Connections"
      title={null}
      fetchData={fetchData}
      paramIdMap={paramIdMap}
      useSortBy={useSortBy}
      columns={connectionColumns}
      rowHandlers={{
        isRowSelected: ({ entity_id }) =>
          Boolean(formApi?.watch(`entities.connections.${entity_id}`)),
      }}
      paginationConfig={{
        autoResetPage: false,
        autoResetGlobalFilter: false,
        initialState: { pageSize: 0 },
      }}
      noRecords={() => <NoResults />}
      filterLabel="Search Connection"
      customFilterColumns={['name_src']}
      masterFilterKey="name_src"
      clearFilters={<ResetFilters paramIdMap={paramIdMap} />}
    />
  );
}

const columns = (disabled, deployment_id) => [
  {
    Header: MultiCheck,
    id: 'entity_ids',
    Cell: SingleCheck,
    weight: 'min-content',
    styleProps: { pl: 3 },
    headerProps: { pl: 3 },
    getProps: { type: 'connections', disabled },
  },
  {
    Header: 'Name',
    accessor: 'name_src',
    id: 'type_src',
    Cell: Name,
    weight: 'minmax(250px, 400px)',
    sortBy: 'name_src',
    getProps: { type: 'connections' },
    styleProps: { pl: 0, py: 3 },
    Filter: deployment_id ? null : ConnectionTypeFilter,
  },
  {
    Header: 'Last Modified',
    Cell: LastModifiedCell,
    accessor: 'modified_date_src',
    weight: '153px',
    sortBy: 'modified_date_src',
  },
  {
    Header: 'Modified By',
    accessor: 'modified_by_name_src',
    Cell: ModifiedByCell,
    weight: '153px',
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
