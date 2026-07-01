import { API } from 'api';
import { IRiverRunResult, StatusTypes } from 'api/types';
import { useIsNewCheckRunActive } from 'components';
import { useGetRiverActivitiesSingleRunQuery } from 'containers/Activities/store/activities.query';
import { useIsInsideRiver } from 'modules/RiverRightBar';
import { useState } from 'react';
import { useInterval, useToggle } from 'react-use';
import { useRiver, useRiverActions } from 'store/river';
import { getCrossId } from 'utils/api.sanitizer';

const POLL_INTERVAL = 2000;
export function useRunPoller(realoadOnComplete = false) {
  const useNewCheckRun = useIsNewCheckRunActive();

  const {
    setRunDetails,
    setNewRunDetails,
    setWaitingRun,
    setRunStepsStatus,
    reloadRiver,
    fetchRiverVariables,
  } = useRiverActions();
  const { selectedRiver } = useRiver();
  const [runData, setRunData] = useState<any>();
  const [loading, toggleLoading] = useToggle(false);
  const isLoading = !!runData;

  const runRiver = async asyncFunc => {
    const runResult = await asyncFunc();
    if (runResult) {
      setRunData(createCheckRunPayload(runResult));
    }
  };
  const resetRunData = () => {
    setRunData(null);
  };
  const riverId = useIsInsideRiver();

  const cancel = async () => {
    toggleLoading(true);
    if (useNewCheckRun) {
      await API.rivers.cancelRunV1({
        cross_id: riverId,
        run_id: runData?.run_id,
      });
    } else {
      await API.rivers.cancelRun({ run_id: runData?.run_id });
    }
  };

  const { data: runLog, refetch } = useGetRiverActivitiesSingleRunQuery(
    {
      riverId,
      runId: runData?.run_id,
    },
    { skip: !runData || !useNewCheckRun },
  );

  useInterval(
    async () => {
      try {
        let result;
        if (!useNewCheckRun) {
          result = await API.rivers.checkRun(runData);
          if (!Boolean(Object.keys(result)?.length)) {
            return;
          }
          if (result?.waiting) {
            setWaitingRun(true);
            return;
          }
          const [{ additional_data, ...run }] = result.runs;
          setRunDetails(run);
          setRunStepsStatus(additional_data.steps_status_log);
        } else {
          await refetch();
          setNewRunDetails(runLog);
          if (runLog?.status === StatusTypes.PENDING) {
            setWaitingRun(true);
            return;
          } else {
            setWaitingRun(false);
          }
        }
        const isRunCompleted = () =>
          useNewCheckRun
            ? isNewRiverRunComplete(runLog)
            : isRiverRunComplete(result);
        if (isRunCompleted()) {
          toggleLoading(false);
          setWaitingRun(false);
          resetRunData();
          if (realoadOnComplete && selectedRiver) {
            reloadRiver(getCrossId(selectedRiver));
            fetchRiverVariables(getCrossId(selectedRiver));
          }
        } else if (
          (!useNewCheckRun && Boolean(Object.keys(result)?.length)) ||
          (useNewCheckRun && Boolean(runLog))
        ) {
          setWaitingRun(false);
          setRunData(
            useNewCheckRun
              ? createNewCheckRunPayload(runLog)
              : createCheckRunPayload(result),
          );
        }
      } catch (error) {
        throw error;
      }
    },
    runData ? POLL_INTERVAL : null,
  );

  return {
    runRiver,
    isLoading,
    cancel,
    loadingCancel: loading,
  };
}

// UTILS
const isRiverRunComplete = (result: IRiverRunResult) =>
  ['D', 'E'].indexOf(result.runs?.[0]?.river_run_status) >= 0;

const isNewRiverRunComplete = runLog =>
  [StatusTypes.FAILED, StatusTypes.SUCCEEDED, StatusTypes.SKIPPED].includes(
    runLog?.status,
  );

const createCheckRunPayload = runResult => ({
  run_id: runResult?.runs?.[0]?.run_id ?? runResult?.run_group_id,
});

const createNewCheckRunPayload = log => ({
  run_id: log?.run_id,
});
