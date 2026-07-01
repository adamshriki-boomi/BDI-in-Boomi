import React from 'react';
import { Controller } from 'react-hook-form';
import { Text } from '@chakra-ui/react';
import CreatableSelect from 'react-select/creatable';

type Option = { label: string; value: string };
export type TagInputProps = {
  name: string;
  // TODO discuss about data provider or how to provide these options
  options?: Option[];
  api: any;
  // for other useful props
  [key: string]: any;
};

export function TagInput({
  control,
  name,
  label,
  options = [],
  api,
  ...props
}: TagInputProps) {
  return (
    <div>
      {/* I changed it because it was throwing errors for incorrect usage of <label>,
        eitherway it seems like it's not used anywhere in the codebase. will remove after proper validation */}
      <Text>{label}</Text>
      <Controller
        control={api.control}
        name={name}
        render={({ field: { value, onChange, ref } }) => (
          <CreatableSelect
            isMulti
            onChange={onChange}
            options={options}
            value={value}
            ref={ref}
          />
        )}
      />
    </div>
  );
}
