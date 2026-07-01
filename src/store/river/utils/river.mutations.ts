import { PayloadAction } from '@reduxjs/toolkit';
import {
  ContainerRunningTypes,
  IRiver,
  TaskConfig,
  TasksDefinition,
} from 'api/types';
import { getNewStepName } from 'containers/River/RiverLogic/Logic/utils/logic.utils';
import { getHashKey } from 'utils/api.sanitizer';
import { selectIsVersionMode } from '../river.selectors';
import { IRiverState, NodeType, REDUCER_KEY } from '../river.types';
import { setSelectRiverIsDirty } from '../state.mutations';
import {
  composeStepsWithHash,
  createContainer,
  findStepByHash,
  findStepParentByHash,
  findStepWithDepthByHash,
} from './steps.builder';

export const MAX_CONTAINERS_DEPTH = 2;

export const getSelected = (state: IRiverState) =>
  state.entities[state.selectedId];
export const getTaskDefinition = (river: IRiver) => river?.tasks_definitions[0];
export const getTaskConfig = (river: IRiver) =>
  getTaskDefinition(river)?.task_config;
export const getSteps = (state: IRiverState) =>
  getTaskConfig(getSelected(state))?.logic_steps;
export const getStep = (state: IRiverState, hash: string) =>
  findStepByHash(getSteps(state), hash);
export const getRiverIsDirty = (state: IRiverState) =>
  state?.selectedRiverIsDirty;

export const guardRiverMutation = mutationFunc => (state: never, action) => {
  if (selectIsVersionMode({ [REDUCER_KEY]: state })) {
    return;
  }
  if (!getRiverIsDirty(state)) {
    setSelectRiverIsDirty(state, true);
  }
  mutationFunc(state, action);
};
// MUTATIONS

type StepProps =
  | 'isEnabled'
  | 'isParallel'
  | 'container_running'
  | 'hideBlock'
  | 'step_name'
  | 'hash';
interface SetContainerPropConfig extends Record<StepProps, any> {
  hash: string;
}
export const setStepProps = (
  state,
  action: PayloadAction<Partial<SetContainerPropConfig>>,
) => {
  const { hash, ...props } = action.payload;
  const step = getStep(state, hash);
  Object.entries(props).forEach(([prop, value]) => {
    step[prop] = value;
  });
};

export const updateStepContent = (
  state,
  action: PayloadAction<Partial<SetContainerPropConfig>>,
) => {
  const { hash, ...props } = action.payload;
  const step = getStep(state, hash);
  step.content = Object.assign(step.content, props);
};

export const updateStep = (
  state,
  action: PayloadAction<Partial<SetContainerPropConfig>>,
) => {
  const { hash, ...props } = action.payload;
  const step = getStep(state, hash);
  Object.assign(step, props);
};

export const deleteStepByHash = (state, action: PayloadAction<string>) => {
  const hash = action.payload;
  const rootSteps = getSteps(state);
  const { steps, index } = findStepParentByHash(undefined, rootSteps, hash);
  let removedStep;
  if (steps) {
    removedStep = steps.splice(index, 1)[0];
  }
  return [removedStep, rootSteps];
};

export function addStepByTargetHash(
  steps,
  newStep,
  targetId,
  moveMode,
  containerType = ContainerRunningTypes.RUN_ONCE,
) {
  const index = steps.findIndex(step => getHashKey(step) === targetId);

  if (index < 0) {
    steps.forEach(step => {
      if (step?.nodes.length) {
        step.nodes = addStepByTargetHash(
          step.nodes,
          newStep,
          targetId,
          moveMode,
          containerType,
        );
      }
      // return step;
    });
  } else {
    if (moveMode === 'inside') {
      // for first element into empty container
      steps[index].nodes = [newStep];
      steps[index].container_running = containerType;
    } else {
      steps.splice(index + (moveMode === 'after' ? 1 : 0), 0, newStep);
    }
  }
  return steps;
}

function getNodeMaxDepth(node) {
  if (node.content) {
    return 0;
  }

  return (
    1 +
    node.nodes.reduce((depth, subNode) => {
      const subDepth = getNodeMaxDepth(subNode);
      return Math.max(depth, subDepth);
    }, 0)
  );
}

export function isChildOf(
  state,
  action: PayloadAction<{
    sourceId: string;
    targetId: string;
  }>,
) {
  const { sourceId, targetId } = action.payload;
  const sourceStep = findStepByHash(getSteps(state), sourceId);

  return findStepParentByHash(undefined, sourceStep.nodes, targetId).index >= 0;
}

