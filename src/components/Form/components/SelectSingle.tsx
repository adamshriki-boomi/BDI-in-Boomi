import * as React from 'react';
import { pluck } from 'utils/array.utils';
import { FormSelect } from './FormSelect';

export type SelectSingleProps = {
  name: string;
  options: any;
  value_column?: string;
  name_column?: string;
  display_name: string;
  api: any;
  disabled?: boolean;
  placeholder?: string;
};

export function SelectSingle({
  name,
  api,
  display_name,
  name_column = 'name',
  value_column = 'id',
  options,
  ...rest
}: SelectSingleProps) {
  const selectProps = {
    getOptionLabel: pluck<any, string>(name_column),
    getOptionValue: pluck<any, string>(value_column),
  };
  return (
    <FormSelect
      name={name}
      api={api}
      options={options}
      label={display_name}
      controlId={name}
      selectProps={selectProps}
      {...rest}
    />
  );
}
