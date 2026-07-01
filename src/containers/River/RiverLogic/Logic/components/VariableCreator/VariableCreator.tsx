import { Box, Text, VStack } from '@chakra-ui/react';
import { RiveryButton } from 'components';
import RiveryAlert from 'components/Alert/Alert';
import { RadioListGroup, SelectFormGroup } from 'components/Form';
import { useEnableEdit } from 'hooks/useEnableEdit';
import { useLazyGetEnvironmentsQuery } from 'modules/Environments/environments.query';
import { useCallback, useState } from 'react';
import { useToggle } from 'react-use';
import { useCore } from 'store/core/hooks';
import { useEnvironmentsActions } from 'store/environments';
import { useSelectedEnvironment } from 'store/environments/hooks/useGetEnvironment';
import { useRiver, useRiverActions } from 'store/river';
import { compare } from 'utils/array.utils';
import { validateReservedVariableName } from 'utils/validations';
import { useStepActions } from '../hooks/useStepActions';
import { useRiverVariableValidator } from '../RiverVariables/RiverVariableForm';

type VariableCreatorProps = {
  hash: string;
  varName: string;
  isGlobal: boolean;
};
type VariableOption = {
  label: string;
  value: string;
};
const variableOptions = [
  { label: 'Data Flow Variable', value: false },
  { label: 'Environment Variable', value: true },
];

enum VariableType {
  River = 'Data Flow',
  Environment = 'Environment',
}

const CreateLabel = (value, variableType) => {
  return (
    <Text color="primary">
      + Create New {variableType} Variable - {value}
    </Text>
  );
};

export function VariableCreator({
  hash,
  varName,
  isGlobal,
}: VariableCreatorProps) {
  const { add, loading } = useVariableEditor();
  const { variables, selectedVariable } = useVariables(isGlobal, varName);
  const { updateContent } = useStepActions(hash);
  const [validationMessage, setValidationMessage] = useState(null);

  const handleVariableChange = useCallback(
    (value: string) => {
      const variable_name = value ? value : '';
      updateContent({
        variable_name,
      });
    },
    [updateContent],
  );

  const handleIsGlobalChange = useCallback(
    (global: boolean) => {
      return updateContent({
        is_global_variable: global,
      });
    },
    [updateContent],
  );
  const isNewVariableValid = useRiverVariableValidator(variables);

  const addOption = async (variable: string) => {
    setValidationMessage(null);
    if (variable) {
      const reservedError = validateReservedVariableName(variable);
      if (reservedError) {
        setValidationMessage(reservedError);
        return;
      }
      const error = isNewVariableValid(variable);
      if (error) {
        const errorMessages = {
          nameExists: 'Variable exists already',
          containsInvalidChars:
            'Variable name must contain only letters, digits or underscores',
          isReserved: reservedError || '',
        };
        setValidationMessage(
          errorMessages[error] ||
            'Variable name must contain only letters, digits or underscores',
        );
        return;
      }
      await add(variable, isGlobal);
      handleVariableChange(variable);
      return;
    }
  };

  const variableType = isGlobal ? VariableType.Environment : VariableType.River;
  const normalizedSelectedVariable = selectedVariable;
  const { enableEdit } = useEnableEdit();
  return (
    <VStack alignItems="inherit" gap={1}>
      <RadioListGroup
        id={hash}
        name="variable-type"
        values={variableOptions}
        checked={Boolean(isGlobal)}
        onChange={handleIsGlobalChange}
      />
      <RiveryAlert
        variant={'warning-light'}
        description={
          <Box>
            View our{' '}
            <RiveryButton
              label="documentation"
              variant="link"
              href="https://help.boomi.com/docs/Atomsphere/Data_Integration/GettingStarted/variables#limitations-of-variables"
              target="_blank"
            />{' '}
            for detailed information on variable limitations
          </Box>
        }
      />
      <SelectFormGroup<VariableOption>
        ariaLabel="Variable Name"
        placeholder="Select or type to create a new variable"
        isLoading={loading}
        label="Variable Name"
        validationMessage={validationMessage}
        options={variables}
        controlId="variable_name"
        onChange={option => handleVariableChange(option?.value)}
        value={normalizedSelectedVariable}
        onAddOption={newVariableValue => addOption(newVariableValue)}
        withCreate={enableEdit}
        createOptionPosition="last"
        formatCreateLabel={value => CreateLabel(value, variableType)}
        isClearable
        helpText={
          Boolean(isGlobal)
            ? "Global variables are processed in the beginning of each run. In order to use this variable inside a query in this data flow, try using 'Data Flow Variable'."
            : ''
        }
      />
    </VStack>
  );
}
// UTILS
/**
 * returns a variables list according to the global value
 * returns the selected variable of the list
 */
const useVariables = (isGlobalVariable: boolean, varName: string) => {
  const { selectedVariables } = useRiver();
  const { selectedEnv } = useSelectedEnvironment();
  const selectedEnvVariables = selectedEnv?.variables;
  const variablesSource = isGlobalVariable
    ? selectedEnvVariables
    : selectedVariables;

  const variables = Object.keys(variablesSource)?.map(label => ({
    label,
    value: label,
  }));

  const selectedVariable = variables.find(compare('value', varName));
  return {
    variables,
    selectedVariable,
  };
};

const useVariableEditor = () => {
  const [loading, setLoading] = useToggle(false);
  const { envId: env_id } = useCore();
  const [fetchEnvironments] = useLazyGetEnvironmentsQuery();
  const { addVariableToEnvironment } = useEnvironmentsActions();
  const { addVariable } = useRiverActions();

  const add = async (variable_name: string, isEnvironmentTarget: boolean) => {
    if (isEnvironmentTarget) {
      setLoading(true);
      await addVariableToEnvironment({
        env_id,
        variable_name,
        variable_value: '',
      });
      await fetchEnvironments('');
      setLoading(false);
    } else {
      addVariable({ name: variable_name });
    }
  };
  return { add, loading };
};
