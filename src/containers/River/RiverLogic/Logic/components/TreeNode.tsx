import { Box, BoxProps } from '@chakra-ui/react';
import { useDraggable } from '@dnd-kit/core';
import {
  BlockTypes,
  ILogicStep,
  RunStatusConverter,
  SourceType,
  StatusTypes,
} from 'api/types';
import { useIsNewCheckRunActive } from 'components';
import {
  IRiverActivityRun,
  useGetLogicRunStepsQuery,
} from 'containers/Activities';
import { useIsInsideRiver } from 'modules/RiverRightBar';
import { StepError } from 'modules/RiverValidation';
import React, { useMemo } from 'react';
import { useInterval, useToggle } from 'react-use';
import { useRiverActions, useRiverRun } from 'store/river';
import { NodeType } from 'store/river/river.types';
import { getHashKey } from 'utils/api.sanitizer';
import { compare } from 'utils/array.utils';
import { LogicContainer } from './Container/LogicContainer';
import { getSqlTitle, isExecute } from './hooks/useSqlEditorProps';
import { LogicStep } from './LogicStep';
import { IStepResponse } from './Logs/logs.query';
import { NodeHeader } from './NodeHeader';
import { ScriptEditorModalRenderer } from './ScriptEditor';

export interface TreeNodeProps {
  node: ILogicStep;
  dragHandlers?: any;
  boxProps?: BoxProps;
  className?: string;
  collapsed?: boolean;
  moveHandler?: Function;
  depth: number;
  index: string;
  isDisabled?: boolean;
  label?: string;
  stepsLength?: number;
}

export const stepMaxWidth = '710px';

export function TreeNode({
  node,
  boxProps = null,
  className = null,
  dragHandlers,
  moveHandler,
  collapsed,
  depth,
  index,
  isDisabled = false,
  label = null,
  stepsLength,
}: TreeNodeProps) {
  const { setStepProps, removeStep } = useRiverActions();
  const { stepsStatus, hasDetails, details } = useRiverRun();
  const [nodeOpened, toggleNode] = useToggle(!collapsed);
  const stepName = node.step_name;
  const isStep = node?.content;
  const blockPrimaryType = node?.content?.block_primary_type;
  const isEnabled = node?.isEnabled;
  const updateStepProps = (props: Partial<ILogicStep>) => {
    setStepProps({
      hash: getHashKey(node),
      ...props,
    });
  };
  const onIsEnabledChanges = val => {
    updateStepProps({
      isEnabled: val.target.checked,
    });
  };
  const handleOnNameChange = (value: string) => {
    updateStepProps({
      step_name: value,
    });
  };
  const handleOnDisableErrorsChange = (value: boolean) => {
    updateStepProps({
      disable_errors: value,
    });
  };

  const handleOnDelete = () => {
    removeStep(getHashKey(node));
  };

  const riverId = useIsInsideRiver();
  const {
    data: steps,
    isLoading,
    isFetching,
    refetch,
  } = useGetLogicRunStepsQuery(
    {
      riverId,
      runId: details?.run_id,
    },
    { skip: !details?.run_id },
  );
  const loading = isLoading || isFetching;

  const useNewCheckRun = useIsNewCheckRunActive();

  useInterval(async () => {
    if (hasDetails && useNewCheckRun) {
      if (
        (details as IRiverActivityRun)?.status === StatusTypes.RUNNING &&
        !loading
      ) {
        await refetch();
      }
    }
  }, 3000);

  const indexId = `${index}`;

  const stepStatus = useNewCheckRun
    ? steps
      ? (Object.values(steps) as IStepResponse[])?.find(
          compare('step_id', node.step_id),
        )
      : ({} as IStepResponse)
    : stepsStatus?.[indexId];
  const dbIconClickable = node?.content?.source_type !== SourceType.DATAFRAME;
  const IconWrapper =
    dbIconClickable && blockTypeIconWrapper?.[blockPrimaryType];
  return (
    <Box className={className} {...boxProps} aria-label={label}>
      <StepError hash={getHashKey(node)} type={isStep ? 'step' : 'container'} />
      <NodeHeader
        text={stepName}
        stepId={getHashKey(node)}
        errorsDisabled={node?.disable_errors}
        onCollapse={toggleNode}
        onNameChange={handleOnNameChange}
        onDelete={handleOnDelete}
        onDisableErrors={handleOnDisableErrorsChange}
        open={nodeOpened}
        isEnabled={isEnabled}
        errorMessage={stepStatus?.error_description}
        isDisabled={isDisabled || !isEnabled}
        onIsEnabledChanges={onIsEnabledChanges}
        type={isStep ? NodeType.STEP : NodeType.CONTAINER}
        icon={isStep ? blockPrimaryType : 'container'}
        status={retrieveStepRunStatus(useNewCheckRun, stepStatus)}
        dragHandlers={dragHandlers}
        iconWrapper={
          IconWrapper && (
            <IconWrapper
              node={node}
              title={`${getSqlTitle(isExecute(node))} - ${stepName}`}
            />
          )
        }
        index={index}
        stepsLength={stepsLength}
      />
      {nodeOpened && (
        <Box
          border="1px"
          borderTop={0}
          borderBottomRadius={2}
          borderColor="gray.200"
          shadow="md"
        >
          {isStep ? (
            <LogicStep node={node} depth={depth} />
          ) : (
            <LogicContainer
              node={node}
              isDraggable={Boolean(dragHandlers)}
              moveHandler={moveHandler}
              key={`container-node-${getHashKey(node)}`}
              depth={depth}
              index={index}
            />
          )}
        </Box>
      )}
    </Box>
  );
}

function retrieveStepRunStatus(isNewCheckRun, stepStatus) {
  return isNewCheckRun
    ? RunStatusConverter[stepStatus?.step_status]
    : (stepStatus as any)?.status;
}

const blockTypeIconWrapper = {
  [BlockTypes.SQL]: ScriptEditorModalRenderer,
};
export function DraggableTreeNode({
  node,
  depth,
  index,
  isDisabled = false,
  stepsLength,
}: TreeNodeProps) {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: `${getHashKey(node)}.before`,
  });
  const parallelContainer =
    node.isParallel && node.container_running !== 'condition';

  const nodeElement = useMemo(() => {
    return (
      <TreeNode
        label={`${node.step_name} content`}
        node={node}
        dragHandlers={listeners}
        boxProps={{ w: 'full' }}
        depth={depth}
        index={index}
        isDisabled={isDisabled}
        stepsLength={stepsLength}
      />
    );
  }, [node, listeners, depth, index, isDisabled, stepsLength]);

  return useMemo(() => {
    return (
      <Box
        position="relative"
        m="auto"
        ref={setNodeRef}
        {...attributes}
        role="none"
        maxWidth={parallelContainer ? undefined : stepMaxWidth}
      >
        {nodeElement}
      </Box>
    );
  }, [nodeElement, parallelContainer, attributes, setNodeRef]);
}
