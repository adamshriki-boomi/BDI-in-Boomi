import { Box, Grid, IconButton, Text } from 'components';
import { InputLabel } from 'components/Form';
import { SelectFormGroup } from 'components/Form/components/SelectFormGroup';
import { Input } from 'components/Form/components/Input';
import RiveryButton from 'components/Buttons/RiveryButton';
import { useFieldArray } from 'react-hook-form';
import { BiTrash } from 'react-icons/bi';
import { useMemo } from 'react';
import { useTableSettingsFormContext } from '../form.hooks';
import { useGetColumnsQuery } from '../Mapping/mapping.query';
import React from 'react';

const operatorOptions = [
  { label: '=', value: 'equals' },
  { label: '!=', value: 'not_equals' },
  { label: '>', value: 'greater_than' },
  { label: '>=', value: 'greater_than_or_equal' },
  { label: '<', value: 'less_than' },
  { label: '<=', value: 'less_than_or_equal' },
];

export function TableFilters({ formApi, targetDefinition = null }) {
  const { fields, append, remove } = useFieldArray({
    control: formApi.control,
    name: 'table.additional_source_settings.table_filters',
  });

  // Get form context to access the same parameters used in Mapping
  const { watch } = useTableSettingsFormContext();
  const definitions = watch('definitions');
  const connectionId = watch('connectionId');

  // Use the same query as Mapping tab - this should hit the cache
  const { data: columnsData } = useGetColumnsQuery(
    {
      connectionId: connectionId,
      table_id: definitions?.id,
      schema_name: definitions?.schema_name,
      target_type: targetDefinition?.name || '',
    },
    {
      skip: !connectionId || !definitions?.id || !definitions?.schema_name,
    },
  );

  // Transform columns into dropdown options
  const columnOptions = useMemo(() => {
    const columns = columnsData?.items;
    if (!columns || columns.length === 0) {
      return [{ label: 'No columns available', value: '', disabled: true }];
    }
    return columns.map(column => ({
      label: column.name,
      value: column.name,
    }));
  }, [columnsData?.items]);

  const handleAddFilter = () => {
    const firstColumnValue =
      columnOptions.length > 0 && !(columnOptions[0] as any).disabled
        ? columnOptions[0].value
        : '';
    append({
      column: firstColumnValue,
      operator: 'equals',
      value: '',
    } as any);
  };

  return (
    <Box pt={4}>
      <InputLabel variant="semibold" label="Filters" />

      {fields.length > 0 && (
        <>
          <Grid templateColumns="260px 260px 260px 40px" gap={4} mb={2}>
            <Text fontSize="sm" fontWeight="medium">
              Column
            </Text>
            <Text fontSize="sm" fontWeight="medium">
              Operator
            </Text>
            <Text fontSize="sm" fontWeight="medium">
              Value
            </Text>
            <Box />
          </Grid>

          {fields.map((field: any, index: number) => {
            const columnValue = formApi.watch(
              `table.additional_source_settings.table_filters.${index}.column`,
            );
            const operatorValue = formApi.watch(
              `table.additional_source_settings.table_filters.${index}.operator`,
            );

            return (
              <Grid
                key={field.id}
                templateColumns="260px 260px 260px 40px"
                gap={4}
                mb={3}
                alignItems="center"
              >
                <SelectFormGroup
                  label=""
                  options={columnOptions}
                  controlId={`column-${index}`}
                  placeholder="Select column"
                  value={
                    columnOptions.find(opt => opt.value === columnValue) || null
                  }
                  onChange={(option: any) =>
                    formApi.setValue(
                      `table.additional_source_settings.table_filters.${index}.column`,
                      option?.value ?? '',
                    )
                  }
                  chakra
                />
                <SelectFormGroup
                  label=""
                  options={operatorOptions}
                  controlId={`operator-${index}`}
                  placeholder="Select operator"
                  value={
                    operatorOptions.find(opt => opt.value === operatorValue) ||
                    null
                  }
                  onChange={(option: any) =>
                    formApi.setValue(
                      `table.additional_source_settings.table_filters.${index}.operator`,
                      option?.value ?? '',
                    )
                  }
                  chakra
                />
                <Input
                  name={`table.additional_source_settings.table_filters.${index}.value`}
                  api={formApi}
                  label=""
                  hideLabel
                  placeholder="Value to filter"
                  chakra
                  size="md"
                />
                <IconButton
                  onClick={() => remove(index)}
                  icon={<BiTrash size="16" />}
                  variant="ghost"
                  size="sm"
                  aria-label={`Delete filter ${index + 1}`}
                />
              </Grid>
            );
          })}
        </>
      )}

      <RiveryButton
        label="+ Add filter"
        type="button"
        variant="text"
        size="sm"
        onClick={handleAddFilter}
      />
    </Box>
  );
}
