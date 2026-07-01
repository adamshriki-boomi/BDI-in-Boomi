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
  SourceVariableValue,
  VariableValue,
} from '../components/TabsComponents';

const paramIdMap = {
  entity_id: 'entity_id',
};

export function VariablesTab({ targetEnv, sourceEnv, isDisabled }) {
  const getUrl = useFetchUrl('variables', sourceEnv, targetEnv);
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

  const variableColumns = useMemo(() => columns(isDisabled), [isDisabled]);

  return (
    <PaginatedRiveryTable
      entityType="Variables"
      title={null}
      fetchData={fetchData}
      paramIdMap={paramIdMap}
      useSortBy={useSortBy}
      columns={variableColumns}
      rowHandlers={{
        isRowSelected: ({ entity_id }) =>
          Boolean(formApi?.watch(`entities.variables.${entity_id}`)),
      }}
      paginationConfig={{
        autoResetPage: false,
        autoResetGlobalFilter: false,
        initialState: { pageSize: 0 },
      }}
      noRecords={() => <NoResults />}
      clearFilters={<ResetFilters paramIdMap={paramIdMap} />}
      filterLabel="Search Variable"
      customFilterColumns={['entity_id']}
      masterFilterKey="entity_id"
    />
  );
}

const columns = disabled => [
  {
    Header: MultiCheck,
    id: 'entity_ids',
    Cell: SingleCheck,
    weight: 'min-content',
    styleProps: { p: 3 },
    headerProps: { pl: 3 },
    getProps: { type: 'variables', disabled },
  },
  {
    Header: 'Name',
    accessor: 'entity_id',
    weight: 'minmax(200px, 400px)',
    sortBy: 'entity_id',
  },
  {
    Header: 'Value in Source Environment',
    accessor: 'val_src',
    Cell: SourceVariableValue,
    weight: 'minmax(200px, 300px)',
    sortBy: 'val_src',
  },
  {
    Header: '',
    id: 'arrow',
    Cell: Arrow,
    weight: '100px',
    styleProps: { justifyContent: 'center' },
  },
  {
    Header: 'Value in Target Environment',
    Cell: VariableValue,
    accessor: 'val_trg',
    weight: 'minmax(200px, 1fr)',
    sortBy: 'val_trg',
  },
];
