import { DateDisplay, NoblueprintDefault, NoEntities } from 'components';
import { PaginatedApiRiveryTable } from 'components/RiveryTable/PaginatedApiRiveryTable';
import { useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { Column, useSortBy } from 'react-table';
import { useCore } from 'store/core';
import {
  parseSearchParams,
  removeParams,
  upsertSearchParam,
} from 'utils/searchParams';
import { useGetBlueprintsListQuery } from '../blueprints.query';
import { BlueprintsTags } from 'utils/tracking.tags';
import BlueprintFileEditor from './AddBlueprint';
import BlueprintActions from './BlueprintActions';
import BlueprintName from './BlueprintName';

const paramIdMap = {
  name: 'name',
};

const commonStyle = {
  headerProps: { px: 3, py: 2 },
};

const columns: Column[] = [
  {
    Header: 'Name',
    accessor: 'name',
    sortBy: 'name',
    Cell: BlueprintName,
    ...commonStyle,
  },
  {
    Header: 'ID',
    accessor: 'cross_id',
    ...commonStyle,
  },
  {
    Header: 'Modified By',
    accessor: 'updated_by_name',
    ...commonStyle,
  },
  {
    Header: 'Last Modified',
    accessor: 'updated_at',
    sortBy: 'updated_at',
    Cell: ({ value }) => <DateDisplay value={value} />,
    ...commonStyle,
  },
  {
    Header: '',
    id: 'actions',
    Cell: BlueprintActions,
    weight: '50px',
  },
];

const useFetchData = () => {
  const { activeAccountId: account_id } = useCore();

  const params = parseSearchParams();
  const {
    pageIndex,
    pageSize,
    sortBy: sort_by,
    sortOrder: sort_order,
    ...rest
  } = params;
  const { data: blueprints, ...api } = useGetBlueprintsListQuery({
    account_id,
    page: params?.pageIndex ? params?.pageIndex + 1 : 1,
    items_per_page: params?.pageSize ?? 20,
    sort_by,
    sort_order,
    ...rest,
  } as any);

  return {
    data: blueprints?.items ?? [],
    total: blueprints?.total_items || 0,
    totalShowing:
      blueprints?.page * (params?.pageSize ?? 20) -
      (params?.pageSize ?? 20) +
      1,
    totalPages: blueprints
      ? Math.ceil(
          blueprints?.total_items / (params?.pageSize ? params?.pageSize : 20),
        )
      : 0,
    ...api,
  };
};

export default function BlueprintsGrid() {
  const { replace } = useHistory();

  const setSelectedBlueprint = useCallback(
    id =>
      id
        ? replace({ search: upsertSearchParam('blueprint', id) })
        : replace({
            search: removeParams(window.location.search, ['blueprint']),
          }),
    [replace],
  );
  return (
    <PaginatedApiRiveryTable
      entityType="Blueprints"
      useApiQuery={useFetchData}
      paramIdMap={paramIdMap}
      columns={columns}
      useSortBy={useSortBy}
      filterLabel="Search Blueprint"
      masterFilterKey="name"
      refetchOnRefresh
      filterInputProps={{ 'data-pendo-id': BlueprintsTags.SEARCH_INPUT }}
      extraControls={
        <BlueprintFileEditor
          setSelectedBlueprint={setSelectedBlueprint}
          showRedirectToRiver={true}
        />
      }
      noRecords={NoBlueprintYet}
    />
  );
}

function NoBlueprintYet() {
  return (
    <NoEntities
      entity="Blueprint"
      icon={NoblueprintDefault}
      doc_link="https://help.boomi.com/docs/Atomsphere/Data_Integration/Blueprint/blueprint-intro"
    />
  );
}
