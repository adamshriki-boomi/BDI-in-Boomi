import { Flex, Icon } from '@chakra-ui/react';
import RiveryButton from 'components/Buttons/RiveryButton';
import React from 'react';
import { MdEdit } from 'react-icons/md';
import { useToggle } from 'react-use';
import { Input, InputProps, InputTypes } from './Input';

export interface SecretProps extends InputProps {}

export function Secret({ api, name, ...props }: SecretProps) {
  const secretExistsKey = `${name}_exists`;
  const secretExistsDefault = props && api && api.watch(secretExistsKey);
  const [isDisabled, toggleIsDisabled] = useToggle(secretExistsDefault);
  return (
    <Flex flexGrow="1" alignItems="flex-end" gap={1}>
      {!secretExistsDefault && !isDisabled ? (
        <Input
          {...props}
          type={InputTypes.PASSWORD}
          allowReveal={false}
          api={api}
          name={name}
          placeholder={props?.label}
          autoComplete="new-password"
        />
      ) : (
        <>
          <Input
            {...props}
            disabled={true}
            register={() => undefined}
            placeholder="******"
          />
          <RiveryButton
            label="Edit"
            leftIcon={
              <Icon as={MdEdit} w={5} h={5} color="background-selected" />
            }
            height="32px"
            variant="outlined-primary"
            onClick={() => {
              toggleIsDisabled(false);
              api.setValue(secretExistsKey, false);
            }}
          />
        </>
      )}
    </Flex>
  );
}
