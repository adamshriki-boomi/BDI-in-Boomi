import {
  FormErrorMessage,
  HStack,
  Icon,
  Input as ChakraInput,
  Text,
} from '@chakra-ui/react';
import { Flex } from 'components';
import { CloseBgSolid } from 'components/Icons/components';
import * as React from 'react';
import { Controller } from 'react-hook-form';
import { InputProps, InputTypes } from './Input.types';
import { InputNumber } from './InputNumber';
import { useInputDraftHandler } from './useInputDraftHandler';

type InputRendererProps = Pick<
  InputProps,
  | 'type'
  | 'name'
  | 'label'
  | 'chakra'
  | 'placeholder'
  | 'defaultErrorMessage'
  | 'control'
  | 'required'
  | 'pattern'
  | 'validate'
  | 'min'
  | 'max'
  | 'onChange'
  | 'size'
> & {
  isError?: boolean;
  value?: string | number;
  defaultValue?: any;
  paddingRight?: number | string;
  absoluteErrorPosition?: boolean;
};

/**
 * A React-Hook-Form `controller` wrapper for an `input` element (react-form-hook ready)
 * NOTE:
 * when hook form's `control` prop is passed, the controller is used
 * otherwise, a simple <input /> is rendered with given props.
 * @returns <input />
 */
export const InputRenderer = React.forwardRef<any, InputRendererProps>(
  function InputRenderer(
    {
      isError = false,
      control,
      required = false,
      validate,
      name,
      label,
      pattern,
      min,
      max,
      chakra = false,
      defaultValue = '',
      size = 'md',
      ...inputProps
    },
    inputRef,
  ) {
    const { draftProps, hasError } = useInputDraftHandler(inputProps?.value, {
      enableHandler: !control && pattern,
      pattern,
      required,
      onChange: inputProps?.onChange,
    });
    const registerConfig = {
      ...(required ? { required: `${label} is required` } : {}),
      ...(pattern
        ? {
            validate: value =>
              pattern.test(value) || (typeof required === 'string' && required),
          }
        : {}),
      ...(validate ? { validate } : {}),
      max,
      min,
    };
    return (
      <InputControl
        label={label}
        name={name}
        control={control}
        registerConfig={registerConfig}
        inputRef={inputRef}
        isInvalid={hasError || isError}
        size={size}
        chakra={chakra}
        {...inputProps}
        {...draftProps}
      />
    );
  },
);
export function resolveNumber(event) {
  return event ? Number(event) : null;
}
function InputControl({
  name,
  control,
  registerConfig,
  label,
  inputRef,
  chakra,
  absoluteErrorPosition = false,
  ...rest
}) {
  const commonProps = {
    placeholder: rest?.placeholder ?? label,
    'aria-label': rest?.['aria-label'] ?? label ?? name ?? rest?.placeholder,
    variant: Boolean(chakra) ? 'chakra' : 'rivery',
  };
  const isTypeNumber = rest.type === InputTypes.NUMBER;
  const InputComponent = isTypeNumber ? InputNumber : ChakraInput;
  return control ? (
    <Controller
      control={control}
      name={name}
      rules={registerConfig}
      render={({
        field: { value = '', onChange, ref },
        fieldState: { error },
      }) => {
        const isInvalid = Boolean(error?.message) || rest.isInvalid;
        return (
          <Flex flexDir="column" flex="1">
            <InputComponent
              isInvalid={isInvalid}
              ref={ref}
              value={value}
              {...rest}
              {...commonProps}
              onChange={event => {
                const targetValue = isTypeNumber
                  ? resolveNumber(event)
                  : getValueByType(event);
                onChange(targetValue);
                rest?.onChange && rest?.onChange(targetValue);
              }}
            />
            {isInvalid ? (
              <FormErrorMessage
                display="block"
                position={absoluteErrorPosition ? 'absolute' : 'unset'}
                top={absoluteErrorPosition && '34px'}
                mt={!absoluteErrorPosition && '2px'}
              >
                <HStack>
                  <Icon as={CloseBgSolid} boxSize={4} />
                  <Text>{error?.message}</Text>
                </HStack>
              </FormErrorMessage>
            ) : null}
          </Flex>
        );
      }}
    />
  ) : (
    <Flex flexDir="column" h="full" w="full">
      <InputComponent name={name} ref={inputRef} {...rest} {...commonProps} />
      {rest?.isInvalid && (
        <HStack color="red.100" fontSize="xs">
          <Icon as={CloseBgSolid} boxSize={4} />
          <Text>{rest.validationError ?? rest.defaultErrorMessage}</Text>
        </HStack>
      )}
    </Flex>
  );
}

function getValueByType(e: any) {
  return e.currentTarget?.type === InputTypes.NUMBER
    ? e.currentTarget.valueAsNumber
    : e.currentTarget.value;
}
