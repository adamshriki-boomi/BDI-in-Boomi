import { TagLabel, TagLeftIcon } from '@chakra-ui/react';
import { Storage } from 'api/storage';
import {
  Box,
  CloseBgSolid,
  GridBox,
  HStack,
  Image,
  PageOverlaySpinner,
  RiveryTabs,
  Tag,
} from 'components';
import SvgRdsStreaming from 'components/Icons/components/RdsStreaming';
import StreamingGif from 'components/Icons/icons/streaming_white.gif';
import { useRiverId } from 'containers/Activities/helpers';
import { ErrorBoundaryRivers, PageNotFound } from 'modules';
import { SidebarShell } from 'modules/RiverRightBar';
import {
  IRiverStatus,
  IRiverV1,
  SchemaEditor,
  SelectDataTarget,
  SetupDataSource,
  transformResponseToKeyValue,
  useGetRiverCommonProps,
  useGetRiverQuery,
  useIsneedReactivate,
} from 'modules/SourceTarget';
import { useVersionDetailsV1 } from 'modules/Versions/hooks/useVersionDetails';
import { useCallback, useEffect, useMemo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { MainRiverFormProvider } from 'hooks/useMainRiverFormContext';
import { useLocation, useToggle } from 'react-use';
import { useCore } from 'store/core';
import { useGroupsLoader } from 'store/groups';
import { EditModePromptModal } from '../new/source-to-target/components/QuitConfirmationModal';
import { RiverForm } from '../new/source-to-target/form.hooks';
import {
  isValidForCDCRiver,
  normalizeCronTo5Fields,
} from '../Settings/components/ScheduleEditor';
import ReactivationConfirmation from './components/RiverActivation/components/ReactivationConfirmation';
import { RiverBreadcrumbs } from './components/RiverBreadcrumbs';
import { RiverFooter } from './components/RiverFooter';
import { RiverConnections, RiverTitle } from './components/RiverTitle';
import { Overview } from './Overview';

const useGroups = () => {
  const { envId } = useCore();
  useGroupsLoader(envId);
};

export default function SourceToTargetGuard() {
  // TODO note - this is required for the e2e that loads BETA_STT route
  // since the tests renders this component without going through River.tsx
  // THIS should be removed once STT is released
  useGroups();
  const riverId = useRiverId();
  const { data, isFetching, isError } = useGetRiverQuery(riverId, {
    skip: !Boolean(riverId),
  });
  const versionedRiver = useVersionDetailsV1({ riverId });
  const isRiverActive = data?.metadata?.river_status === IRiverStatus.ACTIVE;
  const isInVersionMode = Boolean(versionedRiver?.version_id);
  return (
    <SourceToTargetEditor
      river={
        isInVersionMode
          ? transformResponseToKeyValue(versionedRiver.river as any)
          : data
      }
      isInVersionMode={isInVersionMode}
      isRiverActive={isRiverActive}
      isFetching={isFetching}
      isError={isError}
    />
  );
}

const useUpdateRiverWhenChanged = (river: IRiverV1, reset) => {
  const lastUpdatedAt = river?.metadata.last_updated_at;
  useEffect(() => {
    if (lastUpdatedAt) {
      reset({ river }, { keepDirty: false });
    }
  }, [lastUpdatedAt, reset, river]);
};

const useIdentifyRiverEdit = form => {
  const river = form?.watch('river');
  const isRiverActive = river?.metadata?.river_status === IRiverStatus.ACTIVE;
  const [reActivate, toggleReActivate] = useToggle(false);
  const [isTouched, toggleIsTouched] = useToggle(false);
  const shouldReactivate = useIsneedReactivate(form);
  useEffect(() => {
    if (shouldReactivate) {
      if (isRiverActive && !isTouched && !reActivate) {
        if (Storage.getData(Storage.Keys.ACTIVE_RIVER_DISCLAIMER)) {
          toggleReActivate(true);
          return;
        }

        toggleIsTouched(shouldReactivate);
      }
    }
  }, [
    isRiverActive,
    isTouched,
    reActivate,
    shouldReactivate,
    toggleIsTouched,
    toggleReActivate,
  ]);

  return {
    isTouched,
    toggleIsTouched,
    reActivate,
    toggleReActivate,
  };
};
interface SourceToTargetEditorProps {
  river: IRiverV1;
  blueprint?: Record<string, any>;
  isInVersionMode?: boolean;
  isRiverActive?: boolean;
  isFetching?: boolean;
  isError?: boolean;
}
function SourceToTargetEditor({
  river,
  isInVersionMode = false,
  isRiverActive = false,
  isFetching = false,
  isError = false,
}: SourceToTargetEditorProps) {
  const riverType = river?.type;
  const formMethods = useForm<RiverForm>({
    mode: 'onChange',
    defaultValues: {
      river,
    },
  });

  const { state } = useLocation();
  const { isTouched, toggleIsTouched, reActivate, toggleReActivate } =
    useIdentifyRiverEdit(formMethods);
  useUpdateRiverWhenChanged(river, formMethods.reset);
  const errorKeys = useMemo(
    () =>
      formMethods?.formState?.errors?.river?.properties &&
      Object.keys(formMethods?.formState?.errors?.river?.properties),
    [formMethods?.formState?.errors?.river?.properties],
  );
  const sttTabs = useMemo(
    () => {
      return tabs(reActivate).map(tab => ({
        ...tab,
        ...(formMethods?.formState?.errors?.river?.properties[tab.route] && {
          icon: CloseBgSolid,
        }),
      }));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [errorKeys?.length, reActivate],
  );
  const scheduler = formMethods?.watch('river.schedulers');
  const cron = scheduler?.[0]?.cron_expression;
  const isEnabled = scheduler?.[0]?.is_enabled;
  useEffect(() => {
    if (
      cron &&
      isEnabled &&
      isValidForCDCRiver(normalizeCronTo5Fields(cron)) &&
      Boolean(errorKeys?.length)
    ) {
      (formMethods as any).clearErrors('river.properties.summary');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cron, isEnabled]);
  const name = river?.name?.substring(0, 15).concat('...');

  const hideDisclaimer = useCallback(() => {
    Storage.store(Storage.Keys.ACTIVE_RIVER_DISCLAIMER, true);
  }, []);
  const [running, toggleRunning] = useToggle(false);
  return (
    <ErrorBoundaryRivers>
      {!formMethods?.watch('river') && !isError ? (
        <PageOverlaySpinner />
      ) : isError ? (
        <PageNotFound />
      ) : (
        <MainRiverFormProvider value={formMethods}>
          <FormProvider {...formMethods}>
            {isFetching && <PageOverlaySpinner />}
            <SidebarShell
              gridTemplateAreas={`
        'top ${SidebarShell.sidebarGridArea}'
        'tabs ${SidebarShell.sidebarGridArea}'
        'footer ${SidebarShell.sidebarGridArea}'
        `}
              gridTemplateRows="auto 1fr auto"
              m="0"
              position="relative"
              sideBarTopPadding="100px"
              formApi={formMethods}
            >
              <GridBox
                gridArea="top"
                gap="5"
                py="4"
                px="6"
                bg={isInVersionMode ? 'gray.200' : 'background-secondary'}
              >
                <RiverBreadcrumbs riverName={name} />
                <RiverConnections riverType={riverType} />
                {/* If the user is in the middle of editing a river, the user will
              be prompted to confirm the changes before reactivating the river */}
                <RiverTitle
                  switchDisabled={running || reActivate || state?.runRiver}
                />
              </GridBox>
              <RiveryTabs
                items={sttTabs}
                route="tab"
                queryParam
                gridProps={{
                  display: 'flex',
                  overflow: 'hidden',
                  flexDirection: 'column',
                  height: 'full',
                  gridArea: 'tabs',
                }}
                tabProps={{
                  pb: '2',
                  sx: {
                    svg: {
                      color: 'red.200!important',
                    },
                  },
                }}
                tabListProps={{
                  borderBottom: '1px',
                  pl: '225px',
                  pt: 3,
                  bg: isInVersionMode ? 'gray.200' : 'background-secondary',
                  alignItems: 'center',
                  children: isRiverActive ? (
                    <ActiveIndicator isActive={isRiverActive} />
                  ) : null,
                }}
                tabPanelsProps={{
                  overflow: 'hidden',
                  height: 'full',
                  'aria-disabled': isInVersionMode,
                }}
              />
              <RiverFooter
                running={running}
                toggleRunning={toggleRunning}
                reActivate={reActivate}
                dismissReactivation={() => {
                  toggleReActivate(false);
                  toggleIsTouched(false);
                }}
              />
            </SidebarShell>
            <EditModePromptModal />
            <ReactivationConfirmation
              show={isTouched}
              onCancel={() => {
                formMethods.reset({ river });
                toggleIsTouched(false);
                toggleReActivate(false);
              }}
              onConfirm={() => {
                toggleReActivate(true);
                toggleIsTouched(false);
              }}
              onDontShowAgain={hideDisclaimer}
            />
          </FormProvider>
        </MainRiverFormProvider>
      )}
    </ErrorBoundaryRivers>
  );
}

function ActiveIndicator({ isActive }) {
  const { isCDC } = useGetRiverCommonProps();
  return (
    <HStack ml="auto" px={6}>
      <Tag
        display={isCDC ? 'flex' : 'none'}
        size="sm"
        borderRadius="999px"
        h="28px"
        w="100px"
        {...(isActive
          ? {
              variant: 'blue',
            }
          : { bg: 'background-disabled', color: 'font' })}
      >
        {isActive ? (
          <Box mr={1}>
            <Image height={3} width={4} src={StreamingGif} alt="streaming" />
          </Box>
        ) : (
          <TagLeftIcon
            as={SvgRdsStreaming}
            boxSize={4}
            marginInlineEnd="0.2rem"
          />
        )}
        <TagLabel textTransform="capitalize">Streaming</TagLabel>
      </Tag>
    </HStack>
  );
}

const tabPanelProps = {
  height: 'full',
  display: 'flex',
  w: 'full',
  // overflow: 'auto',
  py: 4,
  px: 6,
};
const tabs = reactivate =>
  [
    {
      title: 'Summary',
      route: 'summary',
      component: Overview,
    },
    {
      title: 'Source',
      route: 'source',
      component: () => <SetupDataSource reactivate={reactivate} />,
    },
    {
      title: 'Target',
      route: 'target',
      component: SelectDataTarget,
    },
    {
      title: 'Schema',
      route: 'schemas',
      component: SchemaEditor,
    },
    // {
    //   title: 'Sub-Rivers',
    //   route: 'subrivers',
    //   component: () => <Text fontSize="3xl">🦦 subrivers</Text>,
    // },
  ].map(tab => ({
    ...tab,
    tabPanelProps: {
      ...tabPanelProps,
      'aria-disabled': ['source', 'target', 'summary'].includes(tab.route),
      className: `source-to-target-river-tab-${tab.route}`,
      ...(tab.route === 'summary' && { overflow: 'auto' }),
    },
  }));
