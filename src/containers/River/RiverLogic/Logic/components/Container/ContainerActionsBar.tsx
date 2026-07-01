import { HStack, Icon } from '@chakra-ui/react';
import { ContainerRunningTypes } from 'api/types';
import { Box, GridBox, PlusIcon, RiveryButton } from 'components';
import { RiverySwitch, SelectFormGroup } from 'components/Form/components';
import React, { useCallback } from 'react';
import { useRiverActions } from 'store/river';
import { AddStepButton } from '../BlockAction';
import { ContainerDescription } from './ContainerDescription';
import { StepsWrapper } from './LogicContainer';
const items = [
  {
    label: 'Run Once',
    value: ContainerRunningTypes.RUN_ONCE,
  },
  {
    label: 'Loop Over',
    value: ContainerRunningTypes.LOOP_OVER,
  },
  {
    label: 'Condition',
    value: ContainerRunningTypes.CONDITION,
  },
];

type ContainerActionsBarProps = {
  containerHashKey: string;
  containerRunning: ContainerRunningTypes;
  isParallel?: boolean;
  name: string;
  children;
  isDisabled?: boolean;
  depth?: number;
};
export function ContainerActionsBar({
  containerHashKey,
  containerRunning = ContainerRunningTypes.RUN_ONCE,
  children,
  isParallel,
  name,
  isDisabled = false,
}: ContainerActionsBarProps) {
  const { setStepProps: setContainerProp } = useRiverActions();
  const updateContainerProp = useCallback(
    (propName: string, value: ContainerRunningTypes | boolean) => {
      return setContainerProp({
        hash: containerHashKey,
        [propName]: value,
      });
    },
    [containerHashKey, setContainerProp],
  );
  const selectedContainerRunning = items.find(
    ({ value }) => value === containerRunning,
  );

  const isCondition = containerRunning === ContainerRunningTypes.CONDITION;
  const displayIsParallel = containerRunning === ContainerRunningTypes.RUN_ONCE;

  const addStepLabel =
    containerRunning === ContainerRunningTypes.CONDITION
      ? 'Add Condition Step'
      : 'Add Logic Step';
  const ContainerAction = () => (
    <GridBox>
      <HStack justifySelf="flex-end" gap={4}>
        {displayIsParallel && (
          <RiverySwitch
            ariaLabel={`Parallel Steps ${name}`}
            label="Parallel Steps"
            name={`isParallel-${containerHashKey}`}
            isChecked={isParallel}
            onChange={() => updateContainerProp('isParallel', !isParallel)}
          />
        )}
        <AddLogicStepButton
          containerHashKey={containerHashKey}
          name={name}
          label={addStepLabel}
        />
      </HStack>
    </GridBox>
  );
  const onchangeContainerType = ({ value }) => {
    updateContainerProp('container_running', value);
    if (value !== ContainerRunningTypes.RUN_ONCE && isParallel) {
      updateContainerProp('isParallel', false);
    }
  };

  const SelectContainerType = () => (
    <SelectFormGroup
      options={items}
      controlId={`container types ${name}`}
      onChange={onchangeContainerType}
      value={selectedContainerRunning}
    />
  );
  return (
    <div>
      <GridBox templateColumns="repeat(2, 1fr)">
        <SelectContainerType />
        {isCondition ? <ContainerAction /> : null}
      </GridBox>
      <ContainerDescription type={selectedContainerRunning?.value} />
      {isCondition ? children : null}
      {!isCondition ? (
        <ContainerWrapper
          hashKey={containerHashKey}
          containerRunning={containerRunning}
          isDisabled={isDisabled}
        >
          <Box p={3}>
            <ContainerAction />
            {children}
          </Box>
        </ContainerWrapper>
      ) : null}
    </div>
  );
}
const ContainerWrapper = ({
  hashKey,
  containerRunning,
  children,
  isDisabled,
}) => (
  <StepsWrapper containerRunning={containerRunning} isDisabled={isDisabled}>
    {children}
  </StepsWrapper>
);

export const AddLogicStepButton = ({ containerHashKey, name, label }) => {
  const { addLogicStepToContainer } = useRiverActions();
  const onAddLogicStep = useCallback(
    () => addLogicStepToContainer({ containerHashKey }),
    [addLogicStepToContainer, containerHashKey],
  );
  return (
    <RiveryButton
      onClick={onAddLogicStep}
      label={label}
      aria-label={`Add Logic Step to ${name}`}
      variant="default"
      leftIcon={<Icon as={PlusIcon} boxSize="16px" />}
    />
  );
};

export const AddLogicStepCircleButton = ({
  containerHashKey,
  selectedLogicSteps,
  disabled = false,
  hashKey,
  stepIndex,
}) => {
  const { addLogicStepToContainer } = useRiverActions();
  const onAddLogicStep = () =>
    addLogicStepToContainer({ containerHashKey, stepIndex });
  return (
    <AddStepButton
      hashKey={hashKey}
      isLast={selectedLogicSteps.length === stepIndex}
      stepIndex={stepIndex + 1}
      disabled={disabled}
      handleOnAddLogicStep={onAddLogicStep}
    ></AddStepButton>
  );
};
