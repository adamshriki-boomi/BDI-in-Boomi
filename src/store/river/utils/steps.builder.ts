import { nanoid } from '@reduxjs/toolkit';
import {
  BlockTypes,
  ContainerRunningTypes,
  FileCompressions,
  FileTypes,
  ILogicStep,
  LogicTargetType,
  SplitInterval,
  SplitTables,
  StepTypes,
  TargetLoading,
} from 'api/types';
import { getNewStepName } from 'containers/River/RiverLogic/Logic/utils/logic.utils';
import { NodeType } from 'store/river/river.types';
import { getHashKey, getStepId } from 'utils/api.sanitizer';

const createHashkey = () => ({ hash_key_init: nanoid() });
const hasHashkey = (step: ILogicStep) => Boolean(step.hash_key_init);
const emptyArr = [];

type addLogicStepConfig = {
  steps: ILogicStep[];
  stepType?: StepTypes | string;
  name?: string;
  stepIndex?: number;
  defaultFields?: any;
};
export const propsToProcess = {
  [BlockTypes.SQL]: {
    keep: [
      'gConnection',
      'dataset_id',
      'schema_id',
      'database',
      'catalog',
      'schema_id',
      'target_type',
      'use_standard_sql',
    ],
    clear: ['target_table'],
  },
  [BlockTypes.RIVER]: {
    keep: [],
    clear: ['river_id'],
  },
  [BlockTypes.ACTION]: {
    keep: [],
    clear: ['action_id'],
  },
  [BlockTypes.LOGICODE]: {
    keep: ['code_type', 'target_type', 'gConnection'],
    clear: ['file_cross_id', 'file_name'],
  },
  [BlockTypes.PYTHON]: {
    keep: ['code_type', 'target_type', 'gConnection'],
    clear: ['file_cross_id', 'file_name'],
  },
};
const normalizeContentByBlockType = (step, blockType) => {
  const propsRules = propsToProcess[blockType];
  const clearProps: string[] = propsRules.clear;
  const clearedProps = clearProps.reduce((result, prop) => {
    return {
      ...result,
      [prop]: '',
    };
  }, {});
  const keepProps = propsRules.keep;
  const keptProps = keepProps.reduce((result, prop) => {
    return {
      ...result,
      [prop]: step.content[prop],
    };
  }, {});
  return {
    ...clearedProps,
    ...keptProps,
  };
};

export const addLogicStep = ({
  steps,
  stepType,
  name,
  stepIndex,
  defaultFields = {},
}: addLogicStepConfig) => {
  const lastNode = getLastStep(steps);
  const blockPrimaryType =
    lastNode?.content.block_primary_type || BlockTypes.DEFAULT;
  const blockType = lastNode?.content.block_type || stepType;
  const normalizedStepProps = lastNode
    ? normalizeContentByBlockType(lastNode, blockPrimaryType)
    : defaultFields;
  const newStep = createStep(
    {
      step_name: name || getNewStepName(steps, NodeType.STEP),
      ...normalizedStepProps,
    },
    blockType,
    blockPrimaryType,
  );
  steps.splice(stepIndex || steps.length, 0, newStep as ILogicStep);

  return steps;
};
export const getDefaultContent = ({
  stepType,
  block_primary_type,
  content = null,
}) => {
  return {
    sql_query: '',
    connection_id: {},
    drop_after: false,
    target_type: LogicTargetType.TABLE,
    file_type: FileTypes.CSV,
    block_type: stepType,
    block_primary_type,
    block_db_type: stepType,
    compression: FileCompressions.NONE,
    split_tables: SplitTables.NO,
    split_interval: SplitInterval.DAILY,
    target_loading: TargetLoading.APPEND,
    target_table: '',
    fields: emptyArr,
    ...content,
  };
};
export const createStep = (
  {
    step_name = 'New Logic Step',
    container_running = ContainerRunningTypes.RUN_ONCE,
    ...content
  }: Partial<ILogicStep>,
  stepType: StepTypes | string,
  block_primary_type = 'sql',
) => ({
  nodes: emptyArr,
  ...createHashkey(),
  container_running,
  isEnabled: true,
  isParallel: false,
  step_name,
  content: getDefaultContent({ stepType, block_primary_type, content }),
});

