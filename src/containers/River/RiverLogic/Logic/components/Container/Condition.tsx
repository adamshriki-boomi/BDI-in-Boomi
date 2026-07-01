import { Box, Flex, Text } from '@chakra-ui/react';
import { ConditionThenType, OperatorType } from 'api/types';
import { RadioGroup, SelectFormGroup } from 'components/Form/components';
import { VariableSelector } from 'components/Form/VariablesEditor';
import React from 'react';
import { useEffectOnce, useToggle } from 'react-use';
import { useRiver, useRiverActions } from 'store/river/hooks';
import { NodeType } from 'store/river/river.types';
import { compare } from 'utils/array.utils';
import { Operators } from 'utils/check.condition';
import { NodeHeader } from '../NodeHeader';

export function ConditionContainer({ node }) {
  return null;
}
export const DEFAULT_CONDITION = {
  operator: Operators.EQUALS,
  key: '',
  val: '',
};

export function ConditionWrapper({
  index,
  length,
  children,
  hashKey,
  condition,
  isDisabled,
}) {
  const handleOnDelete = () => {
    removeStep(hashKey);
  };
  const { setStepProps, removeStep } = useRiverActions();
  const { selectedVariables } = useRiver();
  const {
    key,
    val,
    operator,
    condition_name: conditionName,
    condition_then: conditionThen,
  } = condition;

  const operatorCondition = conditionOperatorsList.find(
    compare('value', operator),
  );

  const updateCondition = name => newVal => {
    // We keep the dynamic name section in case it will
    // be required in the future
    // const keyStr = name === 'key' ? newVal?.value ?? newVal : key;
    // const valStr = name === 'val' ? newVal?.value ?? newVal : val;
    // const opStr =
    //   name === 'operator' ? newVal?.label ?? newVal : operatorCondition.label;
    setStepProps({
      hash: hashKey,
      condition: {
        ...condition,
        // condition_name: `${keyStr} ${opStr} ${valStr} Condition`,
        [name]: typeof newVal === 'object' ? newVal.value : newVal,
      },
    });
  };

  useEffectOnce(() => {
    // That was added because the river draft should be updated in the
    // initiation when there is no condition_then
    // (when moving to condition container or creating a new one)
    if (!conditionThen)
      updateCondition('condition_then')(ConditionThenType.RUN_STEP);
  });

  const stepConditionPrefix =
    index === 0 ? 'If the' : index !== length - 1 ? 'Else if the ' : 'Else';

  const displayStep = conditionThen === ConditionThenType.RUN_STEP;
  const [isCollapsed, setIsCollapsed] = useToggle(false);
  const notEditableCondition = index && index === length - 1;

  return (
    <Box shadow="lg">
      <NodeHeader
        text={conditionName}
        onCollapse={() => setIsCollapsed(val => !val)}
        onNameChange={updateCondition('condition_name')}
        isDisabled={isDisabled}
        onDelete={handleOnDelete}
        open={true}
        icon="condition"
        type={NodeType.WRAP_CONTAINER}
      />
      {!isCollapsed && (
        <Box p={3}>
          <Flex w="full" maxWidth="630px">
            <Text
              pb={notEditableCondition ? 3 : undefined}
              mr={2}
              my="auto"
              whiteSpace="nowrap"
            >
              {stepConditionPrefix}
            </Text>
            {notEditableCondition ? null : (
              <Flex justifyContent="space-between" gap={3} grow={1}>
                <VariableSelector
                  value={key}
                  onChange={updateCondition('key')}
                  onAddVariable={updateCondition('key')}
                  selectedVariables={selectedVariables}
                  variable={key}
                  placeholder="Value/Variable"
                  styleProps={{ minWidth: '100px', my: 1, ml: 4, flexGrow: 1 }}
                  createVar={false}
                />
                <Box
                  as={SelectFormGroup}
                  label=""
                  options={conditionOperatorsList}
                  controlId="select condition operator"
                  value={operatorCondition}
                  onChange={updateCondition('operator')}
                />
                <VariableSelector
                  value={val}
                  onChange={updateCondition('val')}
                  onAddVariable={updateCondition('val')}
                  selectedVariables={selectedVariables}
                  variable={val}
                  placeholder="Value/Variable"
                  createVar={false}
                  styleProps={{ minWidth: '100px', my: 1, ml: 4, flexGrow: 1 }}
                />
              </Flex>
            )}
          </Flex>
          {stepConditionPrefix !== 'Else' && <Text my={3}>Then</Text>}
          <RadioGroup
            values={conditionThenOptions}
            checked={conditionThen}
            name="condition_then"
            onChange={updateCondition('condition_then')}
            aria-label={`Condition Then ${conditionName}`}
          />
          {displayStep && <Box pt={3}>{children}</Box>}
        </Box>
      )}
    </Box>
  );
}
const conditionThenOptions = [
  {
    label: 'Run Step',
    value: ConditionThenType.RUN_STEP,
    ariaLabel: 'Condition Run Step',
  },
  {
    label: 'Skip Container',
    value: ConditionThenType.PASS,
    ariaLabel: 'Condition Skip Container',
  },
  {
    label: 'Stop Data Flow',
    value: ConditionThenType.STOP,
    ariaLabel: 'Condition Stop Data Flow',
  },
  {
    label: 'Fail Data Flow',
    value: ConditionThenType.Failed,
    ariaLabel: 'Condition Fail Data Flow',
  },
];

const conditionOperatorsList = [
  {
    label: 'Equals',
    value: OperatorType.EQUALS,
  },
  {
    label: 'Does Not Equal',
    value: OperatorType.DOES_NOT_EQUAL,
  },
  {
    label: 'Like',
    value: OperatorType.LIKE,
  },
  {
    label: 'Is Not Like',
    value: OperatorType.NOT_LIKE,
  },
  {
    label: 'Less Than',
    value: OperatorType.LESS_THAN,
  },
  {
    label: 'Greater Than',
    value: OperatorType.GREATER_THAN,
  },
  {
    label: 'Less Than/Equals',
    value: OperatorType.LESS_THAN_EQUALS,
  },
  {
    label: 'Greater Than/Equals',
    value: OperatorType.GREATER_THAN_EQUALS,
  },
];
