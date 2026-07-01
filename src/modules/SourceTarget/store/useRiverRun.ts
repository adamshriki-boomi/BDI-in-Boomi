import { StatusTypes } from 'api/types';
import {
  useGetActivitiesTablesQuery,
  useGetRiverActivitiesSingleRunQuery,
} from 'containers/Activities';
import { useToastComponent } from 'hooks/useToast';
import {
  useCancelRunMutation,
  useRunRiverMutation,
} from 'modules/SourceTarget';
import { useEffect, useMemo } from 'react';
import { useHistory } from 'react-router-dom';
import { useInterval } from 'react-use';

export function useRiverRun(riverId, updateRiverValues) {
  const {
    replace,
    location: { pathname },
  } = useHistory();
  const { error } = useToastComponent();
  const [cancel] = useCancelRunMutation();
  const [run, runRiverResponse] = useRunRiverMutation();
  const { data: runData } = runRiverResponse;
  const runId = runData?.runs[0].run_id;
  const { data: tables, refetch: refetchTables } = useGetActivitiesTablesQuery(
    {
      riverId,
      runGroupId: runData?.run_group_id,
    },
    { skip: !Boolean(runId) },
  );

  const { data: runActivity, refetch: refetchRunData } =
    useGetRiverActivitiesSingleRunQuery(
      {
        riverId,
        runId,
      },
      { skip: !runId },
    );

  const isRunFinished = useMemo(
    () =>
      [
        StatusTypes.SKIPPED,
        StatusTypes.FAILED,
        StatusTypes.SUCCEEDED,
        StatusTypes.PARTIAL,
        StatusTypes.CANCELED,
      ].includes(tables?.status as StatusTypes),
    [tables?.status],
  );

  const isRunInProcess = useMemo(
    () => tables?.status && !isRunFinished,
    [isRunFinished, tables?.status],
  );

  useEffect(() => {
    if (runRiverResponse?.isError) {
      error({ description: (runRiverResponse.error as any)?.data?.detail });
    }
  }, [error, runRiverResponse?.error, runRiverResponse?.isError]);

  useInterval(() => {
    if (isRunInProcess) {
      refetchTables();
    }
  }, 3000);

  useEffect(() => {
    if (isRunFinished) {
      refetchRunData();
      updateRiverValues();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunFinished]);

  useEffect(() => {
    if (runData) {
      replace({ pathname, state: null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runData]);

  return {
    run,
    runRiverResponse,
    runInProcess: isRunInProcess,
    cancelRun: cancel,
    completedTables: tables?.succeeded + tables?.failed,
    hasFailedTables: tables?.failed > 0,
    status: tables?.status,
    runActivity,
    isRunFinished,
  };
}