export const createContainer = ({
  step_name = 'New Container',
  container_running = ContainerRunningTypes.RUN_ONCE,
  isEnabled = true,
  nodes = emptyArr,
}: Partial<ILogicStep>) => ({
  nodes,
  ...createHashkey(),
  container_running,
  isEnabled,
  isParallel: false,
  step_name,
});

function getLastStep(steps: ILogicStep[]): ILogicStep | null {
  return steps?.reduceRight((result, step) => {
    return result ? result : step.content ? step : getLastStep(step.nodes);
  }, null);
}
export function composeStepsWithFn(
  steps: ILogicStep[],
  fn: (step: ILogicStep) => void | Promise<void>,
) {
  steps?.forEach(step => {
    if (!step.nodes) {
      step.nodes = [];
    }
    composeStepsWithFn(step.nodes, fn);
    fn(step);
  });
}

export function findStepsWithFn(
  steps: ILogicStep[],
  fn: (step: ILogicStep) => boolean,
) {
  return steps
    ?.map(step => {
      const nodes = findStepsWithFn(step.nodes, fn);
      const curr = fn(step) && step;
      const result = (nodes?.length ? [curr, ...nodes] : [curr])
        .filter(Boolean)
        .flat();
      return result;
    })
    ?.flat();
}

function addHashToStep(step: ILogicStep): void {
  if (!hasHashkey(step)) {
    Object.assign(step, createHashkey());
  }
}

export function composeStepsWithHash(steps: ILogicStep[]) {
  return composeStepsWithFn(steps, addHashToStep);
}

export function findStepWithDepthByHash(
  steps: ILogicStep[],
  hash: string,
  depth = 0,
  idGetterFunc = getHashKey,
): { step: ILogicStep; depth: number } {
  const step = steps?.find(step => idGetterFunc(step) === hash);

  if (step) {
    return { step, depth: depth };
  }

  return steps.reduce(
    (acc, { nodes }) => {
      if (acc.step || !nodes?.length) {
        return acc;
      } else {
        const subRes = findStepWithDepthByHash(nodes, hash, acc.depth + 1);
        return subRes.step ? subRes : acc;
      }
    },
    { depth, step: undefined },
  );
}

export function findStepByHash(steps: ILogicStep[], hash: string): ILogicStep {
  return findStepWithDepthByHash(steps, hash, 0).step;
}
export function findStepByStepId(
  steps: ILogicStep[],
  stepId: string,
): ILogicStep {
  return findStepWithDepthByHash(steps, stepId, 0, getStepId).step;
}

type findStepParentByHashReturn = {
  steps: ILogicStep[];
  index: number;
  parent?: ILogicStep;
};

const createStepResult = (parent = undefined, steps = undefined, index = 0) =>
  ({ parent, steps, index } as findStepParentByHashReturn);

export function findStepParentByHash(
  parent: ILogicStep,
  steps: ILogicStep[],
  hash: string,
): findStepParentByHashReturn {
  const isTargetStep = step => getHashKey(step) === hash;
  const index = steps.findIndex(isTargetStep);
  const result = createStepResult(
    index >= 0 ? parent : undefined,
    index >= 0 ? steps : undefined,
    index,
  );

  if (!result.steps) {
    return steps.reduce(
      (acc, step) =>
        acc.steps || !step?.nodes?.length
          ? acc
          : findStepParentByHash(step, step.nodes, hash),
      result,
    );
  }

  return result;
}
export const defaultFields = {
  target_loading: TargetLoading.APPEND,
};
