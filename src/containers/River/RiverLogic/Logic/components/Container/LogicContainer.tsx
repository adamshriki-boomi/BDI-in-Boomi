import { Box } from '@chakra-ui/react';
import { ContainerRunningTypes, ILogicStep } from 'api/types';
import clsx from 'clsx';
import React, { useMemo } from 'react';
import { NodeType } from 'store/river/river.types';
import { getHashKey } from 'utils/api.sanitizer';
import { DropZone } from '../BlockAction';
import { NodeHeader } from '../NodeHeader';
import { DraggableTreeNode, TreeNode } from '../TreeNode';
import {
  ConditionContainer,
  ConditionWrapper,
  DEFAULT_CONDITION,
} from './Condition';
import {
  AddLogicStepCircleButton,
  ContainerActionsBar,
} from './ContainerActionsBar';
import './LogicContainer.scss';
import { LoopOverContainer } from './LoopOver';

const ContainerComponentTypes = {
  [ContainerRunningTypes.RUN_ONCE]: RunOnce,
  [ContainerRunningTypes.LOOP_OVER]: LoopOverContainer,
  [ContainerRunningTypes.CONDITION]: ConditionContainer,
};

type Props = {
  node: ILogicStep;
  isDraggable?: boolean;
  moveHandler?: Function;
  depth: number;
  index: string;
};
function RunOnce() {
  return null;
}

export function LogicContainer({
  node,
  isDraggable,
  moveHandler,
  depth,
  index,
}: Props) {
  const nodes = node?.nodes;
  const isParallel = node?.isParallel;
  const containerRunning = node?.container_running;
  const NodeComponent = isDraggable ? DraggableTreeNode : TreeNode;

  const ContainerComponent = ContainerComponentTypes[containerRunning];
  const isDisabled = Boolean(!node?.isEnabled);
  const hash = getHashKey(node);
  const nodesContent = useMemo(
    () =>
      nodes?.map((currentNode, nodeIndex) => (
        <div
          key={`wrapper-node-${getHashKey(currentNode)}`}
          className="step-margin"
        >
          <StepWrapper
            containerRunning={containerRunning}
            index={nodeIndex}
            node={currentNode}
            isDisabled={isDisabled}
            length={nodes.length}
          >
            <NodeComponent
              node={currentNode}
              moveHandler={moveHandler}
              depth={depth + 1}
              index={`${index}.${nodeIndex}`}
              isDisabled={isDisabled}
            />
            {!isParallel && (
              <AddLogicStepCircleButton
                hashKey={getHashKey(currentNode)}
                selectedLogicSteps={nodes}
                containerHashKey={hash}
                stepIndex={nodeIndex + 1}
              />
            )}
          </StepWrapper>
        </div>
      )),
    [
      nodes,
      NodeComponent,
      moveHandler,
      depth,
      index,
      containerRunning,
      hash,
      isParallel,
      isDisabled,
    ],
  );

  const allowCondition = containerRunning === ContainerRunningTypes.RUN_ONCE;

  return (
    <Box px={4} py={3} className="logic-container">
      <ContainerActionsBar
        containerHashKey={getHashKey(node)}
        containerRunning={containerRunning}
        name={node.step_name}
        isDisabled={isDisabled}
        isParallel={isParallel}
      >
        <div>
          <ContainerComponent node={node} />
          <section
            className={clsx(
              `steps-container`,
              allowCondition &&
                isParallel &&
                node.nodes.length > 1 &&
                'is-parallel',
              isDisabled && 'is-disabled',
            )}
            role="group"
            aria-label={node.step_name}
            aria-disabled={Boolean(isDisabled)}
          >
            {isDraggable ? (
              nodes.length ? (
                <>
                  <DropZone
                    hashKey={`${getHashKey(nodes[0])}.before`}
                    isParallel={isParallel}
                  />
                  {nodesContent}
                </>
              ) : (
                <DropZone hashKey={`${getHashKey(node)}.inside`} alwaysOn />
              )
            ) : (
              nodesContent
            )}
          </section>
        </div>
      </ContainerActionsBar>
    </Box>
  );
}

function StepWrapper({
  containerRunning,
  index,
  length,
  children,
  node: {
    condition = {
      ...DEFAULT_CONDITION,
      condition_name: `Condition #${index + 1}`,
    },
    hash_key_init: hashKey,
  },
  isDisabled = false,
}) {
  return containerRunning === 'condition' ? (
    <ConditionWrapper
      length={length}
      index={index}
      hashKey={hashKey}
      isDisabled={isDisabled}
      condition={condition}
    >
      {children}
    </ConditionWrapper>
  ) : (
    children
  );
}
export function StepsWrapper({ containerRunning, children, isDisabled }) {
  const title = containerRunning?.replaceAll('_', ' ');
  return (
    <Box shadow="lg" as="fieldset" disabled={isDisabled} minW={0}>
      <NodeHeader
        text={title}
        open={true}
        icon={containerRunning}
        type={NodeType.WRAP_CONTAINER}
        isDisabled={isDisabled}
        styleProps={{ p: 2 }}
      />
      {children}
    </Box>
  );
}
