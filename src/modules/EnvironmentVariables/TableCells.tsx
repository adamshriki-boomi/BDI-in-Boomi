import {
  ConfirmationModal,
  Flex,
  RiveryButton,
  RiveryOverlay,
  Text,
} from 'components';
import { PageOverlaySpinner } from 'components/Loaders/Loader';
import RiveryDropdown from 'containers/River/RiverLogic/Logic/components/RiveryChakraMenu';
import { useToastComponent } from 'hooks/useToast';
import { useLazyGetEnvironmentsQuery } from 'modules/Environments/environments.query';
import { normalizeVariableValue } from 'modules/Environments/helpers';
import { useCallback } from 'react';
import { useAsyncFn, useToggle } from 'react-use';
import { useCore } from 'store/core';
import { useEnvironmentsActions } from 'store/environments';

export function Value({ value }) {
  const variableValue = normalizeVariableValue(value);
  return (
    <RiveryOverlay description={variableValue}>
      <Text overflow="hidden" whiteSpace="nowrap" textOverflow="ellipsis">
        {variableValue}
      </Text>
    </RiveryOverlay>
  );
}

export function Variable({
  value,
  column: {
    getProps: { setVariable },
  },
}) {
  const { setDrawerState } = useEnvironmentsActions();
  const onClick = useCallback(() => {
    setDrawerState(true);
    setVariable(value);
  }, [setDrawerState, setVariable, value]);

  return (
    <RiveryButton
      pl={0}
      label={value}
      variant="link"
      h="full"
      w="full"
      _active={{ bg: 'transparent' }}
      cursor="pointer"
      onClick={onClick}
      justifyContent="start"
    />
  );
}

export function ActionsCell({
  row: {
    original: { variable },
  },
  column: {
    getProps: { setVariable },
  },
}) {
  const { success } = useToastComponent();
  const { envId } = useCore();
  const [show, toggle] = useToggle(false);
  const { deleteVariable, setDrawerState } = useEnvironmentsActions();
  const [fetchEnvironments] = useLazyGetEnvironmentsQuery();

  const [{ loading }, onDelete] = useAsyncFn(async () => {
    const res: any = await deleteVariable({
      variable_name: variable,
      environments: [envId],
    });
    if (!res?.error) {
      success({ description: `Variable ${variable} was deleted` });
      await fetchEnvironments('');
      return;
    }
  }, [variable]);

  const actions = [
    {
      ...RiveryDropdown.EditMenuItem,
      onClick: () => {
        setVariable(variable);
        setDrawerState(true);
      },
    },
    {
      ...RiveryDropdown.DeleteMenuItem,
      onClick: toggle,
    },
  ];

  return (
    <Flex w="full" justify="flex-end">
      {loading ? <PageOverlaySpinner /> : null}
      <RiveryDropdown
        menuItems={actions}
        menuButtonAriaLabel={`${variable}-actions`}
      />
      <ConfirmationModal
        show={show}
        onClose={toggle}
        onConfirm={onDelete}
        title={`Delete "${variable}" Variable?`}
        description="The variable will be removed from the environment."
        confirmLabel="Delete"
        variant="warning"
      />
    </Flex>
  );
}
