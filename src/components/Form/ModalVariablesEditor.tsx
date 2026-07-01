import { HStack, Icon, Text } from '@chakra-ui/react';
import { CloseIconButton, Flex, VariablesIcon } from 'components';
import { RiveryButton } from 'components/Buttons';
import { useEnableEdit } from 'hooks/useEnableEdit';
import { useGetAngularScope } from 'hooks/useGetAngularScope';
import { useRiverType } from 'hooks/useRiverType';
import { useToastComponent } from 'hooks/useToast';
import { useDismissDrawer } from 'modules/RiverRightBar';
import { useVersionController } from 'modules/Versions/hooks';
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { compareObjects } from 'utils/utils';
import { VariablesEditor, VariablesEditProps } from './VariablesEditor';

export function ModalVariablesEditor({
  variables,
  onChange,
  disabled = null,
  createFormApi = null,
}: VariablesEditProps) {
  return (
    <VariablesDrawer
      variables={variables}
      onChange={onChange}
      disabled={disabled}
      createFormApi={createFormApi}
    />
  );
}

function useVariablesValidator() {
  //remove when back will implement this part
  const { error } = useToastComponent();
  return {
    validate: (state: { [variableName: string]: any }) => {
      const invalidValues = Object.values(state).filter(variableValue => {
        return (
          variableValue?.is_encrypted &&
          (variableValue?.value === '' ||
            typeof variableValue?.value == 'undefined')
        );
      });
      const invalid = invalidValues.length > 0;
      if (invalid) {
        error({
          duration: 15000,
          description: 'Error: Value of an encrypted variable cannot be empty',
        });
        return false;
      } else {
        return true;
      }
    },
  };
}

export function VariablesDrawer({
  variables,
  onChange,
  disabled,
  createFormApi,
}) {
  const onDeleteAllSearchParams = useDismissDrawer(false);
  const [state, setState] = useState<any>();
  const { validate } = useVariablesValidator();
  const { isSourceToTarget } = useRiverType();
  const { isActive: isInVersionMode } = useVersionController();
  const { angularScope } = useGetAngularScope();
  const angularRiverVariables =
    angularScope?.river?.river_definitions?.shared_params?.river_variables;
  useEffect(() => {
    if (isSourceToTarget && isInVersionMode) {
      //if in version mode get variables from angular
      setState(angularRiverVariables);
    } else {
      setState(variables);
    }
  }, [variables, isInVersionMode, isSourceToTarget, angularRiverVariables]);
  const onCloseDrawer = useCallback(
    () => onDeleteAllSearchParams(),
    [onDeleteAllSearchParams],
  );
  const { enableEdit } = useEnableEdit();
  const onSave = () => {
    if (validate(state)) {
      onChange(state);
      onDeleteAllSearchParams();
    }
  };
  const checkIfDirty = () => compareObjects(state, variables);
  return (
    <Flex flexDir="column" h="full" bg="white">
      <Flex flexDir="column" p={4} h="100px">
        <Flex
          pb={1}
          justify="space-between"
          borderBottom="1px solid"
          borderColor="gray.300"
        >
          <HStack>
            <Icon as={VariablesIcon} boxSize={5} color="background-selected" />
            <Text textStyle="M4">Variables</Text>
          </HStack>
          <CloseIconButton
            aria-label="close variables editor drawer"
            onClick={e => {
              e.preventDefault();
              onCloseDrawer();
            }}
            as={Link}
          />
        </Flex>
        <Flex
          color="font-secondary"
          fontSize="sm"
          fontWeight="normal"
          flexDir="column"
        >
          <Text>
            Data Flow Variables can only be used and modified within this Data
            Flow; to use the variable, use curly brackets.
          </Text>
        </Flex>
      </Flex>
      <Flex flexDir="column" overflow="hidden" maxHeight="100%" p={4} flex={1}>
        <VariablesEditor
          variables={state}
          onChange={setState}
          disabled={disabled || !enableEdit}
          createFormApi={createFormApi}
          compact
        />
      </Flex>
      <HStack
        justify="space-between"
        w="100%"
        h="57px"
        alignSelf="end"
        borderTop="1px"
        borderTopColor="gray.300"
        p={4}
      >
        <RiveryButton
          label="Cancel"
          onClick={e => {
            e.preventDefault();
            onCloseDrawer();
          }}
          size="small"
          variant="default"
          href="#"
        />
        <RiveryButton
          label="Apply Changes"
          onClick={onSave}
          size="small"
          variant="primary"
          isDisabled={isInVersionMode || checkIfDirty()}
        />
      </HStack>
    </Flex>
  );
}
