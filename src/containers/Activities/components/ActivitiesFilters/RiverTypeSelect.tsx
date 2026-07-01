import { RiverTypeQuerySelect } from 'components/Form/components/FrequentComponents';
import React from 'react';
import { useRiverTypes, useRiverTypesLoader } from 'store/riverTypes';
import { pluck } from 'utils/array.utils';

const getOptionValue = pluck<any, string>('type');
const selectProps = {
  getOptionLabel: pluck<any, string>('title'),
  getOptionValue,
};

export function RiverTypeSelect({ onChange, name, value, ...rest }) {
  useRiverTypesLoader();
  const { riverTypes } = useRiverTypes();
  const selectedValue = riverTypes?.filter(({ type }) => value?.includes(type));
  const handleChange = options => {
    if (typeof options === 'string') {
      onChange(value.filter(val => val !== options));
      return;
    }
    onChange(options.map(getOptionValue));
  };

  return (
    <RiverTypeQuerySelect
      name={name}
      options={riverTypes}
      selectProps={selectProps}
      value={selectedValue}
      onChange={handleChange}
      isMulti={true}
      {...rest}
    />
  );
}
