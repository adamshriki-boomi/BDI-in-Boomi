import { Progress } from '@chakra-ui/react';
import { StatusTypes } from 'api/types';
import {
  Box,
  CloseIcon,
  CloseIconButton,
  DateDisplay,
  Flex,
  HStack,
  Icon,
  InfoTooltip,
  RenderGuard,
  RiveryButton,
  StatusIcon,
  Text,
} from 'components';
import RdsUndo from 'components/Icons/components/RdsUndo';
import { useRiverId } from 'containers/Activities/helpers';
import { DownloadLogButton } from 'containers/Activities/[id]/components/DownloadLogButton';
import {
  SaveRiverButton,
  useRiverDataBuilder,
  useValidateRiverSaver,
} from 'containers/River/new/source-to-target/components/SaveRiverButton';
import { useIsInNewS2TRiver, useSetDrawer } from 'modules/RiverRightBar';
import { DrawerType } from 'modules/RiverRightBar/Actions';
import { useIsRiverActive, useSttFormContext } from 'modules/SourceTarget';
import { useCallback, useEffect, useMemo } from 'react';
import { MdPlayArrow } from 'react-icons/md';
import { useHistory, useLocation } from 'react-router-dom';
import { useToggle } from 'react-use';
import ReActivationModal from './RiverActivation/ReactivationModal';
import { ActivationModal } from './RiverActivation/RiverActivationModal';
import RiveryAlert from '../../../../components/Alert/Alert';
import * as React from 'react';

const RunStatusText = {
  [StatusTypes.RUNNING]: 'Data Flow is running',
  [StatusTypes.PENDING]:
    'Data Flow is being saved, and the run is waiting to start',
  [StatusTypes.SUCCEEDED]: 'Data Flow run completed successfully',
  [StatusTypes.SKIPPED]: 'Data Flow is already running, run was skipped',
  [StatusTypes.FAILED]: 'Data Flow run has failed',
  [StatusTypes.CANCELED]: 'Data Flow is canceled',
  [StatusTypes.PARTIAL]: 'Data Flow ran partially',
};

function useSchemaTablesCalculate(schemas) {
  const totalTables = schemas
    ? (Object.values(schemas).reduce((acc, tables) => {
        Object.keys(tables).forEach(() => ((acc as number) += 1));
        return acc;
      }, 0) as number)
    : 0;
  return totalTables;
}

export function RiverRunBar({
  runData,
  isRunFinished,
  dismissBar,
  status,
  completedTables,
}) {
  const setDrawer = useSetDrawer();
  const riverId = useRiverId();
  const today = new Date();
  const formApi = useSttFormContext();
  const schemas = formApi?.watch('river.properties.schemas');
  const totalTables = useSchemaTablesCalculate(schemas);
  const progressPercentage =
    totalTables > 0 && completedTables > 0
      ? (completedTables / totalTables) * 100
      : 0;

  const progressBarColor =
    status === StatusTypes.FAILED
      ? 'red'
      : status === StatusTypes.PARTIAL
      ? 'yellow'
      : status === StatusTypes.SUCCEEDED
      ? 'blue'
      : 'gray';

  return (
    <>
      <Flex flexDir="column">
        <Box bg="gray.200" h="10px" />
        <Flex
          px={4}
          py={2}
          h={9}
          justify="space-between"
          alignItems="center"
          bg="background-secondary"
        >
          <HStack gap={2}>
            <DateDisplay value={today.getTime()} />
            <HStack>
              <StatusIcon value={status} />
              <Text>{RunStatusText[status]}</Text>
            </HStack>
          </HStack>
          <Flex alignItems="center" gap={2}>
            <RenderGuard condition={status && status !== StatusTypes.PENDING}>
              <RiveryButton
                label="View Activity"
                variant="link"
                color="primary"
                h={0}
                size="small"
                onClick={() => setDrawer(DrawerType.ACTIVITIES)}
              />
            </RenderGuard>
            <Text>
              {completedTables} of {totalTables} Tables
            </Text>
            <Progress
              w="200px"
              bg="white"
              border="1px"
              borderColor="border"
              min={0}
              max={totalTables}
              borderRadius="15px"
              colorScheme={progressBarColor}
              size="sm"
              value={completedTables}
            />
            <Text>{progressPercentage.toFixed(2)}%</Text>
            <CloseIconButton aria-label="close-bar" onClick={dismissBar} />
          </Flex>
        </Flex>
        <RenderGuard condition={isRunFinished}>
          <Flex
            bg="background-secondary"
            flexDir="column"
            py={3}
            px={4}
            gap={3}
            borderTop="1px"
            borderColor="gray.300"
          >
            <DownloadLogButton
              runId={runData?.run_group_id}
              riverId={riverId}
              runDate={runData?.start_date_in_milliseconds}
            />
            <RenderGuard condition={runData?.error_description}>
              <RiveryAlert
                variant="error-light"
                icon={InfoTooltip}
                description={runData?.error_description}
                maxH="100px"
                w="50%"
                overflowY="auto"
                sx={{
                  '.chakra-alert__desc': {
                    wordBreak: 'break-word',
                    whiteSpace: 'pre-wrap',
                    width: '100%',
                  },
                }}
              />
            </RenderGuard>
          </Flex>
        </RenderGuard>
      </Flex>
    </>
  );
}

