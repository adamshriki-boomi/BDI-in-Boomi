import React from 'react';
import { Controller } from 'react-hook-form';
import { pluck } from 'utils/array.utils';
import { getError } from './ControlFeedback';
import {
  SelectFormGroup,
  SelectFormGroupProps,
} from './SelectFormGroup/SelectFormGroup';

const getMultiValue = (arr, propGetter) => arr.map(propGetter);
export interface FormSelectProps extends SelectFormGroupProps<any> {
  api?: any;
  /**
   * a formatter function to formate a value before it is changed into the controller's value
   */
  formatValueAs?: (value: any) => any;
  required?: boolean | ((value: any) => boolean) | any;
  disabled?: boolean;
}
export function FormSelect({
  name,
  api,
  controlId,
  options,
  isMulti = false,
  disabled = false,
  onSelect = undefined,
  onChange = null,
  formatValueAs = undefined,
  selectProps = null,
  required = false,
  metadataResponse = null,
  ...rest
}: FormSelectProps & { onSelect?: any }) {
  const getValue = selectProps?.getOptionValue || pluck<any, string>('value');
  if (metadataResponse) {
    rest['onRefresh'] = rest.onRefresh ?? metadataResponse.refetch;
    rest['isLoading'] = rest.isLoading ?? metadataResponse.isFetching;
    rest['error'] = rest.error ?? metadataResponse?.error?.['message'];
    rest['pullRequestId'] = metadataResponse?.error?.['pullRequestId'];
  }

  const defaultValueProp = rest?.defaultValue
    ? { defaultValue: rest.defaultValue }
    : {};
  const rules =
    typeof required === 'function' ? { validate: required } : { required };
  return (
    <Controller
      name={name}
      control={api?.control}
      rules={rules}
      {...defaultValueProp}
      render={({ field: { value, onChange: formOnChange } }) => (
        <SelectFormGroup
          options={options}
          selectProps={selectProps}
          controlId={controlId}
          onChange={option => {
            onSelect && onSelect(option);
            const value = isMulti
              ? getMultiValue(option, getValue)
              : getValue(option);
            formOnChange(formatValueAs ? formatValueAs(value) : value);
            onChange && onChange(value);
          }}
          value={
            Array.isArray(options)
              ? Array.isArray(value)
                ? findOptionsByValues(options, value, getValue)
                : findOptionByValue(options, value, getValue)
              : undefined
          }
          isDisabled={disabled}
          validationMessage={getError(api, name)?.message}
          isMulti={isMulti}
          isRequired={Boolean(required)}
          // defaultValueProp={defaultValueProp}
          {...rest}
          maxMenuHeight={200}
        />
      )}
    />
  );
}

type ValueGetter = (item: any) => any;
const findOptionByValue = (
  options: any[],
  value: string,
  getValue: ValueGetter,
) => options?.find(option => Boolean(getValue(option) === value));
const findOptionsByValues = (
  options: any[],
  values: string[],
  getValue: ValueGetter,
) => {
  return values
    ?.reduce(
      (result, value) => [
        ...result,
        findOptionByValue(options, value, getValue),
      ],
      [],
    )
    .filter(Boolean);
};
