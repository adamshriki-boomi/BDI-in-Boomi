import { API } from 'api';
import { StatusTypes } from 'api/types';
import {
  CloseIconSmall,
  ConfirmationButtonModal,
  Icon,
  RiveryButton,
} from 'components';
import { useRiverId } from 'containers/Activities/helpers';
import { useFetchActivities } from 'containers/Activities/useFetchActivities';
import { useToastUpdater } from 'hooks/useToast';
import React, { useCallback } from 'react';
import { calculateTime } from 'utils/date.utils';

export function CancelRunButton({
  run_id,
  run_group_id,
  ...rest
}: {
  run_id?: string;
  run_group_id?: string;
  'data-pendo-id'?: string;
}) {
  const riverId = useRiverId();
  const _id = run_group_id ?? run_id;
  const { updateToast, addToast } = useToastUpdater(_id);
  const { api } = useFetchActivities();
  const end_time = () => calculateTime('D', 1)?.event_end_time;

  const triggerRefetch = useCallback(() => {
    api.setParam({ end_time: end_time() });
  }, [api]);

  const cancelRunFn = useCallback(
    async id => {
      let response;
      addToast('Canceling run');
      const payloadV1 = {
        cross_id: riverId,
        ...(run_group_id ? { run_group_id: id } : { run_id: id }),
      };

      response = await API.rivers.cancelRunV1(payloadV1);
      if (response?.status === 400) {
        updateToast('error', response?.detail || 'Something Went wrong', null);
      } else {
        updateToast('info', 'Run was canceled. It may take a few seconds.');
        setTimeout(() => {
          triggerRefetch();
        }, 2000);
        return;
      }
    },
    [addToast, riverId, run_group_id, updateToast, triggerRefetch],
  );

  return (
    <ConfirmationButtonModal
      name=""
      confirmLabel="Stop Run"
      key="Cancel Run"
      ariaLabel="cancel run modal"
      header="Stop Run"
      warningMessage={CANCEL_RUN_MESSAGE}
      type="connection"
      onConfirm={() => cancelRunFn(_id)}
    >
      <RiveryButton
        leftIcon={<Icon as={CloseIconSmall} boxSize="14px" />}
        label="Cancel"
        variant="default"
        size="small"
        width="80px"
        {...rest}
      />
    </ConfirmationButtonModal>
  );
}

export const displayCancelButton = ({ status }) =>
  status === StatusTypes.RUNNING || status === StatusTypes.PENDING;

export const displayRetryButton = ({ is_retry, status }) =>
  !is_retry && status === StatusTypes.FAILED;

export const CANCEL_RUN_MESSAGE =
  '<div>Stopping the current run will prevent other processes from running and will make a rollback impossible. </div>' +
  '<div>Please note that any completed activities or processes will still be charged BDU credit.</div>';
