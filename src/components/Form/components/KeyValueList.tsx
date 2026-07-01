import { Flex, IconButton } from 'components';
import RiveryButton from 'components/Buttons/RiveryButton';
import React from 'react';
import { FieldError, useFieldArray } from 'react-hook-form';
import { MdClose } from 'react-icons/md';
import { useToggle } from 'react-use';
import { RiverySwitch } from '.';
import { Input, InputTypes } from './Input';

export interface KeyValueListProps {
  label: string;
  name: string;
  type?: string;
  keys?: any[];
  /*
    sets 'is_from_oauth2' to true for each NEW item
  */
  addAuth?: boolean;
  errors?: { [name: string]: Partial<FieldError> };
  api: any; // react-hook-form api
}
export function KeyValueList({
  label,
  name,
  type = 'key-value',
  addAuth = false,
  errors = {},
  api,
  ...rest
}: KeyValueListProps) {
  const { fields, append, remove } = useFieldArray({
    control: api?.control,
    name,
  });

  const onAddField = () =>
    append({
      is_from_oauth2: addAuth,
      is_password: false,
      key: '',
      value: '',
    });
  return (
    <Flex flexDir="column">
      {fields?.map((field, index) => (
        <KeyValueItem
          key={`kv-item-${field.id}`}
          field={field}
          index={index}
          name={name}
          onRemove={() => remove(index)}
          api={api}
        />
      ))}
      <div>
        <RiveryButton label="Add" type="button" onClick={onAddField} />
      </div>
    </Flex>
  );
}

function KeyValueItem({ field, name, index, onRemove, api }) {
  const [hidePassword, setHidePassword] = useToggle(field.is_password);
  return (
    <Flex alignItems="center" gap={4} mb={3}>
      <Input
        api={api}
        label="Key"
        name={`${name}[${index}].key`}
        defaultValue={`${field.key}`}
      />
      <Input
        api={api}
        label="Value"
        name={`${name}[${index}].value`}
        defaultValue={`${field.value}`}
        type={hidePassword ? InputTypes.PASSWORD : InputTypes.PASSWORD}
      />
      <RiverySwitch
        label="Is Password"
        name={`${name}[${index}].is_password`}
        isChecked={field.is_password}
        onChange={setHidePassword}
      />
      <IconButton
        onClick={onRemove}
        icon={<MdClose size="24" />}
        variant="outlined-primary"
        colorScheme="danger"
        aria-label={`remove key ${field.value}`}
        border="0"
      />
    </Flex>
  );
}
