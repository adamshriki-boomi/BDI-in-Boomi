import {
  CloseIconButton,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  HStack,
  Text,
  Textarea,
} from 'components';
import { RiveryDrawerFooter } from 'components/Drawer/RiveryDrawerFooter';
import { Input } from 'components/Form';
import { PageOverlaySpinner } from 'components/Loaders/Loader';
import { useAllowedScopes } from 'hooks/useAllowedScopes';
import { useFocusFirstField } from 'hooks/useFocusFirstField';
import { useToastComponent } from 'hooks/useToast';
import { useLazyGetEnvironmentsQuery } from 'modules/Environments/environments.query';
import { useCallback, useMemo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useAsyncFn } from 'react-use';
import { useCore } from 'store/core';
import { useEnvironments, useEnvironmentsActions } from 'store/environments';
import { useSelectedEnvironment } from 'store/environments/hooks/useGetEnvironment';
import {
  alphaNumericValidation,
  validateReservedVariableName,
} from 'utils/validations';
import { variablesScopes } from './EnvironmentVariablesView';

const noop = () => void 0;

enum ViewModes {
  ADD = 'Add',
  EDIT = 'Edit',
}

export function VariableDrawer({ variable, value }) {
  const mode = variable ? ViewModes.EDIT : ViewModes.ADD;
  const { setDrawerState } = useEnvironmentsActions();
  const { isDrawerOpen } = useEnvironments();
  return (
    <Drawer
      size="default"
      isOpen={isDrawerOpen}
      placement="right"
      onClose={noop}
    >
      <DrawerOverlay />
      <DrawerContent>
        <DrawerHeader>
          <HStack
            w="100%"
            justify="space-between"
            pb={2}
            borderBottom="1px solid"
            borderBottomColor="gray.300"
          >
            <Text fontWeight="medium" fontSize="xl">
              {mode} Variable
            </Text>
            <CloseIconButton
              aria-label="close variable drawer"
              onClick={() => {
                setDrawerState(false);
              }}
            />
          </HStack>
        </DrawerHeader>
        <FormBody mode={mode} givenVariable={variable} givenValue={value} />
      </DrawerContent>
    </Drawer>
  );
}

function FormBody({ mode, givenVariable, givenValue }) {
  const hasRequiredScopes = useAllowedScopes(variablesScopes);
  const { success, error } = useToastComponent();
  const { envId: env_id } = useCore();
  const { setDrawerState } = useEnvironmentsActions();
  const { updateVariableValue, addVariableToEnvironment } =
    useEnvironmentsActions();
  const [fetchEnvironments] = useLazyGetEnvironmentsQuery();
  const formApi = useForm<{
    variable_name: string;
    variable_value: string;
  }>({
    defaultValues: {
      variable_name: mode === ViewModes.EDIT ? givenVariable : '',
      variable_value: mode === ViewModes.EDIT ? givenValue : '',
    },
    mode: 'onChange',
  });
  const [{ loading, error: failed }, onSubmit] = useAsyncFn(async values => {
    const { variable_name, variable_value } = values;
    if (mode === ViewModes.ADD) {
      await addVariableToEnvironment({
        env_id,
        variable_name,
        variable_value,
      });
    } else {
      await updateVariableValue({
        env_id,
        variable: variable_name,
        variable_value,
      });
    }
    await fetchEnvironments('');
    setDrawerState(false);
    if (failed) {
      error({ description: 'Something went wrong' });
    } else {
      success({
        description:
          mode === ViewModes.ADD
            ? `Variable ${variable_name} was Added`
            : `Variable ${variable_name} was Updated`,
      });
    }
  }, []);

  useFocusFirstField(formApi, 'variable_name');

  const applyText = mode === ViewModes.ADD ? 'Add Variable' : 'Apply Changes';
  const variableNameValidation = useVariableNameValidation();
  const { handleSubmit } = formApi;
  return (
    <FormProvider {...formApi}>
      <form style={{ height: '100%' }} onSubmit={handleSubmit(onSubmit)}>
        {loading ? <PageOverlaySpinner /> : null}
        <Flex h="100%" direction="column" justify="space-between">
          <DrawerBody>
            {mode === ViewModes.ADD ? (
              <Text color="font-secondary" pb={4}>
                Select a variable name and add its value.
              </Text>
            ) : null}
            <Flex flexDirection="column" gap={8} w={400}>
              <Input
                disabled={givenVariable}
                name="variable_name"
                label="Variable Name"
                aria-label="Variable Name"
                placeholder="Enter a name..."
                required="Variable name is required"
                validate={name => {
                  if (givenVariable) {
                    return true;
                  }
                  const reservedError = validateReservedVariableName(name);
                  if (reservedError) {
                    return reservedError;
                  }
                  const res = variableNameValidation(name);
                  return res ? res : true;
                }}
                api={formApi}
                chakra
              />

              <Input
                name="variable_value"
                label="Value"
                aria-label="value"
                placeholder="Enter Value..."
                api={formApi}
                chakra
                as={Textarea}
              />
            </Flex>
          </DrawerBody>
          <RiveryDrawerFooter
            cancelLabel="Cancel"
            saveLabel={applyText}
            handleOnClose={() => {
              setDrawerState(false);
            }}
            disabledSave={
              !formApi.formState.isValid || !Boolean(hasRequiredScopes.length)
            }
            handleOnSuccess={() => null}
          />
        </Flex>
      </form>
    </FormProvider>
  );
}

export const getErrorsVariables = (variableName, variablesArray) => {
  const reservedError = validateReservedVariableName(variableName);
  return [
    {
      name: 'isReserved',
      message: reservedError || '',
      invalid: Boolean(reservedError),
    },
    {
      name: 'nameExists',
      message:
        'This variable name is already in use. Consider a different one.',
      invalid: Boolean(
        variablesArray?.find(variableItem =>
          (variableItem?.variable ?? variableItem)?.match(
            new RegExp(`^${variableName.replace(/\\+$/, '')}$`, 'i'),
          ),
        ),
      ),
    },
    {
      name: 'containsInvalidChars',
      message:
        'Name must contain only letters, digits or underscores and begin with a letter',
      invalid: !alphaNumericValidation.test(variableName),
    },
  ];
};

const useVariableNameValidation = () => {
  const { selectedEnv: environment } = useSelectedEnvironment();
  const variablesArray = useMemo(
    () =>
      environment
        ? Object.entries(environment?.variables)?.map(([key, value]) => ({
            variable: key,
            value,
          }))
        : [],
    [environment],
  );

  return useCallback(
    name => {
      const errors = getErrorsVariables(name, variablesArray);
      return errors.find(subject => subject.invalid)?.message;
    },
    [variablesArray],
  );
};
