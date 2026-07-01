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
  MultiCheck,
  Name,
  ResetFilters,
  SingleCheck,
} from '../components/TabsComponents';

const paramIdMap = {
  name_src: 'name_src',
  entity_ids: 'entity_ids',
};

export function DataframesTab({ targetEnv, sourceEnv, isDisabled }) {
  const getUrl = useFetchUrl('dataframes', sourceEnv, targetEnv);
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

  const dataframeColumns = useMemo(() => columns(isDisabled), [isDisabled]);

  return (
    <PaginatedRiveryTable
      entityType="Dataframes"
      title={null}
      fetchData={fetchData}
      paramIdMap={paramIdMap}
      useSortBy={useSortBy}
      columns={dataframeColumns}
      rowHandlers={{
        isRowSelected: ({ name_src, entity_name }) =>
          Boolean(
            formApi?.watch(`entities.dataframes.${name_src ?? entity_name}`),
          ),
      }}
      paginationConfig={{
        autoResetPage: false,
        autoResetGlobalFilter: false,
        initialState: { pageSize: 0 },
      }}
      noRecords={() => <NoResults />}
      clearFilters={<ResetFilters paramIdMap={paramIdMap} />}
      filterLabel="Search Dataframes"
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
    getProps: { type: 'dataframes', disabled },
  },
  {
    Header: 'Name',
    accessor: 'name_src',
    Cell: Name,
    sortBy: 'name_src',
    getProps: { type: 'dataframe' },
    styleProps: { py: 3 },
  },
];
