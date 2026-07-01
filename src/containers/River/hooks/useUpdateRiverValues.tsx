import { useGetActivitiesConsistencyMutation } from 'containers/Activities';
import { useRiverId } from 'containers/Activities/helpers';
import { useGetRiverTrigger } from 'modules/SourceTarget';
import { useCallback } from 'react';

export const useUpdateRiver = formApi => {
  const riverId = useRiverId();
  const { getRiver } = useGetRiverTrigger(riverId);
  const [getConsistency] = useGetActivitiesConsistencyMutation();

  const updateRiverValues = useCallback(async () => {
    const today = new Date();
    const consistency = await getConsistency({
      rivers: [riverId],
      end_time: today.getTime(),
    });
    const lastRun = (consistency as any)?.data?.items[0]?.last_runs?.[0];
    const result = await getRiver();
    formApi.reset(
      { river: result, lastRun },
      { keepDirty: false, keepTouched: false },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formApi, getRiver, riverId]);
  return updateRiverValues;
};
