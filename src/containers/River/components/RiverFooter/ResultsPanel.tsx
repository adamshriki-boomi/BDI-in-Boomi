import { StatusTypes } from 'api/types';
import {
  EnvFeatureFlag,
  GridBox,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from 'components';
import RiveryButton, { CloseIconButton } from 'components/Buttons/RiveryButton';
import ResultsLogs from 'containers/River/RiverLogic/Logic/components/Logs/ResultsLogs';
import { QualityTestsLog } from 'modules/QualityTests/QualityTestForm';
import { useCallback, useState } from 'react';
import { useRiverRun } from 'store/river';

export function ResultsPanelButton({ onClick }) {
  const { details } = useRiverRun();
  const showButton = ['E', 'D', 'R'].includes(details?.river_run_status);
  const showV1Button = [
    StatusTypes.RUNNING,
    StatusTypes.SUCCEEDED,
    StatusTypes.FAILED,
  ].includes((details as any)?.status);
  return showButton || showV1Button ? (
    <RiveryButton
      ml={2}
      label="View Run Details"
      fontWeight="medium"
      onClick={onClick}
      variant="outlined-primary"
    />
  ) : null;
}

enum ResultsPanelTabs {
  LOGS,
  TESTS,
}

type DataKeys = 'tests' | 'logs';

export function ResultsPanel({ onClose }) {
  const [tab, setTab] = useState<ResultsPanelTabs>(ResultsPanelTabs.LOGS);
  const [downloadData, setDownloadData] = useState<Record<
    DataKeys,
    {
      content: any;
      fileName: string;
    }
  > | null>(null);

  const updateDownloadData = useCallback(
    (section, content, fileName) =>
      setDownloadData({ ...downloadData, [section]: { content, fileName } }),
    [downloadData],
  );

  const shouldRenderTestsLog = Boolean(
    import.meta.env?.['VITE_FEATURE_QUALITY_TESTS'] === 'true',
  );

  return (
    <GridBox
      bg="background-secondary"
      gridTemplateAreas="'tabs versions-toggle' 'content content'"
      gridTemplateRows="1fr"
      gridTemplateColumns="1fr max-content"
    >
      <Tabs
        index={tab}
        onChange={setTab}
        isLazy
        display="flex"
        flexDirection="column"
        overflow="auto"
      >
        <TabList px="4">
          <Tab aria-label="logs">Logs</Tab>
          <EnvFeatureFlag flag="QUALITY_TESTS">
            <Tab>Quality Tests</Tab>
          </EnvFeatureFlag>
          <CloseIconButton
            ml="auto"
            aria-label="close panel"
            onClick={onClose}
          />
        </TabList>
        <TabPanels overflow="auto">
          <TabPanel>
            <ResultsLogs />
          </TabPanel>
          {/* Can not use <EnvFeatureFlag/> component here since <Tab/> should be direct child of <Tabs/> */}
          {shouldRenderTestsLog ? (
            <TabPanel>
              <QualityTestsLog
                updateDownloadData={(content, fileName) =>
                  updateDownloadData('tests', content, fileName)
                }
              />
            </TabPanel>
          ) : null}
        </TabPanels>
      </Tabs>
      {/*Actions*/}
    </GridBox>
  );
}
