import { getData } from 'api/api.proxy';
import { NoResults, PaginatedRiveryTable } from 'components';
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
  MultiCheck,
  ResetFilters,
  SingleCheck,
  TargetNameCell,
} from '../components/TabsComponents';

const paramIdMap = {
  name_src: 'name_src',
};

export function KitsTab({ targetEnv, sourceEnv, isDisabled }) {
  const getUrl = useFetchUrl('templates', sourceEnv, targetEnv);
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

  const kitsColumns = useMemo(() => columns(isDisabled), [isDisabled]);

  return (
    <PaginatedRiveryTable
      entityType="Kits"
      title={null}
      fetchData={fetchData}
      paramIdMap={paramIdMap}
      useSortBy={useSortBy}
      columns={kitsColumns}
      rowHandlers={{
        isRowSelected: ({ entity_id }) =>
          Boolean(formApi?.watch(`entities.templates.${entity_id}`)),
      }}
      paginationConfig={{
        autoResetPage: false,
        autoResetGlobalFilter: false,
        initialState: { pageSize: 0 },
      }}
      noRecords={() => <NoResults />}
      clearFilters={<ResetFilters paramIdMap={paramIdMap} />}
      filterLabel="Search Kits"
      customFilterColumns={['name_src']}
      masterFilterKey="name_src"
    />
  );
}

const columns = disabled => [
  {
    Header: MultiCheck,
    id: 'entity-ids',
    Cell: SingleCheck,
    weight: 'min-content',
    styleProps: { p: 3 },
    headerProps: { pl: 3 },
    getProps: { type: 'templates', disabled },
  },
  {
    Header: 'Name',
    accessor: 'name_src',
    weight: 'minmax(250px, 400px)',
    sortBy: 'name_src',
    getProps: { type: 'kit' },
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
    weight: 'minmax(120px, 1fr)',
    sortBy: 'name_trg',
  },
];
