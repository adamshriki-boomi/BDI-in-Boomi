import { RoutesBuilder, useAccountRoute } from 'app/routes';
import {
  Breadcrumbs,
  ContainerSplitter,
  EditableText,
  EnvFeatureFlag,
  Flex,
  GridBox,
  HStack,
  RiveryTabs,
} from 'components';
import { PageOverlaySpinner } from 'components/Loaders/Loader';
import { DataSourceIcon } from 'containers/Activities/components/ActivitiesColumns';
import {
  ErrorBoundaryRivers,
  QualityTestRiverButton,
  RiverFailCheck,
  VersionsToggle,
} from 'modules';
import { SidebarShell } from 'modules/RiverRightBar';
import React, { useMemo } from 'react';
import { Route, useRouteMatch } from 'react-router-dom';
import { useToggle } from 'react-use';
import { useRiver, useRiverActions } from 'store/river';
import { getId } from 'utils/api.sanitizer';
import { useEditorCompletions } from '../hooks/useEditorCompletions';
import { CloseRiver } from './CloseRiver';
import { Groups } from './Groups/Groups';
import { RiverFooter } from './RiverFooter';
import { ResultsPanel } from './RiverFooter/ResultsPanel';
import { useIsRiverLoading } from './useIsRiverLoading';

export type RiverBoxProps = {
  routes?: any[];
};

export default function RiverBox({ routes }: RiverBoxProps) {
  const { updateRiverDefinitions } = useRiverActions();
  const { definitions, selectedRiverName } = useRiver();
  useEditorCompletions(selectedRiverName);
  const [split, toggleSplit] = useToggle(false);

  const displayLoader = useIsRiverLoading();

  return (
    <ErrorBoundaryRivers>
      <RiverFailCheck />
      <SidebarShell gridTemplateRows="1fr auto">
        <ContainerSplitter
          orientation="horizontal"
          shouldSplit={split}
          overflow="hidden"
          firstChildProps={{ size: 600 }}
          secondChildProps={{ size: 300 }}
        >
          <GridBox
            overflow="hidden"
            bgColor="white"
            pl="4"
            gridTemplateRows={null}
            height="full"
            gridTemplateAreas="'content'"
          >
            {displayLoader ? (
              <PageOverlaySpinner />
            ) : (
              <>
                <Flex
                  flexDir="column"
                  gridArea="content"
                  overflow="auto"
                  h="full"
                >
                  <Flex flexDir="column" pr={4} pt={4}>
                    <RiverBreadcrumbs riverName={selectedRiverName} />
                    <Flex flexDir="column">
                      <HStack justifyContent="space-between">
                        <HStack>
                          <DataSourceIcon
                            type={definitions.river_type}
                            boxWidth={14}
                          />
                          <EditableText
                            text={selectedRiverName}
                            onChange={river_name =>
                              updateRiverDefinitions({ river_name })
                            }
                            iconColor="black"
                          />
                        </HStack>
                        <CloseRiver />
                      </HStack>
                      <HStack gap={2} pl={2} pb={2} height={8}>
                        <Groups groupId={getId(definitions?.group_id)} />
                        <VersionsToggle.DateToggle
                          date={definitions?.river_date_updated}
                        />
                      </HStack>
                    </Flex>
                  </Flex>
                  <RiverTabsRenderer routes={routes} />
                </Flex>
              </>
            )}
          </GridBox>
          {split ? <ResultsPanel onClose={toggleSplit} /> : null}
        </ContainerSplitter>
        {!displayLoader ? (
          <RiverFooter onView={toggleSplit} showPanel={split} />
        ) : null}
      </SidebarShell>
    </ErrorBoundaryRivers>
  );
}

function RiverTabsRenderer({ routes }) {
  const { path, url } = useRouteMatch();
  const { isVersionMode } = useRiver();

  return (
    <Route path={`${path}/:section?`}>
      <RiveryTabs
        items={routes}
        route={url}
        gridProps={{
          gridTemplateAreas: "'tabs versions-toggle' 'content content'",
          gridTemplateRows: '1fr',
          gridTemplateColumns: '1fr max-content',
        }}
        contentStyle={{
          h: '100%',
          bg: isVersionMode ? 'gray.200' : null,
        }}
      >
        <HStack gap={4}>
          <EnvFeatureFlag flag="QUALITY_TESTS">
            <QualityTestRiverButton />
          </EnvFeatureFlag>
        </HStack>
      </RiveryTabs>
    </Route>
  );
}

function RiverBreadcrumbs({ riverName }) {
  const riversUrl = useAccountRoute(RoutesBuilder.rivers);
  const breadcrumbs = useMemo(
    () => [
      { label: 'Data Flows' },
      { label: 'Data Flows List', href: riversUrl },
      { label: riverName },
    ],
    [riversUrl, riverName],
  );
  return <Breadcrumbs links={breadcrumbs} />;
}