export function RunRiver({
  run,
  cancelRun,
  runData,
  runInProcess,
  runRiverResponse,
  isDisabled = false,
  toggleView = null,
  setNewRiverId = null,
  newRiverId = null,
  reActivate = false,
  dismissReactivation = null,
}) {
  const isRiverActive = useIsRiverActive();
  const { replace } = useHistory();
  const [showReactivate, toggleReActivate] = useToggle(false);
  const [showActivation, toggleActivationModal] = useToggle(false);
  const riverId = useRiverId();
  const isNewRiver = useIsInNewS2TRiver();
  const river_cross_id = isNewRiver ? newRiverId : riverId;
  const buildRiverData = useRiverDataBuilder();
  const validateRiverStructure = useValidateRiverSaver();
  const toggleActivation = useCallback(
    result => {
      setNewRiverId(result?.cross_id);
      toggleActivationModal(true);
    },
    [setNewRiverId, toggleActivationModal],
  );

  const runRiver = useCallback(async () => {
    await runRiverResponse.reset();
    toggleView && toggleView(true);
    run({ river_cross_id });
  }, [river_cross_id, run, runRiverResponse, toggleView]);

  //When riderceted from creation with this state - the run should initiate
  //We don't need to save it again, since it's already been saved on activation
  const { state, pathname }: any = useLocation();
  useEffect(() => {
    if (state?.runRiver) {
      replace({ pathname, state: null });
      setTimeout(() => runRiver(), 1000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const onSaveSuccess = useCallback(
    result => {
      //If river is not active - start activatio
      if (isNewRiver || !isRiverActive) {
        toggleActivation(result);
      } else {
        //If river is active - start the run
        runRiver();
      }
    },
    [runRiver, isNewRiver, isRiverActive, toggleActivation],
  );

  const activationButtonLabel = useMemo(() => {
    if (isNewRiver || !isRiverActive) {
      return 'Activate';
    } else if (isRiverActive && reActivate) {
      return 'Re-Activate';
    } else {
      return 'Run Data Flow';
    }
  }, [isNewRiver, isRiverActive, reActivate]);

  return runInProcess ? (
    <RiveryButton
      gridArea="run"
      size="sm"
      label="Stop Run"
      colorScheme="danger"
      leftIcon={<Icon as={CloseIcon} />}
      onClick={() =>
        cancelRun({
          river_cross_id,
          run_group_id: runData?.run_group_id,
        })
      }
    />
  ) : (
    <>
      <SaveRiverButton
        gridArea="run"
        variant="primary"
        label={activationButtonLabel}
        size="sm"
        showLoader={runRiverResponse?.isLoading}
        isDisabled={isDisabled}
        onSuccess={onSaveSuccess}
        reActivate={reActivate}
        isActivateButton={true}
        {...(!isNewRiver &&
          isRiverActive && {
            leftIcon: (
              <Icon
                as={reActivate ? RdsUndo : MdPlayArrow}
                boxSize={4}
                {...(!reActivate && { borderRadius: 'full', border: '1px' })}
              />
            ),
          })}
        // If the river is ready to run
        {...(reActivate && {
          //If reactivation is needed, we want to overrite the default onClick and perform some actions before
          onClick: async () => {
            const river = buildRiverData();
            const valid = await validateRiverStructure(river, {
              isActivateButton: true,
            });
            if (valid) {
              toggleReActivate(true);
            }
          },
        })}
        {...(!isRiverActive && {
          tooltip: 'This action will save and activate the Data Flow',
          tooltipProps: { contentProps: { w: '180px' } },
        })}
      />

      <ActivationModal
        show={showActivation}
        toggle={toggleActivationModal}
        isNewRiver={isNewRiver}
        newRiverId={newRiverId}
      />
      <ReActivationModal
        showReactivate={showReactivate}
        toggleReActivate={toggleReActivate}
        dismissReactivation={dismissReactivation}
      />
    </>
  );
}
