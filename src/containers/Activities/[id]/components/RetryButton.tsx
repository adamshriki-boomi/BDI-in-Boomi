import { Icon } from '@chakra-ui/react';
import { RetryUndoIcon, RiveryButton } from 'components';
import { calculateTime } from 'utils/date.utils';
import { retryAction } from 'containers/Activities/store/logActions';
import { useFetchActivities } from 'containers/Activities/useFetchActivities';
import { useToastUpdater } from 'hooks/useToast';
import React, { useCallback } from 'react';

export function RetryButton({
  _id,
  ariaLabel,
}: {
  _id: string;
  ariaLabel: string;
}) {
  const { updateToast, addToast } = useToastUpdater(_id);
  const { api } = useFetchActivities();
  const end_time = () => calculateTime('D', 1)?.event_end_time;

  const triggerRefetch = useCallback(() => {
    api.setParam({ end_time: end_time() });
  }, [api]);

  const retryRun = useCallback(
    async (_id, e) => {
      e?.preventDefault();
      e?.stopPropagation();
      addToast('Retrying failed run');
      const response = await retryAction(_id);
      if (response?.status) {
        updateToast('error', response?.data?.message, 5000);
        return;
      }
      updateToast('info', 'Run in progress');
      triggerRefetch();
      e?.stopPropagation();
    },
    [addToast, triggerRefetch, updateToast],
  );

  return (
    <RiveryButton
      label="Retry"
      variant="default"
      color="font"
      size="small"
      aria-label={ariaLabel}
      leftIcon={<Icon as={RetryUndoIcon} boxSize="14px" />}
      onClick={e => retryRun(_id, e)}
    />
  );
}
