import {
  Collapse,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
} from '@chakra-ui/react';
import {
  Box,
  ChevronDown,
  ChevronUp,
  CloseIcon,
  Flex,
  Icon,
  RiveryButton,
  RiveryButtonWithTooltip,
  RiveryModal,
  Text,
  useDisclosure,
} from 'components';
import { RiveryDrawerFooter } from 'components/Drawer/RiveryDrawerFooter';
import { RiveryRadioGroup } from 'components/Form/components/RiveryRadioGroup';
import { useRiverId } from 'containers/Activities/helpers';
import { useUpdateRiver } from 'containers/River/hooks/useUpdateRiverValues';
import { useDataSourcesSections } from 'modules';
import {
  useGetRiverCommonProps,
  useSttFormContext,
} from 'modules/SourceTarget';
import { useEffect, useMemo, useState } from 'react';
import { ActivationStatusLogState } from './components/ActivationStatusLogState';
import { AdditionalOptionsValues } from './components/SyncOptions';
import {
  useCancelPullRequestRun,
  useEnableRiver,
  useHandleReplaceRouteAndRun,
} from './hooks';

export function ActivationModal({
  show,
  toggle,
  isNewRiver = false,
  newRiverId = null,
  runningOperation = null,
}) {
  const formApi = useSttFormContext();
  const { isCDC } = useGetRiverCommonProps();
  const { selectedDataSource } = useDataSourcesSections(
    'source',
    formApi?.watch('river.properties.source.name'),
  );
  const riverId = useRiverId();
  const { isOpen, onToggle } = useDisclosure();
  const [syncOption, setSyncOption] = useState('auto');
  const [config, setConfig] = useState({});

  const {
    enableRiver,
    statusLog,
    clearStatusLog,
    completed,
    loading,
    activationError,
  } = useEnableRiver(
    syncOption,
    newRiverId ?? riverId,
    config,
    runningOperation,
  );
  const syncOptions = useMemo(
    () =>
      AdditionalOptionsValues(
        syncOption,
        config,
        setConfig,
        selectedDataSource,
      ),
    [config, syncOption, selectedDataSource],
  );

  const updateRiver = useUpdateRiver(formApi);

  const { cancel: cancelActivation, cancelResponse } =
    useCancelPullRequestRun();
  const replaceRouteAndRun = useHandleReplaceRouteAndRun(
    isNewRiver,
    newRiverId,
    toggle,
    clearStatusLog,
  );

  useEffect(() => {
    if (completed && !isNewRiver) {
      updateRiver();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completed]);

  // activate upon drawer open
  useEffect(() => {
    if (
      show &&
      !isCDC &&
      (newRiverId || riverId !== 'new') &&
      !runningOperation
    ) {
      enableRiver();
    }
  }, [enableRiver, isCDC, newRiverId, riverId, runningOperation, show]);

  return isCDC && !Boolean(statusLog) ? (
    <RiveryModal
      modalProps={{ closeOnOverlayClick: false, isClosable: false }}
      show={show}
      toggle={toggle}
      title="Activate Data Flow for Streaming"
      style={{ content: { maxW: '520px' } }}
      body={
        <Flex flexDir="column">
          {/* Add condition if no topology don't show options */}
          <Text>
            Your data will start streaming automatically from this point forward
            or the last available log position. For additional options,{' '}
            <RiveryButton
              label="see more"
              variant="transparent"
              rightIcon={<Icon as={isOpen ? ChevronUp : ChevronDown} />}
              color="primary"
              onClick={onToggle}
              p={0}
              h="0px!important"
              mb="2px"
            />
          </Text>
          <Collapse in={isOpen}>
            <Flex
              borderTop="1px"
              borderTopColor="gray.300"
              flexDir="column"
              gap={2}
              pt={3}
              mt={3}
            >
              <Box pl={1}>
                <RiveryRadioGroup
                  defaultValue={syncOption}
                  onChange={setSyncOption}
                  values={syncOptions}
                  value={syncOption}
                />
              </Box>
            </Flex>
          </Collapse>
        </Flex>
      }
      footer={{
        handleOnClose: () => {
          clearStatusLog();
          riverId !== 'new' ? toggle(false) : replaceRouteAndRun(false);
        },
        saveLabel: (
          <RiveryButton
            size="small"
            variant="primary"
            label="Activate Data Flow"
            onClick={enableRiver}
            isLoading={loading}
          />
        ),
        cancelLabel: 'Cancel Activation',
        justify: 'space-between',
      }}
    />
  ) : (
    <Drawer
      closeOnOverlayClick={false}
      closeOnEsc={false}
      size="default"
      isOpen={show}
      placement="right"
      onClose={toggle}
    >
      <DrawerOverlay />
      <ActivationDrawerContent
        {...{
          statusLog,
          activationError,
          completed,
          isNewRiver,
          replaceRouteAndRun,
          cancelActivation,
          cancelResponse,
        }}
      />
    </Drawer>
  );
}

function ActivationDrawerContent({
  statusLog,
  activationError,
  completed,
  isNewRiver,
  replaceRouteAndRun,
  cancelActivation,
  cancelResponse,
}) {
  return (
    <DrawerContent h="full">
      <DrawerHeader borderBottom="1px" borderBottomColor="gray.300" pb={2}>
        <Text textStyle="M4">Data Flow Activation</Text>
      </DrawerHeader>
      <DrawerBody h="full">
        <ActivationStatusLogState
          statusLog={statusLog}
          activationError={
            activationError ||
            (statusLog?.status === 'E' && statusLog.result === '')
          }
          cancelResponse={cancelResponse}
        />
      </DrawerBody>
      <RiveryDrawerFooter
        footerHeight="57px"
        handleOnClose={() => replaceRouteAndRun(false)}
        handleOnSuccess={() => replaceRouteAndRun(true)}
        saveLabel={
          ['R', 'W'].includes(statusLog?.status) ? (
            <RiveryButton
              size="small"
              colorScheme="danger"
              leftIcon={<Icon as={CloseIcon} color="inherit" />}
              label="Cancel Activation"
              onClick={() => cancelActivation(statusLog?.operation_id)}
            />
          ) : (
            'Run Data Flow'
          )
        }
        cancelLabel={
          <RiveryButtonWithTooltip
            label={isNewRiver ? 'Go To Data Flow' : 'Close'}
            onClick={() => replaceRouteAndRun(false)}
            isDisabled={!completed && !activationError}
            size="small"
            variant="default"
            tooltip="Please wait for the activation to complete"
          />
        }
        disabledSave={
          !completed ||
          (activationError as any)?.message ||
          statusLog?.status === 'E'
        }
      />
    </DrawerContent>
  );
}
