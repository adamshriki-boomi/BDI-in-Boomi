import { GridItem } from '@chakra-ui/react';
import { Text } from 'components';
import { CustomSelectForm, Input } from 'components/Form';
import { FilterType } from 'layout/Sidebar/components/RiveryFilterBuilder/consts';
import {
  getColumnInfo,
  getOperatorsByColumnType,
} from 'layout/Sidebar/components/RiveryFilterBuilder/FilterBuilderLogic';
import { compare } from 'utils/array.utils';

export function FiltersOperatorDropdown({ index, field }) {
  const { value, onChange } = field;
  const options = [
    { value: 'and', label: 'And' },
    { value: 'or', label: 'Or' },
  ];

  switch (index) {
    case 0:
      return (
        <GridItem>
          <Text textStyle="M7" pl={2}>
            When
          </Text>
        </GridItem>
      );
    case 1:
      const selectedOption = options.find(compare('value', value)) || null;
      return (
        <GridItem>
          <CustomSelectForm
            options={options}
            isMulti={false}
            controlId="filters-operator"
            onChange={selectedOption => onChange((selectedOption as any).value)}
            value={selectedOption}
            name="filtersOperator"
          />
        </GridItem>
      );
    default:
      return (
        <GridItem>
          <Text textStyle="M7" textTransform="capitalize" pl={2}>
            {value}
          </Text>
        </GridItem>
      );
  }
}

export function FilterColumnSelect({ index, filterColumns, value, setValue }) {
  const options = filterColumns.map(({ label, value }) => ({
    value,
    label,
  }));

  const selectedOption = options.find(opt => opt.value === value) || null;

  const handleChange = selectedOption => {
    setValue(`filters.${index}.field`, selectedOption.value);
    setValue(`filters.${index}.operator`, undefined);
    setValue(`filters.${index}.value`, undefined);

    // Check if the selected column is static and set its operator
    const column = filterColumns.find(compare('value', selectedOption.value));
    if (column?.isStatic && column?.staticValue) {
      setValue(`filters.${index}.operator`, column.staticValue);
    }
  };

  return (
    <GridItem>
      <CustomSelectForm
        options={options}
        controlId={`filter-column-${index}`}
        isMulti={false}
        placeholder="Field"
        isClearable={false}
        ariaLabel={`filters.${index}.field`}
        value={selectedOption}
        onChange={handleChange}
      />
    </GridItem>
  );
}

export function FilterOperatorSelect({
  index,
  value,
  setValue,
  columnType,
  filterColumns,
  selectedColumnValue,
}) {
  const options = getOperatorsByColumnType(columnType);
  const columnInfo = getColumnInfo(selectedColumnValue, filterColumns);

  const staticOption =
    columnInfo.isStatic && columnInfo.staticValue
      ? options.find(opt => opt.value === columnInfo.staticValue)
      : null;

  const selectedOption = columnInfo.isStatic
    ? staticOption
    : options.find(opt => opt.value === value) || null;

  const handleChange = selectedOption => {
    setValue(`filters.${index}.operator`, selectedOption.value);
    setValue(`filters.${index}.value`, undefined);
  };

  return (
    <GridItem>
      <CustomSelectForm
        options={options}
        controlId={`filter-operator-${index}`}
        isMulti={false}
        placeholder="Operator"
        isClearable={false}
        ariaLabel={`filters.${index}.operator`}
        value={selectedOption}
        onChange={handleChange}
        isDisabled={columnInfo.isStatic}
      />
    </GridItem>
  );
}

export function FilterValueInput({ index, value, setValue, selectedColumn }) {
  if (!selectedColumn || selectedColumn.type === FilterType.IS) {
    const selectedOption =
      selectedColumn?.values.find(opt => opt.value === value) || null;

    return (
      <GridItem>
        <CustomSelectForm
          options={selectedColumn?.values}
          controlId={`filter-value-${index}`}
          isMulti={false}
          placeholder="Value"
          isClearable={false}
          name={`filters.${index}.value`}
          value={selectedOption}
          onChange={selectedOption =>
            setValue(`filters.${index}.value`, (selectedOption as any).value)
          }
        />
      </GridItem>
    );
  }
  return (
    <Input
      type="Enter value"
      onChange={e => setValue(`filters.${index}.value`, e.target.value)}
      value={value || ''}
      chakra
      label="Value"
      hideLabel
      size="md"
      fontSize="xs"
      ariaLabel={`filters.${index}.value`}
    />
  );
}
