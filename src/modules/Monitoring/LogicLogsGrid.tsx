import {
  Drawer,
  DrawerContent,
  DrawerOverlay,
  useDisclosure,
} from '@chakra-ui/react';
import { ContainerRunningTypes } from 'api/types';
import { HStack, RiveryTable, Text } from 'components';
import { ResultsPanelInnerSpinner } from 'components/Loaders/Loader';
import HelpMeFixIt from 'components/FixItLink';
import { LogStatus } from 'components/RiveryTableCells/LogStatus';
import { AiFixDrawer } from 'containers/Activities/[id]/components/AiFix.drawer';
import { useTroubleshootDiagnose } from 'containers/Activities/[id]/components/useTroubleshootDiagnose';
import { useRiverId } from 'containers/Activities/helpers';
import { ErrorLogOverlay } from 'containers/Activities/[id]/RightContainer/ErrorLogOverlay';
import { useEffect, useMemo, useState } from 'react';
import { Column, useExpanded, useSortBy } from 'react-table';
import { ActivitiesTags } from 'utils/tracking.tags';
import { toErrorString } from 'utils/utils';
import { IStepResponse } from 'containers/River/RiverLogic/Logic/components/Logs/logs.query';
import {
  LogsTime,
  StepDuration,
  StepLog,
  StepName,
} from 'containers/River/RiverLogic/Logic/components/Logs/LogsGridCells';

interface IStepLog extends IStepResponse {
  step_name: string;
}

const sortCondition = (a, b) => {
  // First, compare by loop iteration number
  if (a.loop_iteration_number !== b.loop_iteration_number) {
    return a.loop_iteration_number - b.loop_iteration_number;
  }

  // Then compare by step index numerically
  const aIndexParts = a.step_index.split('.').map(Number);
  const bIndexParts = b.step_index.split('.').map(Number);

  // Compare each part of the step index
  for (let i = 0; i < Math.max(aIndexParts.length, bIndexParts.length); i++) {
    const aPart = aIndexParts[i] || 0;
    const bPart = bIndexParts[i] || 0;

    if (aPart !== bPart) {
      return aPart - bPart;
    }
  }

  return 0;
};

const getSubRows = ({ nodes }) => nodes;
const nestingCondition = (parentIndex, childIndex) => {
  childIndex.splice(-1);
  return parentIndex.join('.') === childIndex.join('.');
};
const createSubRows = (mainData, currentStep, containerIndex, nodes) => {
  for (let i = 0; i < mainData.length; i++) {
    const stepIndex = mainData[i].step_index.split('.');
    if (mainData[i].container || mainData[i].is_container) {
      const secondLevelSubrows = [];
      for (let j = 0; j < mainData.length; j++) {
        const innerStepIndex = mainData[j].step_index.split('.');
        if (
          nestingCondition(stepIndex, innerStepIndex) &&
          mainData[i].loop_iteration_number ===
            mainData[j].loop_iteration_number
        ) {
          secondLevelSubrows.push(mainData[j]);
          mainData[j].nested = true;
          mainData[j].expanded = true;
        }
      }
      mainData[i].nodes = secondLevelSubrows;
    }

    if (
      nestingCondition(containerIndex, stepIndex) &&
      currentStep.loop_iteration_number === mainData[i].loop_iteration_number
    ) {
      nodes.push(mainData[i]);
      mainData[i].nested = true;
      currentStep.expanded = true;
    }
  }
};

