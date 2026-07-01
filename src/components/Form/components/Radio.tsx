import {
  Button,
  ButtonGroup,
  ButtonGroupProps,
  Flex,
  useRadio,
  useRadioGroup,
} from 'components';
import { InputLabel } from 'components/Form/components/Input';
import React, { ReactElement } from 'react';
import { Controller, UseFormReturn } from 'react-hook-form';
import { resolveBooleanValue } from './RadioList';

export interface RadioProps extends RadioGroupProps {
  api?: Partial<UseFormReturn>;
}
export function Radio({
  label: radioLabel,
  name,
  values,
  api,
  ...rest
}: RadioProps) {
  return (
    <Controller
      name={name}
      control={api?.control}
      render={({ field: { value, onChange } }) => {
        return (
          <RadioGroup
            label={radioLabel}
            name={name}
            values={values}
            checked={value}
            onChange={onChange}
            {...rest}
          />
        );
      }}
    />
  );
}

interface RadioGroupProps extends ButtonGroupProps {
  label?: string;
  name: string;
  values: {
    label: string | ReactElement;
    value: string | boolean;
    // value: string;
    ariaLabel?: string;
    disabled?: any;
  }[];
  /*
    should be used when control is not controlled via a useForm
   */
  checked?: string;
  containerClassName?: string;
  onChange?: (value: any) => any;
  className?: string;
  children?: any;
  allowNoValue?: boolean;
}
export function RadioGroup({
  label: radioLabel,
  name,
  values,
  checked,
  onChange,
  className,
  defaultValue = null,
  ...rest
}: RadioGroupProps) {
  // 🧪 WHY? html "input" cannot accept a boolean value
  const isBoolean = typeof values[0]?.value === 'boolean';
  const { getRootProps, getRadioProps, htmlProps } = useRadioGroup({
    name,
    value: checked,
    defaultValue: defaultValue as string,
    onChange: value => {
      onChange(isBoolean ? resolveBooleanValue(value) : value);
    },
  });
  const groupProps = getRootProps(htmlProps);

  return (
    <Flex flexDir="column" className={className}>
      {radioLabel && (
        <InputLabel
          htmlFor={name}
          color="font"
          label={radioLabel}
          labelStyle={{ pb: 1 }}
          fontSize="sm"
          textTransform="capitalize"
        />
      )}
      <ButtonGroup
        {...groupProps}
        isAttached
        variant="outline"
        size="sm"
        aria-label={radioLabel || name}
        {...rest}
      >
        {values.map(({ value, ...buttonProps }, idx) => {
          return (
            <RadioBox
              key={`${name}-${value}`}
              idx={idx}
              length={values.length}
              {...getRadioProps({ value: String(value) })}
              {...buttonProps}
            />
          );
        })}
      </ButtonGroup>
    </Flex>
  );
}

function RadioBox({ label, ariaLabel, ...props }: any) {
  const { isChecked } = props;
  const { getInputProps, getCheckboxProps } = useRadio(props);
  const input = getInputProps();
  const checkbox = getCheckboxProps();
  const isDisabled = props?.disabled;
  return (
    <Button
      as="label"
      aria-label={ariaLabel}
      cursor="pointer"
      borderColor="border-secondary"
      bgColor={isChecked ? 'background-selected-weak' : 'white'}
      color={isChecked ? 'background-selected' : isDisabled ? 'font' : 'action'}
      borderRightWidth={props.idx < props.length - 1 && '2px'}
      borderRightColor={props.idx < props.length - 1 && 'transparent'}
      _active={{
        transition: 'border-width 0.2s ease',
        border: '2px',
        borderRightWidth: props.idx < props.length - 1 && '3px!important',
        borderColor: isChecked
          ? 'background-selected'
          : 'background-action-hover',
      }}
      _hover={{
        bgColor: isChecked
          ? 'background-selected-weak'
          : isDisabled
          ? 'background-secondary'
          : 'background-secondary',
        borderColor: isChecked
          ? 'background-selected'
          : 'background-action-hover',
        borderRightColor: isChecked
          ? 'background-selected'
          : 'background-action-hover',
        color: isChecked
          ? 'background-selected'
          : isDisabled
          ? 'font-disabled'
          : 'font',
      }}
      disabled={props?.disabled}
      fontWeight="normal"
      fontSize="inherit"
      textTransform="capitalize"
      {...(props?.children && { paddingInlineStart: '14px' })}
    >
      <input {...input} disabled={isDisabled} />
      <Flex alignItems="center" {...checkbox}>
        {props.children}
        {label}
      </Flex>
    </Button>
  );
}
