import { chakra, HStack } from '@chakra-ui/react';
import { Box, CloseIconButton, Flex, RiveryButton, Text } from 'components';
import { ModalVariablesEditor } from 'components/Form/ModalVariablesEditor';
import ActivitiesRiverView from 'containers/Activities/[id]';
import BlueprintCreation from 'containers/BluePrints/components/BlueprintCreation';
import { useGetBlueprint } from 'containers/BluePrints/helpers';
import { EditModeRiverPreferences } from 'containers/River/RiverSourceToTarget/Overview/RiverPreferences';
import { getQueryParams } from 'hooks/router';
import { DrawerDataframesEditorContent } from 'modules/DataFrames';
import { useIsDisabledRiverForm } from 'modules/SourceTarget';
import { EditModeScheduler } from 'modules/SourceTarget/components/Scheduler';
import { Versions } from 'modules/Versions/Versions';
import { useCallback } from 'react';
import { useFormContext } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { useRiver, useRiverActions } from 'store/river';
import { DrawerType } from './Actions';
import { RiverRightBar, useDismissDrawer } from './RiverRightBar';
import { useIsInNewS2TRiver } from './useShouldShowSidebar';

const Drawers = {
  [DrawerType.VERSIONS]: VersionsDrawer,
  [DrawerType.ACTIVITIES]: ActivitiesDrawer,
  [DrawerType.VARIABLES]: Variables,
  [DrawerType.DATAFRAMES]: Dataframes,
  [DrawerType.SCHEDULER]: SchedulerDrawer,
  [DrawerType.INFO]: RiverInfoDrawer,
  [DrawerType.YAML]: BlueprintYAML,
};

export default function DrawerComponent({ createRiverForm }) {
  const { river_drawer } = getQueryParams([RiverRightBar.DrawerParam]);
  const Component = Drawers?.[river_drawer];
  const isVersionMode = useIsDisabledRiverForm();

  return Component ? (
    <Component
      createRiverForm={createRiverForm}
      isVersionMode={isVersionMode}
    />
  ) : (
    <div />
  );
}

function DrawerWrap({ children, width = null, showFull = true }) {
  const onDeleteAllSearchParams = useDismissDrawer();
  return (
    <Flex bg="white" flexDir="column" w={width} h="full">
      {children}

      {showFull ? (
        <Flex
          h="50px"
          alignItems="center"
          pl={4}
          borderTop="1px"
          borderTopColor="gray.300"
          bg="white"
          borderRight="1px"
          borderRightColor="gray.300"
        >
          <RiveryButton
            size="small"
            label="Close"
            variant="default"
            onClick={onDeleteAllSearchParams}
            href="#"
          />
        </Flex>
      ) : null}
    </Flex>
  );
}

function Dataframes() {
  return (
    <DrawerWrap showFull={false}>
      <Flex
        flexDir="column"
        h="full"
        borderRight="1px"
        borderRightColor="gray.300"
      >
        <DrawerDataframesEditorContent />
      </Flex>
    </DrawerWrap>
  );
}

function Variables({ createRiverForm, isVersionMode }) {
  const { selectedVariables } = useRiver();
  const { setVariables: setOnRiver } = useRiverActions();
  const onVariablesChange = useCallback(
    variables => {
      createRiverForm?.setValue(
        'river',
        {
          ...createRiverForm?.watch('river'),
          properties: {
            ...createRiverForm?.watch('river.properties'),
            //There's no way to set a form dirty without actualy changing a value.
            //So I'm adding it here to make sure the form is dirty when the variables are changed.
            //It's being removed from the form upon Save
            variables: true,
          },
        },
        {
          shouldDirty: true,
        },
      );
      setOnRiver(variables);
    },
    [createRiverForm, setOnRiver],
  );
  return (
    <DrawerWrap showFull={false}>
      <Flex
        flexDir="column"
        h="full"
        borderRight="1px"
        borderRightColor="gray.300"
      >
        <chakra.fieldset disabled={isVersionMode} display="contents">
          <ModalVariablesEditor
            variables={selectedVariables}
            onChange={onVariablesChange}
            createFormApi={createRiverForm}
          />
        </chakra.fieldset>
      </Flex>
    </DrawerWrap>
  );
}

function ActivitiesDrawer() {
  return (
    <DrawerWrap width="calc(100vw - 250px)">
      <Box
        maxH={'calc(100vh - 50px)'}
        borderRight="1px"
        borderRightColor="gray.300"
      >
        <ActivitiesRiverView />
      </Box>
    </DrawerWrap>
  );
}

function VersionsDrawer() {
  const isLegacyView = !window.location.pathname.includes('rivers');
  const { selectedRiverVersionId } = useRiver();

  return (
    <Box borderRight="1px" borderRightColor="gray.300" h="full">
      <Versions versionId={selectedRiverVersionId} angular={isLegacyView} />
    </Box>
  );
}

function SchedulerDrawer({ isVersionMode }) {
  return (
    <DrawerWrap width="600px" showFull={false}>
      <Flex
        flexDir="column"
        borderRight="1px"
        borderRightColor="gray.300"
        h="full"
      >
        <chakra.fieldset disabled={isVersionMode} display="contents">
          <EditModeScheduler />
        </chakra.fieldset>
      </Flex>
    </DrawerWrap>
  );
}

function RiverInfoDrawer({ isVersionMode }) {
  return (
    <DrawerWrap width="350px" showFull={false}>
      <Flex
        flexDir="column"
        borderRight="1px"
        borderRightColor="gray.300"
        h="full"
      >
        <chakra.fieldset disabled={isVersionMode} display="contents">
          <EditModeRiverPreferences />
        </chakra.fieldset>
      </Flex>
    </DrawerWrap>
  );
}

function BlueprintYAML({ createRiverForm, isVersionMode }) {
  const createMode = useIsInNewS2TRiver();
  const formApi = useFormContext();
  const form = formApi ?? createRiverForm;
  const dismissDrawer = useDismissDrawer(false);
  const selectedBlueprint = form?.watch(
    'river.properties.source.additional_settings.recipe_id',
  );
  const { file, formApi: bpForm, loading } = useGetBlueprint(selectedBlueprint);
  return (
    <DrawerWrap width="calc(100vw - 350px)" showFull={false}>
      <Flex
        flexDir="column"
        borderRight="1px"
        borderRightColor="gray.300"
        height="full"
      >
        <chakra.fieldset disabled={isVersionMode} display="contents">
          <Flex h="full" flexDir="column" gap={1} pt={2}>
            <HStack
              px={4}
              justify="space-between"
              borderBottom="1px solid"
              borderBottomColor="gray.300"
            >
              <Text textStyle="M4">
                {createMode || !isVersionMode
                  ? 'Edit Blueprint'
                  : 'View Blueprint'}
              </Text>
              <CloseIconButton
                aria-label="close-toast"
                onClick={dismissDrawer}
                as={Link}
              />
            </HStack>
            <BlueprintCreation
              selectedBlueprint={selectedBlueprint}
              toggle={dismissDrawer}
              file={file}
              formApi={bpForm}
              loading={loading}
              s2t={!createMode && isVersionMode}
            />
          </Flex>
        </chakra.fieldset>
      </Flex>
    </DrawerWrap>
  );
}
