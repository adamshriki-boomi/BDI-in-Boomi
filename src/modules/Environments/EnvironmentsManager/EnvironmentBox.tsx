import {
  Center,
  Collapse,
  Flex,
  Grid,
  HStack,
  Icon,
  Text,
} from '@chakra-ui/react';
import { ChevronDown, ChevronUp, EnvironmentsIcon } from 'components';
import RiveryButton from 'components/Buttons/RiveryButton';
import { useCallback } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useToggle } from 'react-use';
import { useCore } from 'store/core';
import { EnvironmentForm } from './EnvironmentForm';

export function EnvironmentBox({
  env = null,
  open = false,
  clearNewBox = null,
  action,
  deleteEnv = null,
}) {
  const { selectedAccountId } = useCore();
  const {
    cross_id = null,
    color = null,
    environment_name = null,
    is_default = false,
    description = null,
  } = env ?? {};
  const [show, toggleShow] = useToggle(open);
  const [showHover, toggleHover] = useToggle(false);
  const isNew = Boolean(clearNewBox);
  const formApi = useForm({
    defaultValues: {
      environment_name: environment_name ?? 'New Environment',
      color: color ?? 'gray.400',
      description: description ?? '',
    },
    mode: 'onChange',
  });

  const { handleSubmit } = formApi;

  const envColor = formApi.watch('color');
  const envName = formApi.watch('environment_name');

  const onCancel = useCallback(() => {
    formApi.reset();
    toggleShow(false);
    if (clearNewBox) clearNewBox();
  }, [clearNewBox, formApi, toggleShow]);

  const setAsDefault = useCallback(async () => {
    action({ selectedAccountId, id: cross_id, is_default: true });
    toggleHover(false);
  }, [action, cross_id, selectedAccountId, toggleHover]);

  const submitEnvironment = useCallback(
    async formData => {
      const { environment_name, color, description } = formData;
      if (isNew) {
        action({
          selectedAccountId,
          name: environment_name,
          color,
          description,
          is_default: false,
        });
      } else {
        action({
          selectedAccountId,
          id: cross_id,
          environment_name,
          color,
          description,
          is_default,
        });
      }
      clearNewBox && clearNewBox();
    },
    [action, clearNewBox, cross_id, isNew, is_default, selectedAccountId],
  );

  return (
    <Grid
      minH="55px"
      borderRadius={4}
      border="1px solid"
      borderColor={`${showHover ? 'font' : 'gray.300'}`}
      bg={show && !isNew ? 'background-secondary' : 'gray.50'}
      alignItems="flex-start"
      mb={3}
      onMouseEnter={() => toggleHover(true)}
      onMouseLeave={() => toggleHover(false)}
      w="100%"
    >
      <Flex
        h="55px"
        borderBottom={show || isNew ? '1px solid' : 0}
        borderBottomColor="gray.300"
        alignItems="center"
        onClick={toggleShow}
        cursor="pointer"
      >
        <Center
          w="50px"
          h="100%"
          borderStartStartRadius={3}
          borderEndStartRadius={!show && !isNew ? 3 : 0}
          bg={envColor}
          mr={5}
        >
          <Icon
            as={EnvironmentsIcon}
            w={5}
            h={5}
            color={envColor !== 'gray.400' ? 'white' : 'icon'}
          />
        </Center>
        <Text
          aria-label={`${envName}-header`}
          fontWeight={!environment_name || showHover ? 'medium' : 'normal'}
          fontSize="md"
          whiteSpace="nowrap"
          overflow="hidden"
          textOverflow="ellipsis"
          width="50vw"
        >
          {envName}
        </Text>
        <HStack ml="auto" mr={2}>
          {is_default ? (
            <Text color="font-secondary">Default</Text>
          ) : (
            showHover &&
            !isNew && (
              <RiveryButton
                size="sm"
                label="Set As Default"
                variant="default"
                onClick={e => {
                  e.stopPropagation();
                  setAsDefault();
                }}
              />
            )
          )}
          {!isNew ? <Icon as={show ? ChevronUp : ChevronDown} /> : null}
        </HStack>
      </Flex>
      <CollapseWrapper show={show} isNew={isNew}>
        <FormProvider {...formApi}>
          <form onSubmit={handleSubmit(submitEnvironment)}>
            <EnvironmentForm
              onCancel={onCancel}
              isNew={isNew}
              cross_id={cross_id}
              isDefault={is_default}
              deleteEnv={deleteEnv}
            />
          </form>
        </FormProvider>
      </CollapseWrapper>
    </Grid>
  );
}

function CollapseWrapper({ isNew, show, children }) {
  return isNew ? (
    children
  ) : (
    <Collapse in={show} animateOpacity>
      {children}
    </Collapse>
  );
}
