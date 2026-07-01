import {
  Box,
  CloseIcon,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  EditIcon,
  Flex,
  Icon,
  OutlinedClose,
  OutlinedSuccess,
  RenderGuard,
  RiveryButton,
  RiveryButtonWithTooltip,
  Text,
} from 'components';
import RiveryAlert from 'components/Alert/Alert';
import { RiveryDrawerFooter } from 'components/Drawer/RiveryDrawerFooter';
import { useRiverId } from 'containers/Activities/helpers';
import { useUpdateRiver } from 'containers/River/hooks/useUpdateRiverValues';
import {
  useRiverDataBuilder,
  useRiverSaver,
} from 'containers/River/new/source-to-target/components/SaveRiverButton';
import {
  useDisableRiver,
  useGetRiverCommonProps,
  useRiverActivation,
} from 'modules/SourceTarget';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useHistory } from 'react-router-dom';
import { useEffectOnce } from 'react-use';
import { ActivationStatusLogState } from './components/ActivationStatusLogState';
import { DisablingStatusLogState } from './components/DisablingStatusLogState';
import { StatusReflection } from './components/StatusReflection';
import { useCancelPullRequestRun } from './hooks';

export default function ReActivationModal({
  showReactivate,
  toggleReActivate,
  dismissReactivation,
  closeLabel = 'Close',
  reRouteTo = null,
}) {
  const formApi = useFormContext();
  return (
    <Drawer
      closeOnOverlayClick={false}
      size="default"
      isOpen={showReactivate}
      placement="right"
      onClose={toggleReActivate}
    >
      <DrawerOverlay />
      <ModalContent
        closeLabel={closeLabel}
        toggleReActivate={toggleReActivate}
        dismissReactivation={dismissReactivation}
        formApi={formApi}
        reRouteTo={reRouteTo}
      />
    </Drawer>
  );
}

function failedReasonMessage(reason) {
  return `Failed to ${reason} Data Flow`;
}

