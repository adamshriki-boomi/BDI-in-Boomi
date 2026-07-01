import { FormSelect } from 'components/Form';
import * as React from 'react';
import { UseFormReturn } from 'react-hook-form';

type NotNullTestProps = {
  options: any[];
  api: Partial<UseFormReturn>;
};

export function NotNullTest({ options, api }: NotNullTestProps) {
  const onValidate = React.useCallback(
    value => value?.length > 0 || 'Select a column',
    [],
  );
  return (
    <FormSelect
      label="The following columns should not be null"
      ariaLabel="parameters"
      className="simple-multi-value"
      chakra
      options={options}
      name="test_schema"
      controlId="test parameters"
      placeholder="Select / Search Column"
      isMulti={false}
      // allowSelectAll
      hideSelectedOptions={false}
      closeMenuOnSelect
      formatValueAs={value => [value]}
      api={api}
      required={onValidate}
    />
  );
}
