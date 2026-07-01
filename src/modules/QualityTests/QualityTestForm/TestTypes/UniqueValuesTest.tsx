import { Checkbox, HStack } from 'components';
import { FormSelect } from 'components/Form';
import * as React from 'react';
import { UseFormReturn } from 'react-hook-form';

type NotNullTestProps = {
  /**
   * type id
   */
  options: any[];
  api: Partial<UseFormReturn>;
};

export function UniqueValuesTest({ options, api }: NotNullTestProps) {
  const onValidate = React.useCallback(
    value => value?.length > 0 || 'Select at least one column',
    [],
  );
  return (
    <FormSelect
      label="The following columns should be unique"
      ariaLabel="parameters"
      className="simple-multi-value"
      chakra
      options={options}
      name="test_schema"
      controlId="test parameters"
      placeholder="Select / Search Column"
      components={customComponents as any}
      isMulti
      // allowSelectAll
      hideSelectedOptions={false}
      closeMenuOnSelect={false}
      api={api}
      required={onValidate}
    />
  );
}

const CustomOption = ({ value, label, isSelected }) => {
  return (
    <HStack>
      <Checkbox
        mr={2}
        defaultValue={value}
        defaultChecked={isSelected}
        onChange={() => null}
      />
      <span>{label}</span>
    </HStack>
  );
};

const CustomValueComponent = ({ children: currentValue }) => {
  return (
    <div className="multi-option-div">
      {currentValue}
      <span>,</span>{' '}
    </div>
  );
};

const customComponents = {
  Option: CustomOption,
  MultiValueLabel: CustomValueComponent,
};