function ModalContent({
  toggleReActivate,
  dismissReactivation,
  formApi,
  closeLabel,
  reRouteTo,
}) {
  const { replace } = useHistory();
  const { isCDC } = useGetRiverCommonProps();
  const [saveError, setSaveError] = useState(null);
  const riverId = useRiverId();
  const {
    disableRiver: disable,
    completed: completedDisable,
    statusLog: disablingStatusLog,
    error: disablingError,
  } = useDisableRiver();

  const {
    setRiverActive,
    statusLog: activationStatusLog,
    completed: completedActivate,
    activationError,
  } = useRiverActivation();

  const { cancel: cancelActivation, cancelResponse } =
    useCancelPullRequestRun();

  useEffectOnce(() => {
    //First thing when the drawer opens is to disable the river
    disable(riverId);
  });

  const buildRiverData = useRiverDataBuilder();
  const updateForm = useUpdateRiver(formApi);
  const { isLoading, save, completed } = useRiverSaver(false);

  const startReactivationProcess = useCallback(async () => {
    const river = buildRiverData();
    const result: any = await save(river);
    if (result.error) {
      setSaveError(result.error);
    } else {
      updateForm();
      await setRiverActive(riverId);
    }
  }, [buildRiverData, riverId, save, setRiverActive, updateForm]);

  useEffect(() => {
    if (completedDisable) {
      startReactivationProcess();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completedDisable]);

  useEffect(() => {
    if (completedActivate) {
      updateForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completedActivate]);

  const savingStatus = useMemo(() => {
    if (disablingStatusLog?.status === 'R') {
      return 'W';
    } else if (isLoading) {
      return 'R';
    } else if (saveError) {
      return 'E';
    } else if (completed || activationStatusLog?.status) {
      return 'D';
    }
    return 'W';
  }, [
    activationStatusLog?.status,
    completed,
    disablingStatusLog?.status,
    isLoading,
    saveError,
  ]);

  const activatingRiverStatus = useMemo(
    () =>
      completedActivate
        ? 'D'
        : activationStatusLog?.result
        ? 'R'
        : activationStatusLog?.status ?? 'W',
    [
      activationStatusLog?.result,
      activationStatusLog?.status,
      completedActivate,
    ],
  );

  const isProcessFailed = useMemo(
    () =>
      [activationStatusLog?.status, disablingStatusLog?.status].includes('E') ||
      cancelResponse?.data?.error_message ||
      saveError,
    [
      activationStatusLog?.status,
      cancelResponse?.data?.error_message,
      disablingStatusLog?.status,
      saveError,
    ],
  );

  const completeReactivation = useCallback(() => {
    toggleReActivate(false);
    //We are not in reactivatoin anymore, because river is disabled.
    dismissReactivation();
  }, [dismissReactivation, toggleReActivate]);

  const dismissReactivationAndKeepDisabled = useCallback(() => {
    completeReactivation();
    //Keeping all values except status which is now disabled becase it was successfuly disabeld
    formApi?.setValue('river', {
      ...formApi?.watch('river'),
      metadata: {
        ...formApi?.watch('river.metadata'),
        river_status: 'disabled',
      },
    });
  }, [completeReactivation, formApi]);

  const runRiver = useCallback(() => {
    completeReactivation();
    setTimeout(() => {
      replace({ state: { runRiver: true } });
    }, 500);
  }, [completeReactivation, replace]);

  return (
    <DrawerContent h="full">
      <DrawerHeader borderBottom="1px" borderBottomColor="gray.300" pb={2}>
        <Text textStyle="M4">Data Flow Re-Activation</Text>
      </DrawerHeader>
      <DrawerBody h="full">
        <Flex flexDir="column" gap={3}>
          <RenderGuard condition={isProcessFailed}>
            <RiveryAlert
              variant="error-light"
              title={
                //If process canceled
                cancelResponse?.data?.error_message
                  ? 'Reactivation process was stopped'
                  : //If reached activation, and failed
                  activationStatusLog?.status
                  ? failedReasonMessage('Activate')
                  : // If failed on save
                  saveError
                  ? failedReasonMessage('Save')
                  : //If failed on disabling
                    failedReasonMessage('Disable')
              }
              description={
                cancelResponse?.data?.error_message
                  ? null
                  : 'Please review the following reason(s) and proceed accordingly.'
              }
              icon={OutlinedClose}
            />
          </RenderGuard>
          <RenderGuard condition={activationStatusLog?.status === 'D'}>
            <RiveryAlert
              variant="success-contained"
              title="Data Flow Was Successfully Activated!"
              description={
                isCDC
                  ? 'Your data is starting to stream and the Data Flow is ready to run.'
                  : 'Your Data Flow is ready to run.'
              }
              icon={OutlinedSuccess}
            />
          </RenderGuard>
          <DisablingStatusLogState
            showTitle={false}
            isCDC={isCDC}
            statusLog={disablingStatusLog}
            disablingError={
              disablingError ||
              (disablingStatusLog?.status === 'E' &&
                disablingStatusLog.result === '')
            }
          />
          <StatusReflection
            isMain
            description="Saving Data Flow"
            status={savingStatus}
            activationError={saveError}
          />
          <RenderGuard condition={Boolean(saveError)}>
            <RiveryAlert variant="error-light" description={saveError} />
          </RenderGuard>
          <Flex flexDir="column" mt={2}>
            <StatusReflection
              isMain
              description="Activating Data Flow"
              status={activatingRiverStatus}
            />
            <Box ml={6} mt={4}>
              <ActivationStatusLogState
                showTitle={false}
                statusLog={activationStatusLog}
                activationError={activationError}
                cancelResponse={cancelResponse}
              />
            </Box>
          </Flex>
        </Flex>
      </DrawerBody>
      <RiveryDrawerFooter
        footerHeight="57px"
        handleOnClose={() => toggleReActivate(false)}
        handleOnSuccess={runRiver}
        saveLabel={
          !completedActivate && !saveError ? (
            <RiveryButton
              size="small"
              colorScheme="danger"
              leftIcon={<Icon as={CloseIcon} color="inherit" />}
              label="Cancel Process"
              onClick={() =>
                cancelActivation(
                  activationStatusLog?.status
                    ? activationStatusLog?.operation_id
                    : disablingStatusLog?.operation_id,
                )
              }
            />
          ) : saveError ? (
            <RiveryButton
              size="small"
              leftIcon={<Icon as={EditIcon} color="inherit" />}
              label="Fix Data Flow"
              onClick={dismissReactivationAndKeepDisabled}
            />
          ) : (
            'Run Data Flow'
          )
        }
        cancelLabel={
          <RiveryButtonWithTooltip
            label={closeLabel}
            onClick={() => {
              //If closed mid process
              if (completedDisable && !completedActivate) {
                dismissReactivationAndKeepDisabled();
              }
              completeReactivation();
              reRouteTo && replace(reRouteTo);
            }}
            isDisabled={!completedActivate && !isProcessFailed}
            size="small"
            variant="default"
            tooltip="Please wait for the process to complete"
          />
        }
        disabledSave={isProcessFailed}
      />
    </DrawerContent>
  );
}
