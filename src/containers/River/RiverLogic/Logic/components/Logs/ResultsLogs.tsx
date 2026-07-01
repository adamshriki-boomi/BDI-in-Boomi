import { StatusTypes } from 'api/types';
import { useIsNewCheckRunActive } from 'components';
import {
  IRiverActivityRun,
  useGetLogicRunStepsQuery,
} from 'containers/Activities';
import LogsGrid from 'modules/Monitoring/LogicLogsGrid';
import { useIsInsideRiver } from 'modules/RiverRightBar';
import { useEffect, useState } from 'react';
import { useRiverRun } from 'store/river';
import { useGetLastRunLogsQuery } from './logs.query';

export default function ResultsLogs() {
  const useNewCheckRun = useIsNewCheckRunActive();
  return useNewCheckRun ? <NewRunResultsGrid /> : <OldRunResultsGrid />;
}

function NewRunResultsGrid() {
  const { details } = useRiverRun();
  const { status, run_id: runId } = details as IRiverActivityRun;
  const riverId = useIsInsideRiver();
  const isRunFinished = [StatusTypes.FAILED, StatusTypes.SUCCEEDED].includes(
    status,
  );
  const { data: steps, refetch } = useGetLogicRunStepsQuery(
    {
      riverId,
      runId: details?.run_id,
    },
    { skip: !details?.run_id },
  );

  useEffect(() => {
    if (isRunFinished) refetch();
  }, [runId, isRunFinished, refetch]);

  return (
    <LogsGrid
      data={steps}
      isLoading={!steps && !isRunFinished}
      runId={runId}
      isActivitiesView
    />
  );
}

function OldRunResultsGrid() {
  const [logs, setLogs] = useState(null);
  const {
    details: { run_id: runId, river_run_status },
    hasDetails,
  } = useRiverRun();
  const isRunFinished = ['E', 'D'].includes(river_run_status);
  const { data, isFetching, refetch } = useGetLastRunLogsQuery(runId);

  useEffect(() => {
    if (isRunFinished) refetch();
  }, [refetch, runId, isRunFinished]);

  useEffect(() => {
    if (river_run_status === 'R' && !isFetching) {
      setTimeout(() => refetch(), 1500);
    }
  }, [refetch, river_run_status, isFetching]);

  useEffect(() => {
    if (!hasDetails || !river_run_status) {
      setLogs(null);
      return;
    }
    if (data?.tasks?.length > 0 && data?.tasks[0].steps_response_details) {
      if (!logs) {
        setLogs(data.tasks[0].steps_response_details);
        return;
      }
      if (
        (logs &&
          Object.values(logs).length <
            Object.values(data?.tasks[0].steps_response_details).length) ||
        isRunFinished
      ) {
        setLogs(data?.tasks[0].steps_response_details);
        return;
      }
      return;
    }
  }, [data?.tasks, logs, isRunFinished, hasDetails, river_run_status]);

  return <LogsGrid data={logs} isLoading={!logs} runId={runId} />;
}
