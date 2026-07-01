import { BlockTypes } from 'api/types';
import clsx from 'clsx';
import {
  CloseIcon,
  ContainerSplitter,
  Flex,
  GridBox,
  HStack,
  Icon,
  keyframes,
  RiveryTable,
  StatusIsRunning,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
} from 'components';
import RiveryButton from 'components/Buttons/RiveryButton';
import { Tagger } from 'components/Tracking/Tagger';
import { ViewLogs } from 'components/ViewLogs/ViewLogs';
import React, { useState } from 'react';
import { MdPlayArrow } from 'react-icons/md';
import { useSortBy } from 'react-table';
import { ResultsStats } from './ResultsStats';
import {
  ScriptEditorContent,
  ScriptEditorContentProps,
} from './ScriptEditorContent';
import { useResults } from './useResults';

const enum ResultsTabs {
  RESULTS,
  COMPILED,
}
type EditorLayoutProps = ScriptEditorContentProps & {
  hash: string;
  resetError: boolean;
  onSave: () => any;
  onCancel: () => any;
  enableRun: boolean;
  value: string;
  onChange: (code: string) => any;
  readOnly: boolean;
  disableSave: boolean;
  isExecute?: boolean;
  type?: string;
};
/**
 * a code editor with panels and ability to execute code
 */
export function EditorLayout({
  hash,
  resetError,
  onSave,
  onCancel,
  enableRun,
  value,
  onChange,
  readOnly,
  disableSave,
  type = BlockTypes.SQL,
  ...props
}: EditorLayoutProps) {
  const {
    runResults,
    loading,
    errorMessage,
    pullRequestId,
    hasError,
    hasResults,
    compiled,
    results,
    rows,
    columns,
    limit,
  } = useResults(hash, { clearErrorDeps: resetError });

  const onRunResults = () => {
    runResults(value);
  };

  const [activeTab, setActiveTab] = useState<ResultsTabs>(ResultsTabs.RESULTS);
  return (
    <>
      <ContainerSplitter
        orientation="horizontal"
        overflow="hidden"
        height="100vh"
        shouldSplit={type.toLocaleLowerCase() !== BlockTypes.PYTHON}
      >
        <ScriptEditorContent
          {...props}
          value={value}
          readOnly={readOnly}
          onChange={onChange}
          ariaLabel="modal editor"
          path={`popup-${props.path}`}
          styleProps={{
            height:
              type.toLocaleLowerCase() === BlockTypes.PYTHON
                ? '100vh'
                : !enableRun
                ? '100% !important'
                : 'inherit',
            borderTop: '1px',
            borderTopColor: 'gray.400',
            textAlign: 'left',
          }}
        />
        {enableRun ? (
          <GridBox overflow="auto" gridTemplateColumns="1fr" h="full">
            <Tabs
              className="tabs-area"
              index={errorMessage ? ResultsTabs.COMPILED : activeTab}
              onChange={setActiveTab}
              overflow="hidden"
              display="grid"
              gridTemplateRows="min-content 1fr"
              gridTemplateColumns="auto"
            >
              <TabList px="3">
                <Tab py="2" isDisabled={!hasResults}>
                  Results
                </Tab>
                <Tab py="2" isDisabled={!Boolean(compiled)}>
                  Compiled SQL
                </Tab>
                <ResultsStats rows={rows} columns={columns} limit={limit} />
              </TabList>
              <TabPanels h="full" overflow="auto">
                <TabPanel flex="auto" overflow="auto" h="full" p="0">
                  {hasResults ? (
                    <RiveryTable
                      ariaLabel="query results list"
                      showFooter={false}
                      noPagination={true}
                      compact
                      columns={toColumnConfig(results[0])}
                      data={results}
                      inline
                      contentProps={{ m: 0 }}
                      useSortBy={useSortBy}
                    />
                  ) : (
                    <GridBox
                      h="full"
                      alignContent="center"
                      justifyContent="center"
                    >
                      {!loading && limit > 0
                        ? 'No results'
                        : 'Query results will appear here'}
                    </GridBox>
                  )}
                </TabPanel>
                <TabPanel
                  display="grid"
                  h="full"
                  flex="auto"
                  textAlign="left"
                  p={0}
                  pt={0}
                >
                  <ScriptEditorContent
                    {...props}
                    path={`popup-compiled-${props.path}`}
                    value={compiled}
                    ariaLabel="modal compiled query disabled"
                    styleProps={{
                      height: '100%',
                    }}
                    readOnly
                    // autoHeight
                  />
                </TabPanel>
              </TabPanels>
            </Tabs>
          </GridBox>
        ) : null}
      </ContainerSplitter>
      <GridBox
        gap={2}
        p={4}
        alignItems="center"
        borderTop="1px solid"
        borderTopColor="gray.300"
        className={clsx(!loading && hasError && 'results-controls-panel')}
      >
        {!loading && hasError ? (
          <>
            <Icon
              as={CloseIcon}
              boxSize="5"
              bgColor="background-danger-strong"
              color="white"
              borderRadius="full"
            />
            <Flex
              gap="1"
              alignItems="center"
              borderRight="1px solid"
              borderColor="border"
              pr={2}
            >
              <Text fontWeight="bold">Error:</Text>
              <Text noOfLines={1}>{errorMessage}</Text>
              <ViewLogs pullRequestId={pullRequestId} message={errorMessage} />
            </Flex>
          </>
        ) : null}
        <HStack justifyContent="flex-end" gap={4}>
          {loading ? (
            <Icon
              boxSize={6}
              as={StatusIsRunning}
              animation={`${spinAnimation} 2s linear infinite`}
            />
          ) : null}
          {enableRun ? (
            <Tagger tags="run-sql-results">
              <RiveryButton
                variant="outlined-primary"
                label="Run"
                onClick={onRunResults}
                size="small"
                disabled={loading}
                leftIcon={<MdPlayArrow size={16} />}
              />
            </Tagger>
          ) : null}
          <Tagger tags="cancel-sql-edit">
            <RiveryButton
              variant="default"
              label="Cancel"
              size="small"
              onClick={onCancel}
            />
          </Tagger>
          <Tagger tags="save-sql-edit">
            <RiveryButton
              variant="primary"
              size="small"
              label="Apply"
              disabled={disableSave}
              onClick={() => {
                onSave();
                onCancel();
              }}
            />
          </Tagger>
        </HStack>
      </GridBox>
    </>
  );
}

const toColumnConfig = (item: Record<string, any>) =>
  Object.keys(item).map(key => ({
    Header: key,
    accessor: key,
    sortBy: key,
    weight: 'minmax(max-content, auto)',
    styleProps: {
      px: 3,
      borderRight: '1px solid',
      borderRightColor: 'gray.300',
    },
    headerProps: {
      px: 3,
    },
  }));

export const spinAnimation = keyframes`
from {
  transform: rotate(0deg);
}
to {
  transform: rotate(360deg);
}
`;
