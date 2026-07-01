import { NoEntities, NoriversDefault, RiveryButton } from 'components';
import { RiversTags } from 'utils/tracking.tags';
import { PaginatedApiRiveryTable } from 'components/RiveryTable/PaginatedApiRiveryTable';
import { useMemo } from 'react';
import { useSortBy } from 'react-table';
import { useAccount } from 'store/core';
import { parseSearchParams } from 'utils/searchParams';
import { riverColumns } from './RiversGridColumns';
import {
  useCopyRiverMutation,
  useDeleteRiverMutation,
  useGetRiversQuery,
  useRiversGridParams,
} from './riversV1.query';

const paramIdMap = {
  group_id: 'group_id',
  river_type: 'river_type',
  schedule: 'schedule',
  status: 'status',
  name: 'name',
};

const useFetchData = () => {
  const params = parseSearchParams();
  const { pageIndex, pageSize, sortBy, sortOrder, ...rest } = params;
  const { data: rivers, ...api } = useGetRiversQuery(
    {
      page: params?.pageIndex ? params?.pageIndex + 1 : 1,
      items_per_page: params?.pageSize ?? 20,
      sort_by: params?.sortBy,
      sort_order: params?.sortOrder,
      ...rest,
    } as any,
    { refetchOnMountOrArgChange: true },
  );
  const failedRequest =
    (rivers === undefined && api.status === 'fulfilled') ||
    api.status === 'rejected';
  return {
    data: rivers?.items,
    total: rivers?.total_items || 0,
    totalShowing:
      rivers?.page * (params?.pageSize ?? 20) - (params?.pageSize ?? 20) + 1,
    totalPages: rivers
      ? Math.ceil(
          rivers?.total_items / (params?.pageSize ? params?.pageSize : 20),
        )
      : 0,
    failedRequest,
    ...api,
  };
};

export function NewRiversGrid() {
  const { isSettingOn } = useAccount();
  const { api, params } = useRiversGridParams();

  function ResetFilters() {
    return (
      <RiveryButton
        ml={2}
        variant="text"
        label="Clear"
        onClick={api.resetParams}
      />
    );
  }

  const [, { isLoading: isDeleting }] = useDeleteRiverMutation();
  const [, { isLoading: isCopying }] = useCopyRiverMutation();

  const riversGridColumns = useMemo(
    () =>
      riverColumns(isSettingOn('allow_create_new_stt')).map(col => ({
        ...col,
        getProps: { filtersApi: { api, params } },
      })),
    [api, isSettingOn, params],
  );

  return (
    <PaginatedApiRiveryTable
      useApiQuery={useFetchData}
      paramIdMap={paramIdMap}
      columns={riversGridColumns}
      useSortBy={useSortBy}
      filterLabel="Search Data Flow"
      masterFilterKey="name"
      loadingActions={isDeleting || isCopying}
      clearFilters={<ResetFilters />}
      refetchOnRefresh
      entityType="Data Flows"
      noRecords={NoRiversYet}
      filterInputProps={{ 'data-pendo-id': RiversTags.SEARCH_INPUT }}
    />
  );
}

function NoRiversYet() {
  return <NoEntities entity="Data Flow" icon={NoriversDefault} />;
}
