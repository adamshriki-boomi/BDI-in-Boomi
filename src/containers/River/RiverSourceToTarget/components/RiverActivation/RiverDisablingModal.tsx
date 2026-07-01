import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Icon,
} from '@chakra-ui/react';
import {
  CloseIcon,
  ConfirmationModal,
  RiveryButton,
  Text,
  useDisclosure,
} from 'components';
import { RiveryDrawerFooter } from 'components/Drawer/RiveryDrawerFooter';
import { useRiverId } from 'containers/Activities/helpers';
import { useUpdateRiver } from 'containers/River/hooks/useUpdateRiverValues';
import {
  useDisableRiver,
  useGetRiverCommonProps,
  useSttFormContext,
} from 'modules/SourceTarget';
import { useEffect } from 'react';
import { DisablingStatusLogState } from './components/DisablingStatusLogState';
import { useCancelPullRequestRun } from './hooks';

export function DisablingModal({
  show,
  toggle: dismissModal,
  runningOperation,
}) {
  const formApi = useSttFormContext();

  const { isCDC } = useGetRiverCommonProps();
  const riverId = useRiverId();
  const { isOpen, onToggle } = useDisclosure();
  const {
    disableRiver: disable,
    running,
    completed,
    statusLog,
    error: initiateDisablingError,
  } = useDisableRiver(runningOperation);
  const updateRiver = useUpdateRiver(formApi);

  const { cancel: cancelDisabling } = useCancelPullRequestRun();

  useEffect(() => {
    if (completed) {
      updateRiver();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completed]);

  useEffect(() => {
    if (show && runningOperation) {
      onToggle();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runningOperation]);
  return (
    <>
      <ConfirmationModal
        show={show && !runningOperation}
        title="Disable Data Flow"
        variant="warning"
        description={
          isCDC
            ? 'Disabling a Data Flow will stop your data from syncing.'
            : 'Disabling a Data Flow will prevent your Data Flow from future runs'
        }
        confirmColorScheme="purple"
        confirmLabel="Disable Data Flow"
        confirmProps={{
          onClick: () => {
            dismissModal(false);
            onToggle();
            disable(riverId);
          },
          isLoading: running,
        }}
        onClose={() => dismissModal(false)}
      />

      <Drawer
        closeOnOverlayClick={false}
        size="default"
        isOpen={isOpen}
        placement="right"
        onClose={onToggle}
      >
        <DrawerOverlay />
        <Content
          isCDC={isCDC}
          statusLog={statusLog}
          initiateDisablingError={initiateDisablingError}
          completed={completed}
          onToggle={onToggle}
          cancelOperation={cancelDisabling}
        />
      </Drawer>
    </>
  );
}

function Content({
  isCDC,
  statusLog,
  initiateDisablingError,
  completed,
  onToggle,
  cancelOperation,
}) {
  return (
    <DrawerContent h="full">
      <DrawerHeader borderBottom="1px" borderBottomColor="gray.300" pb={2}>
        <Text textStyle="M4">Data Flow Disabling</Text>
      </DrawerHeader>
      <DrawerBody h="full">
        <DisablingStatusLogState
          isCDC={isCDC}
          statusLog={statusLog}
          disablingError={
            initiateDisablingError ||
            (statusLog?.status === 'E' && statusLog.result === '')
          }
        />
      </DrawerBody>
      <RiveryDrawerFooter
        footerHeight="57px"
        handleOnClose={onToggle}
        handleOnSuccess={onToggle}
        cancelLabel={
          ['R', 'W'].includes(statusLog?.status) ? (
            <RiveryButton
              size="small"
              colorScheme="danger"
              leftIcon={<Icon as={CloseIcon} color="inherit" />}
              label="Cancel Operation"
              onClick={() => cancelOperation(statusLog?.operation_id)}
            />
          ) : (
            'Close'
          )
        }
        saveLabel={null}
        disabledSave={!completed && !initiateDisablingError}
      />
    </DrawerContent>
  );
}
