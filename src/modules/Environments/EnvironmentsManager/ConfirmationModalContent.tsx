import { RoutesBuilder } from 'app/routes';
import { Box, ConfirmationModal, Flex, Grid, HStack, Text } from 'components';
import { Input } from 'components/Form';
import { useCallback, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useCore } from 'store/core';
import {
  SelectComponent,
  useEnvironmentOptions,
} from '../components/EnvironmentsSelector';
import { useEditEnvironmentMutation } from '../environments.query';

function EnvironmentObject({ name, count }) {
  return (
    <HStack justify="space-between" w="50%">
      <Text textTransform="capitalize">{name}:</Text>
      <Text>{count}</Text>
    </HStack>
  );
}

export function ModalContent({
  show,
  onClose,
  env_id,
  environmentTotals,
  isDefaultEnvironment,
  deleteEnv: deleteEnvironment,
}) {
  const { push } = useHistory();
  const { envId, activeAccountId: accountId } = useCore();
  const [value, setValue] = useState(null);
  const [newDefault, setNewDefault] = useState(null);
  const [editEnvironment] = useEditEnvironmentMutation();

  const deleteRegex = new RegExp(/^delete$/);
  const reRouteHome = useCallback(() => {
    push(RoutesBuilder.home({ accountId, envId: 'default_env' }));
    window.location.reload();
  }, [accountId, push]);

  const deleteEnv = useCallback(async () => {
    if (isDefaultEnvironment && newDefault) {
      await editEnvironment({
        selectedAccountId: accountId,
        id: newDefault.value,
        is_default: true,
      });
      deleteEnvironment({ id: env_id });
    } else {
      deleteEnvironment({ id: env_id }).then(() => {
        if (env_id === envId) {
          reRouteHome();
        }
      });
    }
  }, [
    isDefaultEnvironment,
    newDefault,
    deleteEnvironment,
    env_id,
    editEnvironment,
    accountId,
    envId,
    reRouteHome,
  ]);

  return (
    <ConfirmationModal
      title="Delete Environment?"
      variant="warning"
      confirmLabel="Delete"
      confirmProps={{
        isDisabled: !deleteRegex.test(value),
      }}
      onConfirm={deleteEnv}
      onClose={onClose}
      show={show}
    >
      <Grid gap={2} flexDirection="column">
        {isDefaultEnvironment ? (
          <DefaultEnvironmentChange
            setNewDefault={v => setNewDefault(v)}
            newDefault={newDefault}
          />
        ) : null}
        <Box
          h="full"
          w="full"
          bg="white"
          opacity={
            !isDefaultEnvironment || (isDefaultEnvironment && newDefault)
              ? 1
              : 0.3
          }
        >
          <Flex gap={2} flexDir="column">
            <Text display="flex" fontSize="sm">
              This action will permanently remove the following Objects from
              this environment:
            </Text>
            <Box bg="gray.200" px={2} py={3} borderRadius={4}>
              {environmentTotals &&
                Object.entries(environmentTotals)?.map(([key, value], idx) => (
                  <EnvironmentObject
                    key={`${idx}-${key}`}
                    name={key}
                    count={value}
                  />
                ))}
            </Box>
            <Text
              borderBottom="1px solid"
              borderBottomColor="gray.300"
              display="flex"
              fontSize="sm"
              pb={3}
            >
              Please be aware that once the Objects are deleted, they cannot be
              recovered.
            </Text>
            <Input
              disabled={isDefaultEnvironment ? !newDefault : false}
              label="Type 'delete' to confirm"
              placeholder="Type..."
              value={value}
              onChange={({ target }) => setValue(target.value)}
            />
          </Flex>
        </Box>
      </Grid>
    </ConfirmationModal>
  );
}

function DefaultEnvironmentChange({ setNewDefault, newDefault }) {
  const environments = useEnvironmentOptions();

  const environmentOptions = environments?.filter(
    ({ is_default }) => !is_default,
  );

  return (
    <Flex
      flexDir="column"
      pb={4}
      gap={3}
      borderBottom="1px solid var(--chakra-colors-gray-300)"
    >
      <Flex flexDir="column">
        <Text fontSize="sm">
          You are trying to delete the <strong> default </strong> environment.
        </Text>
        <Text fontSize="sm">
          If you wish to proceed, please update your selection.
        </Text>
      </Flex>
      <SelectComponent
        options={environmentOptions as any}
        controlId="default_environment"
        isRequired
        label="Default Environment"
        ariaLabel="Default Environment"
        size="sm"
        placeholder="Select default environment"
        onChange={setNewDefault}
        value={[newDefault]}
      />
    </Flex>
  );
}
