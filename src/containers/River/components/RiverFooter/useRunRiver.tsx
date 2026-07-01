import {
  IRiverRunResult,
  IRiverV1RunResponse,
  OID,
  RiverRunStatus,
  StatusTypes,
} from 'api/types';
import { useIsNewCheckRunActive } from 'components';
import { useCallback } from 'react';
import { useRiverActions } from 'store/river';

export const useRunRiver = ({ onError }) => {
  const { runRiver, runRiverV1 } = useRiverActions();
  const useV1Run = useIsNewCheckRunActive();

  const validatePayload = useCallback(
    payload => {
      const skippedRun = payload?.status === StatusTypes.SKIPPED;
      if (isRunIncludeMessage(payload)) {
        onError({
          duration: 15000,
          description: skippedRun
            ? 'Data Flow is already running. Please use Activities tab to monitor the ongoing run'
            : payload?.message || payload?.error,
          ...(skippedRun && {
            title: 'This run was skipped',
          }),
        });
        return;
      }
      return payload as any;
    },
    [onError],
  );

  const run = useCallback(
    async (crossId: OID): Promise<IRiverRunResult> => {
      if (useV1Run) {
        const response: any = await runRiverV1(crossId);
        if (response?.error) {
          onError({
            duration: 15000,
            description: response.error?.message,
          });
          return;
        }
        return validatePayload(response?.payload);
      }
      const response: any = await runRiver(crossId);
      return response.payload as IRiverRunResult;
    },
    [useV1Run, runRiver, runRiverV1, validatePayload, onError],
  );

  return run;
};

const errorStatuses = [RiverRunStatus.SKIPPED];
const isRunIncludeMessage = (payload: IRiverV1RunResponse | any) => {
  return errorStatuses.includes(payload.status) || payload.error;
};
