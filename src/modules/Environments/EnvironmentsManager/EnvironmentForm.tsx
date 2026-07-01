import { Box, Grid, HStack, Text, Textarea } from '@chakra-ui/react';
import { RoutesBuilder } from 'app/routes';
import RiveryButton from 'components/Buttons/RiveryButton';
import { Input } from 'components/Form';
import { useCallback } from 'react';
import { useFormContext } from 'react-hook-form';
import { useToggle } from 'react-use';
import { useCore } from 'store/core';
import { getOId } from 'utils/api.sanitizer';
import { useLazyGetEnvironmentsTotalsQuery } from '../environments.query';
import { useEnvironmentNameValidation } from '../helpers';
import { ModalContent } from './ConfirmationModalContent';

const colors = [
  'tagGreen',
  'cBlues',
  'tagCyan',
  'tagGeekBlue',
  'cPurples',
  'tagPurple',
  'tagMagenta',
  'cOranges',
  'tagOrange',
  'yellow.200',
];

export function EnvironmentForm({
  onCancel,
  isNew,
  cross_id,
  isDefault,
  deleteEnv,
}) {
  const [deleteModal, toggleDelete] = useToggle(false);
  const [getTotals, { data: environmentTotals }] =
    useLazyGetEnvironmentsTotalsQuery();
  const { envId, activeAccountId: accountId } = useCore();
  const usersPage = RoutesBuilder.users({ envId, accountId });
  const formApi = useFormContext();
  const {
    formState: { isValid, isDirty },
  } = formApi;

  const setColor = useCallback(
    c => formApi.setValue('color', c, { shouldDirty: true }),
    [formApi],
  );

  const actionType = isNew ? 'Add' : 'Update';
  const validateName = useEnvironmentNameValidation(cross_id);

  const triggerDelete = useCallback(async () => {
    await getTotals({
      envId: getOId(cross_id),
      selectedAccountId: accountId,
    });
    toggleDelete(true);
  }, [accountId, cross_id, getTotals, toggleDelete]);
  return (
    <Grid
      py={3}
      px={5}
      gap={4}
      bgColor="white"
      borderRadius={4}
      color="font-secondary"
    >
      <HStack>
        <Text>
          Admins are automatically added to this environment. Manage user
          permissions via
        </Text>
        <RiveryButton
          variant="link"
          target="_blank"
          label="Users Page"
          href={usersPage}
          {...{ ml: '-0.2rem!important' }}
        />
      </HStack>
      <Grid w="50%" flexDirection="column" gap={5}>
        <HStack w="100%">
          <Text fontSize="sm">Environment Name</Text>
          <Box flex={1}>
            <Input
              name="environment_name"
              label="Environment Name"
              aria-label="Environment Name"
              hideLabel={true}
              required
              validate={validateName}
              api={formApi}
              chakra
            />
          </Box>
        </HStack>
        <Box>
          <HStack>
            <Box w="120px">
              <Text fontSize="sm">Description</Text>
              <Text fontSize="xs">(optional)</Text>
            </Box>
            <Box flex={1}>
              <Input
                fontSize="sm"
                mt={1.5}
                name="description"
                aria-label="description"
                _focus={{ boxShadow: '0 0 0 2px #54489D' }}
                as={Textarea}
                chakra
                api={formApi}
              />
            </Box>
          </HStack>
        </Box>
        <HStack>
          <Text fontSize="sm">Set Color</Text>
          {colors.map(c => (
            <Box
              h={7}
              key={c}
              borderRadius={50}
              p={0.5}
              border="2px solid"
              borderColor={c === formApi.watch('color') ? 'border' : 'white'}
              bg="transparent"
            >
              <Box
                aria-label={`color-${c}`}
                borderRadius={50}
                bg={c}
                w={5}
                h={5}
                cursor="pointer"
                onClick={() => setColor(c)}
              />
            </Box>
          ))}
        </HStack>
      </Grid>
      <HStack
        mt={4}
        borderTop="1px solid"
        borderTopColor="gray.300"
        pt={4}
        pb={1}
        justify={isNew ? 'end' : 'space-between'}
      >
        {!isNew ? (
          <RiveryButton
            aria-label="delete-environment"
            size="sm"
            label="Delete Environment"
            colorScheme="danger"
            variant="outlined-primary"
            onClick={triggerDelete}
          />
        ) : null}
        <HStack gap={3}>
          <RiveryButton
            aria-label="cancel-and-close"
            size="sm"
            variant="text"
            label="Cancel"
            onClick={onCancel}
          />
          <RiveryButton
            variant="outlined-primary"
            size="sm"
            label={`${actionType} Environment`}
            aria-label={`${actionType}-environment`}
            type="submit"
            disabled={!isValid && !isDirty}
          />
        </HStack>
      </HStack>
      <ModalContent
        show={deleteModal}
        environmentTotals={environmentTotals}
        env_id={getOId(cross_id)}
        onClose={toggleDelete}
        isDefaultEnvironment={isDefault}
        deleteEnv={deleteEnv}
      />
    </Grid>
  );
}
