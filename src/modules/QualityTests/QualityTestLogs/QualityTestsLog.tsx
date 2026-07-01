import { RunStatus } from 'api/types';
import * as React from 'react';
import { useEffect } from 'react';
import { useEffectOnce } from 'react-use';
import { useRiver, useRiverRun } from 'store/river';
import { getOId } from 'utils/api.sanitizer';
import { useGetTestLogsByRunIdQuery } from '../store/qualityTestsLog.query';
import { ResultsGrid } from './TestsLogGrid';

export function QualityTestsLog({ updateDownloadData }) {
  const { selectedRiverId } = useRiver();
  const { stepsStatus, details } = useRiverRun();
  const { isLoading, data, refetch } = useGetTestLogsByRunIdQuery(
    details?.run_id,
  );

  const isRiverRunDone = Object.values(stepsStatus)?.every(step =>
    Boolean(step.status === RunStatus.DONE),
  );

  // disregard cache and trigger a refetch of logs if river run has completed
  useEffect(() => {
    if (isRiverRunDone) {
      refetch();
    }
  }, [isRiverRunDone, refetch]);

  useEffectOnce(() =>
    updateDownloadData(
      JSON.stringify(data),
      `River-${getOId(selectedRiverId)}-tests-log.csv`,
    ),
  );

  return <ResultsGrid data={data} loading={isLoading} />;
}
