import { Box, Drawer, DRAWER_PARAM_NAME } from 'components';
import { useDrawerParam } from 'components/Drawer/useDrawerParam';
import { PaginatedApiRiveryTable } from 'components/RiveryTable/PaginatedApiRiveryTable';
import * as React from 'react';
import { useCallback, useMemo } from 'react';
import { useHistory } from 'react-router-dom';
import { useSortBy } from 'react-table';
import { displayDate, patternDate } from 'utils/date.utils';
import { ActivitiesTags } from 'utils/tracking.tags';
import {
  parseSearchParams,
  removeParams,
  upsertSearchParam,
} from 'utils/searchParams';
import { useRiverId } from '../../helpers';
import { IRiverActivityRun, useGetRiverActivitiesRunQuery } from '../../store';
import { RunsLog } from '../components/RunsLog.drawer';
import {
  useIsViewLoading,
  useViewParamResolver,
} from '../components/ViewRadios';
import { PARAM_NAME } from '../params';
import { runColumns, tableColumns } from './SourceToTargetColumns';

const hasDates = params => {
  return [params?.start_time, params?.end_time].every(Boolean);
};

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
    } as any,
    {
      skip:
        !Boolean(riverId) ||
        isViewLoading ||
        !hasDates(params) ||
        !Boolean(params?.run),
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

export default function SourceToTarget() {
  const history: any = useHistory();
  const params = parseSearchParams();
  const [, drawerOn] = useDrawerParam(Boolean);
  const { isRunsView } = useViewParamResolver();

  const onAiFix = useCallback(
    (row: IRiverActivityRun, docsUrl?: string | null) => {
      history.replace({
        search: upsertSearchParam(
          DRAWER_PARAM_NAME,
          isRunsView
            ? row.target_name
            : displayDate(row.start_date_in_milliseconds, patternDate),
        ),
        state: {
          run_id: row.run_id,
          openAi: true,
          docsUrl: docsUrl ?? undefined,
        },
      });
    },
    [history, isRunsView],
  );

  const columns = useMemo(
    () =>
      (isRunsView ? runColumns : tableColumns).map(col => ({
        ...col,
        getProps: { onAiClick: onAiFix },
      })),
    [isRunsView, onAiFix],
  );

  return (
    <Box w="full">
      <PaginatedApiRiveryTable<IRiverActivityRun>
        hideTableNoData
        requiredParam="run"
        ariaLabel="runs list"
        inline
        columns={columns}
        useSortBy={useSortBy}
        noRecords={null}
        noPagination={true}
        rowHandlers={{
          onRowClick: ({ run_id, start_date_in_milliseconds, target_name }) =>
            history.replace({
              search: upsertSearchParam(
                DRAWER_PARAM_NAME,
                isRunsView
                  ? target_name
                  : displayDate(start_date_in_milliseconds, patternDate),
              ),
              state: { run_id },
            }),
          isRowSelected: ({ run_id, target_name }) =>
            run_id?.toString() === history.location.state?.run_id ||
            target_name === params?.drawer,
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
          history.replace({
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
