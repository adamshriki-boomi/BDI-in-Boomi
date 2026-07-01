import { getData } from 'api/api.proxy';
import { PaginatedRiveryTable } from 'components';
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
  LastModifiedCell,
  ModifiedByCell,
  MultiCheck,
  Name,
  ResetFilters,
  SingleCheck,
  TargetNameCell,
} from '../components/TabsComponents';

//The Defualt table filter key should not be passed here
const paramIdMap = {
  entity_ids: 'entity_ids',
};

export function BlueprintsTab({ targetEnv, sourceEnv, isDisabled }) {
  const getUrl = useFetchUrl('recipes', sourceEnv, targetEnv);
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

  const blueprintColumns = useMemo(() => columns(isDisabled), [isDisabled]);
  return (
    <PaginatedRiveryTable
      entityType="Blueprints"
      title={null}
      fetchData={fetchData}
      paramIdMap={paramIdMap}
      useSortBy={useSortBy}
      columns={blueprintColumns}
      rowHandlers={{
        isRowSelected: ({ entity_id }) =>
          Boolean(formApi?.watch(`entities.blueprints.${entity_id}`)),
      }}
      paginationConfig={{
        autoResetPage: false,
        autoResetGlobalFilter: false,
        initialState: { pageSize: 0 },
      }}
      filterLabel="Search Blueprint"
      customFilterColumns={['name_src']}
      masterFilterKey="name_src"
      clearFilters={<ResetFilters paramIdMap={paramIdMap} />}
    />
  );
}

const headerProps = { textStyle: 'M7' };

const columns = disabled => [
  {
    Header: MultiCheck,
    id: 'entity_ids',
    Cell: SingleCheck,
    weight: 'min-content',
    styleProps: { pl: 3 },
    headerProps: { pl: 3 },
    getProps: { type: 'recipes', disabled },
  },

  {
    Header: 'Name',
    accessor: 'name_src',
    //Added an id here to be able to filter this column by type (necessary to initiate filter ability).
    id: 'type_src',
    Cell: Name,
    weight: 'minmax(350px, 1fr)',
    sortBy: 'name_src',
    getProps: { type: 'recipes' },
    headerProps,
    styleProps: { pl: 0, py: 3 },
    // Filter: deployment_id ? null : TypeFilter,
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
];
