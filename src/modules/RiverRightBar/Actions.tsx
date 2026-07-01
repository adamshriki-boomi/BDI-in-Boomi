import { Center, Icon, Tooltip } from '@chakra-ui/react';
import { RiverTypes } from 'api/types';
import { RoutesBuilder } from 'app/routes';
import {
  Flex,
  InfoTooltip,
  RenderGuard,
  Text,
  TransparentIconButton,
} from 'components';
import {
  RdsHistory,
  RdsRecipeFile,
  RdsScheduleSettings,
  VariablesIcon,
} from 'components/Icons/components';
import PopConfirm from 'components/PopConfirm/PopConfirm';
import { useRiverId } from 'containers/Activities/helpers';
import { RiverListActions } from 'containers/River/components/RiverListAction';
import { getQueryParams } from 'hooks/router';
import { useRiverType } from 'hooks/useRiverType';
import { MonitoringIcon } from 'layout/Sidebar/components/icons';
import { VersionToolbar } from 'modules';
import { useVersionController } from 'modules/Versions/hooks';
import { useVersionDetails } from 'modules/Versions/hooks/useVersionDetails';
import { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { MdOutlineTableChart } from 'react-icons/md';
import { useHistory } from 'react-router-dom';
import { useAccount, useCore } from 'store/core';
import { isRiverDraft, useRiver } from 'store/river';
import { getOId } from 'utils/api.sanitizer';
import { useDismissDrawer, useSetDrawer } from './RiverRightBar';
import { useIsInNewRiver, useIsInNewS2TRiver } from './useShouldShowSidebar';

export enum DrawerType {
  VERSIONS = 'versions',
  ACTIVITIES = 'activities',
  DATAFRAMES = 'dataframes',
  VARIABLES = 'variables',
  SCHEDULER = 'scheduler',
  INFO = 'info',
  YAML = 'yaml',
}

function S2TReact({ createRiverForm, showVersionToolbar = false }) {
  const formApi = useFormContext();
  const form = formApi ?? createRiverForm;
  const isBlueprint = ['Blueprint', 'blueprint_copilot', 'blueprint'].includes(
    form?.watch('river.properties.source.name'),
  );
  const blueprintID = form?.watch(
    'river.properties.source.additional_settings.recipe_id',
  );
  const createMode = useIsInNewS2TRiver();
  return (
    <>
      <DrawerTriggerButton
        isDisabled={createMode}
        ariaLabel="info"
        description="Data Flow Info"
        icon={InfoTooltip}
        isFirstInList
      />
      <DrawerTriggerButton
        isDisabled={createMode}
        ariaLabel="versions"
        description="Version History"
        icon={RdsHistory}
        showVersionToolbar={showVersionToolbar}
      />
      <DrawerTriggerButton
        isDisabled={createMode}
        ariaLabel="activities"
        description="Activities"
        icon={MonitoringIcon}
      />
      <DrawerTriggerButton
        ariaLabel="variables"
        description="Variables"
        icon={VariablesIcon}
      />
      <DrawerTriggerButton
        isDisabled={createMode}
        ariaLabel="scheduler"
        description="Scheduling & Notifications"
        icon={RdsScheduleSettings}
      />
      <RenderGuard condition={isBlueprint}>
        <DrawerTriggerButton
          isDisabled={!blueprintID}
          ariaLabel="yaml"
          description="Blueprint YAML"
          icon={RdsRecipeFile}
        />
      </RenderGuard>
    </>
  );
}

function Logic({ showVersionToolbar = false }) {
  const { isSettingOn } = useAccount();
  const showDF = isSettingOn('allow_logic_python');
  const createMode = useIsInNewRiver();
  return (
    <>
      <DrawerTriggerButton
        isDisabled={createMode}
        ariaLabel="versions"
        description="Version History"
        icon={RdsHistory}
        showVersionToolbar={showVersionToolbar}
      />
      <DrawerTriggerButton
        isDisabled={createMode}
        ariaLabel="activities"
        description="Activities"
        icon={MonitoringIcon}
      />
      <DrawerTriggerButton
        isDisabled={false}
        ariaLabel="variables"
        description="Variables"
        icon={VariablesIcon}
      />
      {showDF && (
        <DrawerTriggerButton
          isDisabled={false}
          ariaLabel="dataframes"
          description="Dataframes"
          icon={MdOutlineTableChart}
        />
      )}
    </>
  );
}

function Legacy({ showVersionToolbar = false, newRiverCrossId = null }) {
  const riverId = useRiverId();
  const { riverType, selectedRiver } = useRiver();
  const { selected_river_type } = getQueryParams(['selected_river_type']);
  const isV2 = selectedRiver?.river_definitions?.is_api_v2;
  return (
    <>
      <DrawerTriggerButton
        isDisabled={!newRiverCrossId && !riverId}
        ariaLabel="versions"
        description="Version History"
        icon={RdsHistory}
        showVersionToolbar={showVersionToolbar}
      />
      <DrawerTriggerButton
        isDisabled={!newRiverCrossId && !riverId}
        ariaLabel="activities"
        description="Activities"
        icon={MonitoringIcon}
      />
      <RenderGuard
        condition={
          ![riverType, selected_river_type].includes(RiverTypes.ACTION)
        }
      >
        <DrawerTriggerButton
          isDisabled={false}
          ariaLabel="variables"
          description="Variables"
          icon={VariablesIcon}
        />
      </RenderGuard>
      {isV2 && (
        <DrawerTriggerButton
          isDisabled={!newRiverCrossId && !riverId}
          ariaLabel="scheduler"
          description="Scheduling & Notifications"
          icon={RdsScheduleSettings}
        />
      )}
    </>
  );
}

const useRiverTypeIdentifier = () => {
  const isReactRoute = window.location.pathname.includes('rivers');
  const { isLogic } = useRiverType();
  const isLogicCreate = useIsInNewRiver();
  const isS2TCreate = useIsInNewS2TRiver();
  const type = useMemo(() => {
    if (!isReactRoute) return 'legacy';
    else if (!isS2TCreate && (isLogic || isLogicCreate)) return 'logic';
    else return 'reacts2t';
  }, [isLogic, isLogicCreate, isReactRoute, isS2TCreate]);

  return { type };
};

const RightBarActionsMap = {
  reacts2t: S2TReact,
  logic: Logic,
  legacy: Legacy,
};

export function Actions({
  createRiverForm,
  newRiverCrossId,
  sideBarTopPadding,
}) {
  const { type } = useRiverTypeIdentifier();
  const { version, river_drawer } = getQueryParams(['version', 'river_drawer']);
  const { versionDescription, currentVersion } = useVersionDetails(version);
  const showVersionToolbar = currentVersion && !river_drawer;
  const Component = RightBarActionsMap[type];
  return (
    <Flex
      onClick={e => e.stopPropagation()}
      overflow="hidden"
      flexDir="column"
      pt={sideBarTopPadding}
    >
      <Center
        height="60px"
        _hover={{ bg: 'background-secondary' }}
        sx={{
          '&:hover': {
            '& .chakra-button': { color: 'primary', bg: 'transparent' },
          },
        }}
      >
        <RiverActions />
      </Center>
      {showVersionToolbar ? (
        <PopConfirm
          mainBoxPosition={{ top: '25px', right: '52px' }}
          arrowPosition={{ top: '60px', right: '-8px' }}
        >
          <Flex borderRadius={4} flexDir="column" gap={4}>
            <Flex gap={2}>
              <Icon as={InfoTooltip} mt={1} />
              <Text>
                Do you want to restore version <br />
                <strong>'{versionDescription}'</strong>
              </Text>
            </Flex>
            <Center>
              <VersionToolbar />
            </Center>
          </Flex>
        </PopConfirm>
      ) : null}
      {newRiverCrossId ? (
        <Legacy
          showVersionToolbar={showVersionToolbar}
          newRiverCrossId={newRiverCrossId}
        />
      ) : (
        <Component
          showVersionToolbar={showVersionToolbar}
          newRiverCrossId={newRiverCrossId}
          createRiverForm={createRiverForm}
        />
      )}
    </Flex>
  );
}
function DrawerTriggerButton({
  ariaLabel,
  icon,
  description,
  showVersionToolbar = false,
  isFirstInList = false,
  ...props
}) {
  const setDrawer = useSetDrawer();
  const onCloseDrawer = useDismissDrawer(false);
  const { river_drawer } = getQueryParams(['river_drawer']);
  const { version } = useVersionController();
  const disableOnVersionView =
    Boolean(version) && ariaLabel !== DrawerType.VERSIONS;
  return (
    <Center
      py="9px"
      borderBottom="1px"
      borderBottomColor="gray.300"
      {...(isFirstInList && {
        borderTop: '1px',
        borderTopColor: 'gray.300',
      })}
      color="background-deselected"
      _hover={{ bg: 'gray.200' }}
      sx={{
        '&:hover': {
          '& .chakra-button': { color: 'background-deselected-hover' },
        },
      }}
      {...((showVersionToolbar || river_drawer === ariaLabel) && {
        bg: 'background-selected-weak',
        borderLeft: '2px',
        borderLeftColor: 'background-selected',
        sx: {
          '& .chakra-button': {
            color: 'background-selected',
            bg: 'background-selected-weak',
          },
        },
        _hover: { bg: 'background-selected-weak' },
      })}
    >
      <Tooltip
        shouldWrapChildren
        hasArrow
        label={<Text p={1}>{description}</Text>}
        bg="gray.200"
        color="font"
        fontWeight="normal"
        borderRadius={4}
        placement="left"
      >
        <TransparentIconButton
          aria-label={ariaLabel}
          icon={<Icon as={icon} boxSize="22px" />}
          onClick={() => {
            if (river_drawer === ariaLabel) {
              return onCloseDrawer();
            }
            setDrawer(ariaLabel);
          }}
          isRound
          w="0px!important"
          p="0!important"
          isDisabled={disableOnVersionView || props.isDisabled}
          pointerEvents="all"
        />
      </Tooltip>
    </Center>
  );
}

function RiverActions() {
  const history = useHistory();
  const { activeAccountId: account, envId: env } = useCore();
  const { selectedRiverName, riverDescription, isApiV2 } = useRiver();
  const selectedRiverCrossId = useRiverId();
  const isDraft = isRiverDraft(getOId(selectedRiverCrossId));
  const onDeleteRiver = () => {
    history.push(RoutesBuilder.rivers({ account, env }));
  };
  return (
    <RiverListActions
      riverName={selectedRiverName}
      crossId={selectedRiverCrossId}
      isApiV2={Boolean(isApiV2)}
      exclude={isDraft ? [RiverListActions.ActionList.COPY] : []}
      onDelete={onDeleteRiver}
      drawer
      riverDesc={riverDescription}
    />
  );
}
