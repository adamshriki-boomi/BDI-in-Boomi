import {
  Box,
  DeleteIcon,
  Flex,
  Icon,
  PlusIcon,
  RenderGuard,
  RiveryButton,
  Text,
} from 'components';
import { Grid, GridItem } from '@chakra-ui/react';
import * as React from 'react';
import { useController, useFieldArray } from 'react-hook-form';
import {
  FilterColumnSelect,
  FilterOperatorSelect,
  FiltersOperatorDropdown,
  FilterValueInput,
} from 'layout/Sidebar/components/RiveryFilterBuilder/FilterBuilderComponents';
import {
  applyFilters,
  getColumnType,
} from 'layout/Sidebar/components/RiveryFilterBuilder/FilterBuilderLogic';
import { useEffect, useState } from 'react';
import { FilterColumn } from 'layout/Sidebar/components/RiveryFilterBuilder/consts';
import { filterValidationSchema } from 'modules/SourceTarget/components/SchemaEditor/SchemaTables/components/bulk-actions/hooks';

export function RiveryFilterBuilder({
  formApi,
  filterColumns,
  dataSet,
  onOuterApply,
  onOuterClear,
}) {
  /**
   * A generic filter builder component that allows users to create and manage multiple filter conditions.
   * Each filter consists of a field selection, an operator, and a value.
   * @param {formApi} formApi - The form API object from react-hook-form.
   *    formApi should have an array of filters of type FilterValue[] and a filtersOperator of type 'and' | 'or'.
   * @filterColumns {FilterColumn[]} - The list of columns and their props to filter by, set it in the parent component.
   * @dataSet {Object} - the data we should filter, it should be a list of objects, each object should hold the keys like they appear in the filterColumns,
   *    and the values should be the actual values of the object. each object should have a boolean key 'isFilteredIn' that determines if the object is filtered in or not.
   * @onOuterApply {Function} - a callback function that should be called when the user clicks the apply button, it should receive the filtered data set and the
   *    parent component can then decide what to do with it.
   * @onOuterClear {Function} - a callback function that should alert the parent component that the user cleared the filters
   **/

  const [matchedCount, setMatchedCount] = useState(0);
  const [displayingResults, setDisplayingResults] = useState(false);
  const [isValid, setIsValid] = useState(true);
  useEffect(() => {
    const validateFilters = async () => {
      try {
        await filterValidationSchema.validate(
          {
            filters: formApi.watch('filters'),
            filtersOperator: formApi.watch('filtersOperator'),
          },
          { abortEarly: true },
        );
        setIsValid(true);
      } catch (err) {
        setIsValid(false);
      }
    };

    validateFilters();
  }, [formApi]);

  const { fields, append, remove, replace } = useFieldArray({
    name: 'filters',
    control: formApi.control,
  });

  const { field: filtersOperator } = useController({
    name: 'filtersOperator',
    control: formApi.control,
  });
  const deleteDisabled = fields.length === 1;

  const handleClear = () => {
    replace([{ field: undefined, operator: undefined, value: undefined }]);
    formApi.setValue('filtersOperator', 'and');
    setMatchedCount(0);
    setDisplayingResults(false);
    onOuterClear();
  };

  const handleApply = () => {
    const filters = formApi.watch('filters');
    const operator = formApi.watch('filtersOperator');

    const filteredDataSet = applyFilters(
      dataSet,
      filters,
      operator,
      filterColumns,
    );
    setMatchedCount(filteredDataSet.filter(item => item.isFilteredIn).length);
    setDisplayingResults(true);
    onOuterApply(filteredDataSet);
  };

  return (
    <Box
      width="full"
      maxH="450px"
      border="1px"
      borderColor="gray.200"
      borderRadius="4px"
      borderBottomRadius={displayingResults ? 0 : '4px'}
      overflow="auto"
      p={4}
    >
      <Grid
        templateColumns="80px 1fr 1fr 1fr 30px 30px"
        columnGap={2}
        rowGap={2}
        alignItems="center"
        justifyContent="center"
      >
        {fields.map((condition: FilterColumn & { id: string }, index) => (
          <React.Fragment key={condition.id}>
            <FiltersOperatorDropdown index={index} field={filtersOperator} />
            <FilterColumnSelect
              index={index}
              filterColumns={filterColumns}
              value={formApi.watch(`filters.${index}.field`)}
              setValue={formApi.setValue}
            />
            <FilterOperatorSelect
              index={index}
              columnType={getColumnType(
                formApi.watch(`filters.${index}.field`),
                filterColumns,
              )}
              value={formApi.watch(`filters.${index}.operator`)}
              setValue={formApi.setValue}
              filterColumns={filterColumns}
              selectedColumnValue={formApi.watch(`filters.${index}.field`)}
            />
            <FilterValueInput
              index={index}
              value={formApi.watch(`filters.${index}.value`)}
              setValue={formApi.setValue}
              selectedColumn={filterColumns.find(
                col => col.value === formApi.watch(`filters.${index}.field`),
              )}
            />
            <GridItem>
              <RiveryButton
                label={<Icon as={DeleteIcon} boxSize={4} />}
                aria-label="Delete"
                onClick={() => remove(index)}
                isDisabled={deleteDisabled}
                size="base"
                variant="solid"
                borderRadius="50%"
                w={'36px'}
              />
            </GridItem>
            <GridItem>
              <RenderGuard condition={index === fields.length - 1}>
                <RiveryButton
                  label={<Icon as={PlusIcon} boxSize={4} />}
                  aria-label="Append filter"
                  onClick={() =>
                    append({
                      field: undefined,
                      operator: undefined,
                      value: undefined,
                    })
                  }
                  isDisabled={!isValid}
                  size="base"
                  variant="solid"
                  borderRadius="50%"
                  w={'36px'}
                />
              </RenderGuard>
            </GridItem>
          </React.Fragment>
        ))}
      </Grid>
      <Flex
        justifyContent="space-between"
        alignItems="center"
        borderTop="1px"
        borderTopColor="gray.200"
        pt={3}
        mt={4}
      >
        <Text textStyle="M7" color="font">
          Total matched: {matchedCount}
        </Text>
        <Flex gap={2}>
          <RiveryButton
            label="Clear All"
            variant="outline"
            size="base"
            onClick={handleClear}
            isDisabled={deleteDisabled}
          />
          <RiveryButton
            label="Apply Filters"
            variant="default"
            onClick={handleApply}
            disabled={!isValid}
          />
        </Flex>
      </Flex>
    </Box>
  );
}
