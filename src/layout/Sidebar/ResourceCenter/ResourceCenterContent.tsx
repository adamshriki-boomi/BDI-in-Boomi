import { Flex, Grid, Slide } from 'components';
import { LevelUpContent } from 'containers/Onboarding/components/LevelBox';
import { ONBOARDING_STEPS } from 'containers/Onboarding/components/Steps/StepsStaticContent';
import { useContactSales } from 'hooks/useContactSales';
import React, { useCallback, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useCore } from 'store/core';
import { ContentToggleButtons } from './components/ContentToggleButtons';
import { DemoVideos, videos, VideoThumbnails } from './components/DemoVideos';
import { DrawerFooter } from './components/DrawerFooter';
import { Header } from './components/DrawerHeader';
import {
  ExternalLinks,
  LearnMoreLinks,
  UpdatesLinks,
} from './components/ExternalLink';
import { ResourceCenterKitsContent } from './components/KitsLevelContent';
import { ResourceCenterSqlContent } from './components/SqlLevelContent';
import { GettingStarted } from './GettingStarted';
import { LikeAPro } from './LikeAPro';

enum ContentType {
  LEVEL = 'level',
  STEP = 'step',
  VIDEOS = 'videos',
  DEF = 'default',
}

function useResourceCenterState() {
  const [componentState, setComponentState] = useState<any>({
    levelUpContent: null,
    stepContent: null,
    videosContent: false,
    contentType: ContentType.DEF,
  });

  const handlers = React.useMemo(
    () => ({
      setLevelContent: levelUpContent => {
        setComponentState(() => ({
          levelUpContent,
          contentType: ContentType.LEVEL,
        }));
      },
      setStepContent: (stepContent, stepIndex) => {
        setComponentState(() => ({
          stepContent: { stepContent, stepIndex },
          contentType: ContentType.STEP,
        }));
      },
      setVideosContent: show => {
        setComponentState(() => ({
          videosContent: show,
          contentType: ContentType.VIDEOS,
        }));
      },
      emptyState: () => {
        setComponentState({
          contentType: ContentType.DEF,
        });
      },
    }),
    [],
  );

  return [componentState, handlers];
}

const ResourceCenterRenderer = {
  [ContentType.DEF]: DefaultResourceCenterContent,
  [ContentType.LEVEL]: LevelUpContent,
  [ContentType.STEP]: StepContentWrapper,
  [ContentType.VIDEOS]: DemoVideos,
};

export function ResourceCenterContent({ setDrawer }) {
  const { push, location } = useHistory();
  const [state, actions] = useResourceCenterState();
  const dismissDrawer = useCallback(() => {
    push({
      pathname: location.pathname,
      state: null,
    });
    setDrawer(null);
  }, [location.pathname, push, setDrawer]);
  const isDefaultView = state.contentType === ContentType.DEF;
  const Component = ResourceCenterRenderer[state.contentType];

  return (
    <Flex flexDir="column" h="calc(100vh - 60px)">
      {isDefaultView ? (
        <Header dismissDrawer={dismissDrawer} />
      ) : (
        <ContentToggleButtons
          hideContent={actions.emptyState}
          dismissDrawer={setDrawer}
        />
      )}
      <Component
        resourceCenter
        dismissDrawer={dismissDrawer}
        {...actions}
        {...state}
      />
      <DrawerFooter
        setDrawer={setDrawer}
        levelUpContent={state.levelUpContent}
        stepContent={state.stepContent}
      />
    </Flex>
  );
}

function DefaultResourceCenterContent({
  dismissDrawer,
  setLevelContent,
  setStepContent,
  setVideosContent,
  contentType,
}) {
  const { isAdminRole, isDeveloperRole, isSuperAdminUser } = useCore();
  const showGettingStarted = isAdminRole || isDeveloperRole || isSuperAdminUser;
  return (
    <Slide
      in={contentType === ContentType.DEF}
      direction="left"
      style={{ height: '100%', position: 'relative', overflow: 'auto' }}
    >
      <Flex
        pb={2}
        flex={6}
        gap={4}
        px={6}
        pr={4}
        flexDir="column"
        overflow="auto"
        sx={{
          '&::-webkit-scrollbar': {
            w: 2,
          },
        }}
      >
        <VideoThumbnails
          thumbnails={videos.slice(0, 3)}
          setVideosContent={setVideosContent}
        />
        {showGettingStarted ? (
          <GettingStarted dismissDrawer={dismissDrawer} />
        ) : null}
        <LikeAPro
          setLevelContent={setLevelContent}
          setStepContent={setStepContent}
        />

        <QuickLinks />
      </Flex>
    </Slide>
  );
}

function StepContentWrapper({ stepContent, dismissDrawer }) {
  return (
    <Slide
      in
      direction="right"
      style={{ height: '100%', position: 'relative' }}
    >
      {stepContent.stepIndex === ONBOARDING_STEPS.STEP_4.id ? (
        <ResourceCenterSqlContent
          stepData={stepContent.stepContent}
          dismissDrawer={dismissDrawer}
        />
      ) : (
        <ResourceCenterKitsContent />
      )}
    </Slide>
  );
}

function QuickLinks() {
  const { isAccountInTrial } = useCore();
  const scheduleMeeting = useContactSales();
  return (
    <Grid templateColumns="repeat(2, 1fr)" w="80%" px={1}>
      <ExternalLinks title="Learn More" links={LearnMoreLinks} />

      <ExternalLinks
        title="Quick Links"
        links={UpdatesLinks(scheduleMeeting, isAccountInTrial)}
      />
    </Grid>
  );
}