export default function LogsGrid({
  data,
  isLoading,
  runId = '',
  isActivitiesView = false,
}) {
  const [selectedRow, setSelectedRow] = useState<IStepLog>(null);
  const [mode, setMode] = useState<'tasks' | 'ai'>('tasks');
  const [logicDocsUrl, setLogicDocsUrl] = useState<string | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const riverId = useRiverId();
  const effectiveRunId =
    runId || selectedRow?.step_execution_id?.split(':')?.[0] || undefined;

  const {
    diagnoseContext,
    aiFixTitle,
    troubleshootData,
    isTroubleshootLoading,
    diagnoseError,
  } = useTroubleshootDiagnose({
    run: null,
    logItems: selectedRow
      ? [
          {
            task_status: selectedRow.step_status,
            error_description: selectedRow.error_description ?? null,
            source: '',
            target: '',
          },
        ]
      : null,
    runId: effectiveRunId,
    riverId,
    isAiFix: mode === 'ai',
    logHeader: selectedRow?.step_name ?? 'Step',
  });

  const stepsData = useMemo(() => {
    if (Boolean(data?.length) || (data && Boolean(Object.keys(data)?.length))) {
      const flatData = (Object.entries(data) as Record<string, any>)
        .map(([name, step]) => ({
          ...step,
          step_name: name.replace(/ *\([^)]*\) */g, ''),
        }))
        .sort((a, b) => {
          if (isActivitiesView) {
            // Sort by timestamp first, then by step_index if timestamps are equal
            const timeDiff =
              a.start_date_in_milliseconds - b.start_date_in_milliseconds;
            return timeDiff !== 0 ? timeDiff : sortCondition(a, b);
          }
          return sortCondition(a, b);
        });

      return flatData
        .map(step => {
          if (step.container || step.is_container) {
            const nodes = [];
            const container_index = step.step_index.split('.');
            createSubRows(flatData, step, container_index, nodes);
            return { ...step, nodes };
          } else {
            return step;
          }
        })
        .filter(({ nested }) => !nested);
    }

    return [];
  }, [data, isActivitiesView]);

  useEffect(
    () => (Boolean(selectedRow) ? onOpen() : onClose()),
    [onClose, onOpen, selectedRow],
  );

  useEffect(() => {
    if (!isOpen) {
      setSelectedRow(null);
      setMode('tasks');
      setLogicDocsUrl(null);
    }
  }, [isOpen]);

  const columnsWithAiClick = useMemo(
    () =>
      baseColumns.map(col =>
        col.id === 'fix-it'
          ? {
              ...col,
              Cell: ({ row }) => (
                <HelpMeFixIt
                  errorMessage={row.original.error_description}
                  status={row.original.step_status}
                  onAiClick={docsUrl => {
                    setSelectedRow(row.original);
                    setMode('ai');
                    setLogicDocsUrl(docsUrl ?? null);
                  }}
                />
              ),
            }
          : col,
      ),
    [],
  );

  return (
    <>
      <RiveryTable
        entityType="Logs"
        ariaLabel="logs list"
        compact
        inline
        getSubRows={getSubRows}
        useExpanded={useExpanded}
        noPagination
        loader={isLoading ? <ResultsPanelInnerSpinner /> : null}
        columns={columnsWithAiClick}
        data={stepsData}
        useSortBy={useSortBy}
        rowHandlers={{
          onRowClick: row => {
            setSelectedRow(row);
            setMode('tasks');
          },
          isRowSelected: ({ step_execution_id }) =>
            selectedRow?.step_execution_id === step_execution_id,
        }}
      />
      <Drawer
        size="default"
        isOpen={isOpen}
        placement="right"
        onClose={onClose}
      >
        <DrawerOverlay />
        <DrawerContent
          data-pendo-id={ActivitiesTags.OPEN_INNER_RUN_DRAWER_LOGIC}
        >
          {mode === 'ai' ? (
            <AiFixDrawer
              onBack={() => setMode('tasks')}
              aiFixTitle={aiFixTitle}
              showSpinner={false}
              errorDescription={toErrorString(
                diagnoseContext?.error_description,
              )}
              isTroubleshootLoading={isTroubleshootLoading}
              troubleshootData={
                (troubleshootData ?? {}) as {
                  formatted_report?: string | null;
                }
              }
              documentationUrl={logicDocsUrl}
              diagnoseError={diagnoseError}
            />
          ) : (
            <StepLog
              row={selectedRow}
              setSelectedRow={setSelectedRow}
              runId={runId}
              onAiClick={docsUrl => {
                setMode('ai');
                setLogicDocsUrl(docsUrl ?? null);
              }}
            />
          )}
        </DrawerContent>
      </Drawer>
    </>
  );
}

const commonStyle = {
  headerProps: { px: 3 },
  styleProps: { px: 3, cursor: 'pointer' },
};

const baseColumns: Column[] = [
  {
    Header: 'Status',
    accessor: 'step_status',
    Cell: LogStatus,
    weight: 'min-content',
    ...commonStyle,
  },
  {
    Header: 'Step',
    accessor: 'step_name',
    Cell: StepName,
    weight: 'minmax(200px, 1fr)',
    sortBy: 'step_name',
    ...commonStyle,
  },
  {
    Header: 'Time',
    accessor: row => {
      if ('start_time' in row) {
        return row.start_time;
      }
      return row.start_date_in_milliseconds;
    },
    Cell: ({ value }) => <LogsTime value={value} />,
    weight: 'minmax(150px, 1fr)',
    sortBy: 'test_run_time',
    ...commonStyle,
  },
  {
    Header: 'Container',
    Cell: ({
      value,
      row: {
        original: { loop_iteration_number },
      },
    }) => (
      <HStack>
        <Text>{ContainerTypes[value]}</Text>
        {value && value === 'loop_over' ? (
          <Text {...{ ml: '0.2rem!important' }}>
            ({loop_iteration_number + 1})
          </Text>
        ) : null}
      </HStack>
    ),
    accessor: 'container_type',
    weight: 'minmax(130px, 1fr)',
    ...commonStyle,
  },
  {
    Header: 'Duration',
    accessor: row => {
      if ('duration' in row) {
        return row.duration;
      }
      return row.step_duration;
    },
    Cell: StepDuration,
    weight: 'max(130px)',
    ...commonStyle,
  },
  {
    Header: 'Warning/Error',
    accessor: 'error_description',
    Cell: ErrorLogOverlay,
    weight: 'max(150px)',
    ...commonStyle,
  },
  {
    Header: '',
    id: 'fix-it',
    Cell: ({ row }) => (
      <HelpMeFixIt
        errorMessage={row.original.error_description}
        status={row.original.step_status}
      />
    ),
    weight: 'min-content',
    ...commonStyle,
  },
];

const ContainerTypes = {
  [ContainerRunningTypes.LOOP_OVER]: 'Loop',
  [ContainerRunningTypes.RUN_ONCE]: 'Run Once',
  [ContainerRunningTypes.CONDITION]: 'Condition',
};
