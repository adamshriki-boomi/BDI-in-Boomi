import { Flex, Text } from 'components';
import { SelectFormGroup } from 'components/Form';
import { IncrementColumn } from 'modules/SourceTarget/store';
import { useEffect } from 'react';
import { Controller, useWatch } from 'react-hook-form';
import { useEffectOnce } from 'react-use';
import { compare, pluck } from 'utils/array.utils';

export const IncrementalFieldSelectController = ({
  formApi,
  options,
  addCustomColumn,
  selectValueFn,
  isLoading = false,
  incColumns = [],
}) => {
  const currentIncrementalField = useWatch({
    control: formApi.control,
    name: 'table.incremental_field',
  });
  const incrementColumns =
    useWatch({
      control: formApi.control,
      name: 'definitions.increment_columns',
    }) || [];
  useEffect(() => {
    const current = currentIncrementalField;

    const found = incrementColumns.find(col => col.name === current);
    const isCustom = !!found?.is_custom;
    // Do not add this to the dependency array, it will cause an infinite loop
    formApi.setValue('table.is_custom_incremental', isCustom);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIncrementalField]);

  useEffectOnce(() => {
    if (
      currentIncrementalField &&
      !options.some(opt => opt.name === currentIncrementalField)
    ) {
      // Create a new column with the current field name and default values
      const newColumn = {
        name: currentIncrementalField,
        type: 'INTEGER',
        // incremental_type: 'datetime',
        is_default: false,
        is_custom: true,
      };

      // Add it to the options
      addCustomColumn([...options, newColumn]);
    }
  });
  const table = useWatch({ control: formApi.control, name: 'table' });

  return (
    <Controller
      control={formApi?.control}
      name="table.incremental_field"
      render={({ field: { value, onChange }, ...rest }) => {
        return (
          <IncrementalFieldSelect
            options={options}
            onChange={column => {
              const fieldValue = column?.name;

              if (!fieldValue) {
                const { date_range, epoch, running_number, ...rest } = table;
                formApi?.setValue('table', {
                  ...rest,
                  incremental_field: null,
                  incremental_type: undefined,
                });
                onChange(null);
              } else {
                /* prettier-ignore */
                /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
                const { date_range = {}, running_number = {}, epoch = {}, ...rest } = table;
                formApi?.setValue('table', {
                  ...rest,
                  //Set incremental type on table when incremental field is changed
                  incremental_type: incColumns?.find(
                    compare('name', fieldValue),
                  )?.incremental_type,
                });
                onChange(fieldValue);
              }
            }}
            value={selectValueFn(value)}
            isLoading={isLoading}
            addCustomColumn={addCustomColumn}
          />
        );
      }}
    />
  );
};
const IncrementalFieldSelect = ({
  options,
  value,
  onChange,
  isLoading,
  addCustomColumn,
  ...props
}) => {
  const handleAddOption = (newValue: string) => {
    const newColumn = {
      name: newValue,
      type: 'INTEGER',
      is_default: false,
      is_custom: true,
    };
    addCustomColumn([...options, newColumn]);
    onChange({ name: newValue });
  };

  return (
    <Flex flexDirection="column">
      <Text textStyle="R8">Incremental Field</Text>
      <Text textStyle="R8" color="font-secondary">
        Please select or type an incremental field. For custom column name, type
        its name exactly as it appears in the schema
      </Text>
      <SelectFormGroup
        label="Incremental Field"
        showLabel={false}
        options={options}
        placeholder="Select..."
        controlId={`extract-method`}
        onChange={onChange}
        selectProps={incSelectProps}
        value={value}
        chakra
        withCreate
        onAddOption={handleAddOption}
        isLoading={isLoading}
        noOptionsLabel="There are no common incremental fields"
        isClearable
        components={{ ClearIndicator: null }}
        {...props}
      />
    </Flex>
  );
};
const incSelectProps = {
  getOptionLabel: pluck<IncrementColumn, string>('name'),
  getOptionValue: pluck<IncrementColumn, string>('name'),
} as any;