export function moveStepByTargetHash(
  state,
  action: PayloadAction<{
    sourceId: string;
    targetId: string;
    mode?: string;
    containerRunning?: ContainerRunningTypes;
  }>,
) {
  const { sourceId, targetId, mode, containerRunning } = action.payload;
  const targetStepWithDepth = findStepWithDepthByHash(
    getSteps(state),
    targetId,
  );
  const sourceStep = findStepByHash(getSteps(state), sourceId);
  const sourceStepDepth = getNodeMaxDepth(sourceStep);

  if (isChildOf(state, action)) {
    console.log('can not move step inside its own children');
    return;
  }

  const finalDepth =
    targetStepWithDepth.depth + (mode === 'inside' ? 1 : 0) + sourceStepDepth;
  if (finalDepth > MAX_CONTAINERS_DEPTH) {
    console.warn(
      'can not move step, it will create a container with depth: ',
      finalDepth,
    );
    return;
  }

  const [removedStep, steps] = deleteStepByHash(state, {
    type: '',
    payload: sourceId,
  });
  if (removedStep) {
    addStepByTargetHash(steps, removedStep, targetId, mode, containerRunning);
  }
}

export const moveStepToContainer = (
  state,
  action: PayloadAction<{ sourceId; containerRunning }>,
) => {
  const newContainer = createContainer({
    step_name: getNewStepName(getSteps(state), NodeType.CONTAINER),
  });
  addStepByTargetHash(
    getSteps(state),
    newContainer,
    action.payload.sourceId,
    action.payload.containerRunning,
  );
  moveStepByTargetHash(state, {
    type: 'toContainer',
    payload: {
      sourceId: action.payload.sourceId,
      targetId: getHashKey(newContainer),
      mode: 'inside',
      containerRunning: action.payload.containerRunning,
    },
  });
};

function getMoveTarget(nodes, id, direction, toEdge = false) {
  const index = nodes?.findIndex(step => getHashKey(step) === id) ?? -1;

  if (index < 0) {
    return null;
  }
  if (toEdge) {
    return direction < 0 ? nodes[0] : nodes[nodes.length - 1];
  }
  const newIndex = index + Math.sign(direction);
  if (newIndex < 0 || newIndex >= nodes.length) {
    return null;
  }
  return nodes[newIndex];
}

export function moveStep(
  state,
  action: PayloadAction<{
    sourceId: string;
    direction: number;
    outside?: boolean;
    toEdge?: boolean;
  }>,
) {
  const { direction, sourceId, outside, toEdge } = action.payload;
  if (!direction) {
    return;
  }

  if (toEdge) {
    const steps = getSteps(state);
    const edgeTargetId = getHashKey(
      steps[direction < 0 ? 0 : steps.length - 1],
    );
    if (edgeTargetId) {
      moveStepByTargetHash(state, {
        type: '',
        payload: {
          sourceId,
          targetId: edgeTargetId,
          mode: direction > 0 ? 'after' : undefined,
        },
      });
    }
    return;
  }
  const { parent, steps } = findStepParentByHash(
    undefined,
    getSteps(state),
    sourceId,
  );

  let targetId = null;
  let moveMode = '';

  if (!parent) {
    if (outside) {
      const target = getMoveTarget(steps, sourceId, direction, toEdge);
      if (target && !target.content) {
        targetId = getHashKey(target);
        moveMode = 'inside';
        if (target.nodes.length) {
          if (Math.sign(direction) > 0) {
            targetId = getHashKey(target.nodes[0]);
            moveMode = '';
          } else {
            targetId = getHashKey(target.nodes[target.nodes.length - 1]);
            moveMode = 'after';
          }
        }
      }
    }
  }

  if (outside && parent && !targetId) {
    targetId = getHashKey(parent);
    moveMode = Math.sign(direction) < 0 ? '' : 'after';
  }

  if (!outside) {
    const nodes = parent
      ? parent.nodes
      : steps.find(step => getHashKey(step) === sourceId) && steps;
    targetId = getHashKey(getMoveTarget(nodes, sourceId, direction, toEdge));
    moveMode = Math.sign(direction) < 0 ? '' : 'after';
  }

  if (targetId) {
    moveStepByTargetHash(state, {
      type: '',
      payload: { sourceId, targetId, mode: moveMode },
    });
  }
}

export function updateRiverDefinitions(
  state,
  action: PayloadAction<Record<string, any>>,
) {
  const selected = getSelected(state);
  selected.river_definitions = {
    ...selected.river_definitions,
    ...action.payload,
  };
}

export function updateRiverTaskDefinitions(
  state,
  action: PayloadAction<Partial<TasksDefinition>>,
) {
  const selected = getSelected(state);
  const current = selected.tasks_definitions[0];
  selected.tasks_definitions[0] = { ...current, ...action.payload };
}
export function updateRiverTaskConfig(
  state,
  action: PayloadAction<Partial<TaskConfig>>,
) {
  const selected = getSelected(state);
  const current = selected.tasks_definitions[0].task_config;
  selected.tasks_definitions[0].task_config = { ...current, ...action.payload };
}

export function composeRiver(river: IRiver) {
  if (river?.tasks_definitions?.[0]?.task_config?.logic_steps) {
    composeStepsWithHash(
      river?.tasks_definitions?.[0]?.task_config?.logic_steps,
    );
  }
  return river;
}
