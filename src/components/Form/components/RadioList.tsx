import { Radio, RadioGroup } from '@chakra-ui/react';
import React, { ReactElement, useCallback } from 'react';
import { UseFormReturn } from 'react-hook-form';

export interface RadioListProps extends RadioListGroupProps {
  api?: Partial<UseFormReturn>;
}
interface RadioListGroupProps {
  id: string;
  label?: string;
  name: string;
  values: {
    label: string | ReactElement;
    value: string | boolean;
  }[];
  /*
    should be used when control is not controlled via a useForm
   */
  checked?: string | boolean;
  containerClassName?: string;
  onChange?: (value: any) => any;
}
export function RadioListGroup({
  id,
  label: radioLabel,
  name,
  values,
  checked,
  onChange,
  ...rest
}: RadioListGroupProps) {
  // 🧪 WHY? html "input" cannot accept a boolean value
  const selectedValue = String(checked || values[0]?.value);
  const isBoolean = typeof values[0]?.value === 'boolean';
  const onRadioChange = useCallback(
    value => {
      onChange(isBoolean ? resolveBooleanValue(value) : value);
    },
    [isBoolean, onChange],
  );

  return (
    <RadioGroup
      role="radiogroup"
      size="sm"
      gap="2"
      display="flex"
      aria-label={radioLabel || name}
      value={selectedValue}
      onChange={onRadioChange}
      {...rest}
    >
      {values.map(({ label, value }) => (
        <RadioInput
          key={`${id}-${name}-${value}`}
          // name={`radio-list-${name}-${id}`}
          // checked={isSelectedeValue(value)}
          // onChange={onChange}
          label={label}
          value={value}
        />
      ))}
    </RadioGroup>
  );
}

function RadioInput({ label, value }) {
  return (
    <Radio
      // key={`${name}-${value}`}
      // name={`radio-list-${name}`}
      // id={`${name}-${label}-${value}`}
      value={String(value)}
      // aria-checked={checked}
      aria-describedby={label}
    >
      {label}
    </Radio>
  );
}

export const resolveBooleanValue = (value: string) => {
  return value === 'true';
};
