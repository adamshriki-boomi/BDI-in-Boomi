import { ListItem, UnorderedList } from '@chakra-ui/react';
import { HStack, VStack } from 'components';
import { CustomSelectForm } from 'components/Form/components';
import { VariableSelector } from 'components/Form/VariablesEditor';
import { useEnableEdit } from 'hooks/useEnableEdit';
import React from 'react';
import { useRiver, useRiverActions } from 'store/river/hooks';
import { getHashKey } from 'utils/api.sanitizer';

// this will cause the dropdown to be displayed as textarea
// (his height will be set by the amount of selected items
const textareaDropDown = {
  valueContainer: provided => ({
    ...provided,
    overflow: 'initial!important',
  }),
};

export function LoopOverContainer({ node }) {
  const loopOverValue = node?.loop_over_value;

  const loopOverVariableName = node?.loop_over_variable_name || [];
  const loopOverVariableNameArr =
    typeof loopOverVariableName === 'string'
      ? [loopOverVariableName]
      : loopOverVariableName;
  const { selectedVariables } = useRiver();
  const { setStepProps } = useRiverActions();
  const { addVariable } = useRiverActions();

  const setLoopOverValue = val => {
    setStepProps({
      hash: getHashKey(node),
      loop_over_value: val,
    });
  };

  const setLoopOverVarName = val => {
    setStepProps({
      hash: getHashKey(node),
      loop_over_variable_name: val?.map(item => item.value),
    });
  };

  const targetOptions =
    selectedVariables &&
    Object.keys(selectedVariables).map(value => ({ value, label: value }));

  const selectedOptions = loopOverVariableNameArr?.map(value => ({
    value,
    label: value,
  }));
  const { enableEdit } = useEnableEdit();
  const hasVariables = Boolean(Object.keys(selectedVariables ?? {}).length);

  return (
    <VStack alignItems="inherit" gap={0}>
      <HStack gap={2}>
        <VariableSelector
          label="For each value in"
          value={loopOverValue}
          onChange={val => setLoopOverValue(val.value)}
          onAddVariable={val => {
            addVariable({ name: val, isMulti: true });
            setLoopOverValue(val);
          }}
          selectedVariables={selectedVariables}
          variable={hasVariables ? '' : 'loop'}
          styleProps={{ minWidth: '200px', p: 0, m: 0 }}
          hideIndicator={false}
          variableName="loop"
          placeholder="{Variable}"
        />
      </HStack>
      <HStack alignItems="baseline" gap={2}>
        <VStack alignItems="stretch" p={0} pb={1} maxWidth="full" width="full">
          <CustomSelectForm
            label="Set in variable(s):"
            value={selectedOptions}
            controlId="entity_type"
            customStyles={textareaDropDown}
            options={targetOptions}
            name="entity_type"
            placeholder="Select / Search Entity"
            updateFilter={arr => setLoopOverVarName(arr)}
            withCreate={enableEdit}
            chakra={false}
            defaultCreateLabel="Choose"
          />
          <UnorderedList fontSize="xs" pl={3} mt={2} pb={5}>
            <ListItem>
              For multiple columns, set the variables by ordinal position.
              Example: firstName, lastName
            </ListItem>
          </UnorderedList>
        </VStack>
      </HStack>
    </VStack>
  );
}
