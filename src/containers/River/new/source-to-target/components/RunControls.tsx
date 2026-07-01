import { RenderGuard } from 'components';
import { useRiverId } from 'containers/Activities/helpers';
import { useUpdateRiver } from 'containers/River/hooks/useUpdateRiverValues';
import {
  RiverRunBar,
  RunRiver,
} from 'containers/River/RiverSourceToTarget/components/RiverRunBar';
import { useSttFormContext } from 'modules/SourceTarget';
import { useRiverRun } from 'modules/SourceTarget/store/useRiverRun';
import { useVersionController } from 'modules/Versions/hooks';
import React, { useEffect, useState } from 'react';
import { useToggle } from 'react-use';

export const useRunComponentRenderer = (
  toggleRunning = null,
  reActivate = false,
  dismissReactivation = null,
) => {
  const formApi = useSttFormContext();
  const {
    formState: { isSubmitting, errors },
  } = formApi;
  const { version } = useVersionController();
  const useUpdateRiverFunction = useUpdateRiver(formApi);
  const [view, toggleView] = useToggle(true);
  const [newRiverId, setNewRiverId] = useState(null);
  const riverId = useRiverId();
  const hasErrors = errors && Object.keys(errors).length > 0;
  const {
    run,
    cancelRun,
    runActivity,
    runInProcess,
    runRiverResponse,
    status,
    completedTables,
    isRunFinished,
  } = useRiverRun(riverId ?? newRiverId, useUpdateRiverFunction);

  const isRiverRunning = formApi?.watch('river.is_running' as any);

  useEffect(() => {
    if (toggleRunning) {
      if (runInProcess) {
        if (!isRiverRunning) {
          //I'm setting it on form So I can access it wherever I need it
          formApi.setValue('river.is_running' as any, true);
        }
        toggleRunning(true);
      }
      if (isRunFinished) {
        toggleRunning(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRiverRunning, isRunFinished, runInProcess, toggleRunning]);

  return {
    Bar: (
      <RenderGuard
        condition={view && (runInProcess || Boolean(runRiverResponse?.data))}
      >
        <RiverRunBar
          runData={runActivity}
          isRunFinished={isRunFinished}
          dismissBar={toggleView}
          status={status}
          completedTables={completedTables}
        />
      </RenderGuard>
    ),
    Button: (
      <RunRiver
        run={run}
        cancelRun={cancelRun}
        runData={runActivity}
        runInProcess={runInProcess}
        runRiverResponse={runRiverResponse}
        setNewRiverId={setNewRiverId}
        newRiverId={newRiverId}
        reActivate={reActivate}
        dismissReactivation={dismissReactivation}
        isDisabled={[isSubmitting, hasErrors, version].some(Boolean)}
        toggleView={toggleView}
      />
    ),
  };
};
