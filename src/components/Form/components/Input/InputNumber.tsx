import {
  Icon,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputProps,
  NumberInputStepper,
} from '@chakra-ui/react';
import { ChevronDown, ChevronUp } from 'components/Icons';
import * as React from 'react';

interface InputNumberProps extends NumberInputProps {
  fieldHeight?: string;
  display_name?: string;
  inputProps?: any;
  placeholder?: string;
  secondaryLabel?: string;
}

export const InputNumber = React.forwardRef(function InputNumber(
  {
    placeholder,
    display_name,
    value,
    fieldHeight,
    secondaryLabel,
    ...props
  }: InputNumberProps,
  ref: any,
) {
  return (
    <NumberInput
      value={value ?? ''}
      min={props?.inputProps?.min}
      max={props?.inputProps?.max}
      {...props}
    >
      <NumberInputField
        ref={ref}
        placeholder={placeholder}
        borderWidth="1px"
        borderRadius={4}
        paddingInlineStart="3"
        paddingInlineEnd="3"
        fontSize="14px"
        borderColor="border-secondary"
        h={fieldHeight ?? 'default'}
        sx={{
          '&:hover': {
            borderColor: 'background-action-hover',
            boxShadow: 'none',
          },
          '&:focus': {
            borderColor: 'background-selected',
            boxShadow: 'none',
          },
        }}
      />
      <NumberInputStepper>
        <NumberIncrementStepper>
          <Icon as={ChevronUp} boxSize={3} />
        </NumberIncrementStepper>
        <NumberDecrementStepper>
          <Icon as={ChevronDown} boxSize={3} />
        </NumberDecrementStepper>
      </NumberInputStepper>
    </NumberInput>
  );
});
