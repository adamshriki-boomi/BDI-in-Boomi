import {
  Box,
  ContainerSplitter,
  Drawer,
  DRAWER_PARAM_NAME,
  useDrawerParam,
} from 'components';
import { PaginatedApiRiveryTable } from 'components/RiveryTable/PaginatedApiRiveryTable';
import { useRiverId } from 'containers/Activities/helpers';
import {
  useGetActivityRiverRunsQuery,
  useGetRiverActivitiesRunQuery,
  useGetSubRiversQuery,
} from 'containers/Activities/store';
import { IRunScheduler } from 'containers/Activities/store/activities.types';
import { useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { useSortBy } from 'react-table';
import { displayDate, patternDate } from 'utils/date.utils';
import { ActivitiesTags } from 'utils/tracking.tags';
import {
  parseSearchParams,
  removeParams,
  upsertSearchParam,
} from 'utils/searchParams';
import { RunsLog } from '../components/RunsLog.drawer';
import {
  ParamName,
  useIsViewLoading,
  useViewParamResolver,
} from '../components/ViewRadios';
import { RiverRuns } from '../LeftContainer/RiverRuns';
import { RunRow } from '../LeftContainer/RunRow';
import { PARAM_NAME } from '../params';
import { runColumns, tableColumns } from './SourceToTargetColumns';
import { SubRivers } from './SubRivers';

export const hasDates = params => {
  return [params?.start_time, params?.end_time].every(Boolean);
};

export function SourceToTargetSubRivers() {
  const { viewParam, isRunsView, isSubRivers } = useViewParamResolver();
  const param = isRunsView || isSubRivers ? ParamName.Runs : ParamName.Tables;

  const views = isSubRivers
    ? [
        () => (
          <RiverRuns<IRunScheduler>
            useApiHook={useGetActivityRiverRunsQuery}
            rowComponent={RunRow}
            headers={[
              { label: 'Run Date' },
              { label: 'Max Duration', sort: 'max_duration' },
              { label: 'BDU', sort: 'units' },
            ]}
          />
        ),
        SubRiversTable,
      ]
    : [SubRivers, SubRiversTable];
  return (
    <ContainerSplitter
      h="100%"
      orientation="vertical"
      overflow="hidden"
      firstChildProps={{ size: 500 }}
    >
      {views.map((Component, index) => (
        <Component key={`s2t-${index}-${viewParam}`} param={param} />
      ))}
    </ContainerSplitter>
  );
}

const paramIdMap = {
  status: 'status',
  end_time: 'end_time',
  start_time: 'start_time',
  view: 'view',
  run: 'run',
  sortBy: 'sortBy',
  sortOrder: 'sortOrder',
};

const useFetchData = () => {
  const riverId = useRiverId();
  const params = parseSearchParams();
  const paramName = params?.[PARAM_NAME];
  const isViewLoading = useIsViewLoading(paramName);
  const shouldSkip = [
    isViewLoading,
    !params?.run,
    !riverId,
    !hasDates(params),
  ].some(Boolean);
  const requestParams = {
    riverId,
    start_time: params?.start_time,
    end_time: params?.end_time,
    [paramName]: params?.run,
  };
  const { data: subRivers, isFetching: isSubRiversFetching } =
    useGetSubRiversQuery(requestParams, {
      skip: shouldSkip,
    });
  const hasSubRivers = subRivers?.length > 0;
  const { data, ...api } = useGetRiverActivitiesRunQuery(
    {
      riverId,
      [paramName]: params?.run,
      start_time: params?.start_time,
      end_time: params?.end_time,
      page: params?.pageIndex ? params?.pageIndex + 1 : 1,
      items_per_page: params?.pageSize ?? 100,
      sort_by: params?.sortBy,
      sort_order: params?.sortOrder,
      ...(hasSubRivers && { sub_river_id: params?.sub_river_id }),
    } as any,
    {
      skip: isSubRiversFetching || shouldSkip,
    },
  );
  const failedRequest = data === undefined && api.status === 'fulfilled';
  return {
    data: data?.items,
    total: data?.total_items || 0,
    totalShowing: data?.total_items,
    totalPages: data
      ? Math.ceil(data?.total_items / (params?.pageSize ?? 100))
      : 0,
    failedRequest,
    ...api,
  };
};

function SubRiversTable() {
  const { replace, location } = useHistory();
  const stateRunId = (location.state as any)?.run_id;
  const [drawerValue, drawerOn] = useDrawerParam(Boolean);
  const { isRunsView, isSubRivers } = useViewParamResolver();
  const isRunsOrSubViews = isRunsView || isSubRivers;

  const onRowClick = useCallback(
    ({ run_id, start_date_in_milliseconds, target_name }) =>
      replace({
        search: upsertSearchParam(
          DRAWER_PARAM_NAME,
          isRunsOrSubViews
            ? target_name
            : displayDate(start_date_in_milliseconds, patternDate),
        ),
        state: { run_id },
      }),
    [replace, isRunsOrSubViews],
  );

  const isRowSelected = useCallback(
    ({ run_id, target_name }) =>
      run_id?.toString() === stateRunId || target_name === drawerValue,
    [drawerValue, stateRunId],
  );

  return (
    <Box>
      <PaginatedApiRiveryTable
        hideTableNoData
        requiredParam="run"
        ariaLabel="runs list"
        inline
        columns={isRunsOrSubViews ? runColumns : tableColumns}
        useSortBy={useSortBy}
        noRecords={null}
        noPagination={true}
        rowHandlers={{
          onRowClick,
          isRowSelected,
        }}
        useApiQuery={useFetchData}
        paramIdMap={paramIdMap}
        paginationConfig={{ initialState: { pageSize: 100 } }}
      />
      <Drawer
        size="default"
        isOpen={drawerOn}
        placement="right"
        onClose={noop}
        onOverlayClick={() =>
          replace({
            search: removeParams(window.location.search, [DRAWER_PARAM_NAME]),
          })
        }
      >
        <RunsLog data-pendo-id={ActivitiesTags.OPEN_INNER_RUN_DRAWER_S2T} />
      </Drawer>
    </Box>
  );
}

const noop = () => undefined;
