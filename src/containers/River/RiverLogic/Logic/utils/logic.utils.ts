import { ILogicStep } from 'api/types';
import { NodeType } from 'store/river/river.types';

function stepsAndContainersList(
  steps: ILogicStep[],
  parentCount = { [NodeType.STEP]: [], [NodeType.CONTAINER]: [] },
) {
  return steps?.reduce(
    ({ [NodeType.STEP]: steps, [NodeType.CONTAINER]: containers }, step) => {
      if (step.content) {
        return {
          [NodeType.STEP]: steps.concat(step.step_name),
          [NodeType.CONTAINER]: containers,
        };
      } else {
        return stepsAndContainersList(step.nodes, {
          [NodeType.STEP]: steps,
          [NodeType.CONTAINER]: containers.concat(step.step_name),
        });
      }
    },
    parentCount,
  );
}

const stepNames = {
  [NodeType.STEP]: 'Logic step',
  [NodeType.CONTAINER]: 'Container',
};

export function getNewStepName(steps: ILogicStep[], stepType) {
  const existingStepsByType = stepsAndContainersList(steps)[stepType];
  const baseName = stepNames[stepType];

  return (
    Array.from(
      { length: existingStepsByType.length + 1 },
      (_, index) => `${baseName} ${existingStepsByType.length + index}`,
    ).find(
      newName =>
        !existingStepsByType.find(name =>
          name.match(new RegExp(`^${newName}`, 'i')),
        ),
    ) || baseName
  );
}
