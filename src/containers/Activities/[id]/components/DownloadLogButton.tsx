import { ButtonProps, useToast } from '@chakra-ui/react';
import { StatusCodes } from 'api/endpoints/common.api';
import { downloadUrl, exportToFile } from 'api/endpoints/files.api';
import { RiverTypes } from 'api/types';
import {
  DownloadIcon,
  Icon,
  RiveryButton,
  RiveryButtonProps,
  RiveryInfoTooltip,
} from 'components';
import { useRiverId } from 'containers/Activities/helpers';
import { useFetchRiverQuery } from 'containers/Activities/store';
import {
  downloadlog,
  downloadStepLog,
} from 'containers/Activities/store/logActions';
import { getRiverType } from 'containers/River/river.utils';
import { add } from 'date-fns';
import { CreateLoadingToast } from 'hooks/useToast';
import { useSourceByType } from 'modules/Datasources/useSourceByType';
import { useGetRiverTrigger } from 'modules/SourceTarget';
import { useCallback, useRef } from 'react';
import { useCore } from 'store/core';

const useShouldExposeLogs = () => {
  const { data: river } = useFetchRiverQuery(useRiverId());
  const riverType = getRiverType(river);
  const type = river?.tasks_definitions[0]?.datasource_id;
  const { get } = useSourceByType();
  return (
    riverType !== RiverTypes.SOURCE_TO_TARGET ||
    get(type)?.data_source_type_settings?.logs_settings?.support_logs
  );
};

export function DownloadPythonStepLog({
  show,
  _id,
  step,
}: {
  show: boolean;
  _id: string;
  step: Record<string, string>;
}) {
  const toastIdRef = useRef<any>(null);
  const { toast, addToast, updateToast } = useToastComponentUpdater(
    toastIdRef,
    _id,
  );
  const riverId = useRiverId();
  const download = useCallback(async () => {
    if (!toast.isActive(_id)) {
      addToast('Download in progress');
    }
    const response = await downloadStepLog(
      riverId,
      _id,
      step.step_id,
      step?.iteration,
    );
    if (response?.logs_url) {
      downloadUrl(response.logs_url, `Step-${step.step_id}.csv`);
      updateToast('success', 'Download completed!');
      return;
    }
    updateToast('error', 'No files to download');
  }, [
    _id,
    addToast,
    riverId,
    step?.iteration,
    step.step_id,
    toast,
    updateToast,
  ]);

  if (!show) {
    return null;
  }

  return <DownloadButton label="Download Log" onClick={download} />;
}

export function DownloadLogButton({
  runId,
  riverId,
  buttonProps,
  runDate,
  disabled = false,
  ...rest
}: {
  runId: string;
  riverId: string;
  runDate: number;
  disabled?: boolean;
  buttonProps?: ButtonProps;
  'data-pendo-id'?: string;
}) {
  const { getRiver } = useGetRiverTrigger(riverId);
  const today = new Date();
  const timeFrame = add(new Date(runDate), {
    days: 14,
  });
  const hasAvailableLogs = today.getTime() < timeFrame.getTime();
  const show = useShouldExposeLogs();
  const { isSuperAdminUser } = useCore();
  const isDownloadAvailable = show || isSuperAdminUser;
  const toastIdRef = useRef<any>(null);
  const { toast, addToast, updateToast } = useToastComponentUpdater(
    toastIdRef,
    runId,
  );
  const download = useCallback(async () => {
    if (!toast.isActive(runId)) {
      addToast('Download in progress');
    }
    const river = await getRiver();
    const source = river?.properties?.source?.name;
    const isBlueprint = source === 'blueprint';

    await downloadlog(riverId, runId, isBlueprint)
      .then(({ data, status }) => {
        if (status === StatusCodes.SUCCESS_NO_CONTENT) {
          return updateToast('error', 'No logs found');
        }
        exportToFile(data, `Run-${runId}.csv`);
        updateToast('success', 'Download completed!');
      })
      .catch(e => {
        updateToast('error', e?.detail);
      });
  }, [toast, runId, getRiver, riverId, addToast, updateToast]);

  if (!isDownloadAvailable) {
    return null;
  }

  return (
    <DownloadButton
      label="Download Log"
      onClick={e => {
        e.preventDefault();
        download();
      }}
      isDisabled={!hasAvailableLogs || disabled}
      {...buttonProps}
      {...rest}
    />
  );
}

const useToastComponentUpdater = (toastIdRef, _id) => {
  const toast = useToast();
  const addToast = useCallback(
    description => {
      toastIdRef.current = CreateLoadingToast(toast, description, _id);
    },
    [_id, toast, toastIdRef],
  );
  const updateToast = useCallback(
    (status, description) => {
      toast.update(toastIdRef.current, {
        duration: 3000,
        isClosable: true,
        title: null,
        status,
        description,
      });
    },
    [toast, toastIdRef],
  );

  return { toast, addToast, updateToast };
};

function DownloadButton(props: RiveryButtonProps) {
  return (
    <DownloadButtonTooltipWrap isDisabled={props.isDisabled}>
      <RiveryButton
        pl={0.5}
        w="150px"
        size="sm"
        fontSize="sm"
        aria-label="download-log"
        variant="default"
        leftIcon={<Icon as={DownloadIcon} boxSize={5} color="inherit" p={0} />}
        pointerEvents="all"
        {...props}
      />
    </DownloadButtonTooltipWrap>
  );
}

function DownloadButtonTooltipWrap({ isDisabled, children }) {
  return isDisabled ? (
    <RiveryInfoTooltip
      description="Logs are archived after 14 days"
      icon={children}
      extraProps={{
        placement: 'left',
      }}
    />
  ) : (
    children
  );
}
