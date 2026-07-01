import {
  Box,
  DeleteIcon,
  Flex,
  Grid,
  Icon,
  IconButton,
  RenderGuard,
} from 'components';
import { ExoText } from 'components/Exosphere/ExoText';
import { Input, InputLabel } from 'components/Form';
import { SelectFormGroup } from 'components/Form/components/SelectFormGroup';
import RiveryButton from 'components/Buttons/RiveryButton';
import { PlusIcon, RefreshIcon } from 'components/Icons';
import { useMemo } from 'react';
import { useFieldArray } from 'react-hook-form';
import { useAsyncFn } from 'react-use';
import { useTableSettingsFormContext } from '../form.hooks';
import { fetchPullRequestOptions } from './genericSourceSettings.helpers';

function ValueText({ value, onChange, name, index }) {
  return (
    <Input
      hideLabel
      placeholder="Value"
      name={`${name}-value-${index}`}
      value={value}
      onChange={e => onChange(e.target.value)}
      chakra
      size="md"
    />
  );
}

function ValueNotImplemented({ valueConfig }) {
  const valueType = valueConfig?.type ?? 'unknown';
  return (
    <Box>
      <ExoText styleName="Body Large 1 Bold" color="#E53E3E">
        Not Implemented Yet
      </ExoText>
      <ExoText styleName="Body Small 1" color="var(--exo-color-font-secondary)">
        ({valueType})
      </ExoText>
    </Box>
  );
}

const VALUE_TYPE_COMPONENTS = {
  text: ValueText,
};

function FilterValueCell({ input, row, index, updateRow }) {
  const valueConfig = input.value;
  const ValueComponent =
    VALUE_TYPE_COMPONENTS[valueConfig.type] ?? ValueNotImplemented;
  return (
    <ValueComponent
      value={row.value}
      onChange={v => updateRow(index, 'value', v)}
      name={input.name}
      index={index}
      valueConfig={valueConfig}
    />
  );
}

function toOption(value) {
  const label =
    typeof value === 'string'
      ? value
          .split('_')
          .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
          .join(' ')
      : value;
  return { label, value };
}

export function ListOfFiltersField({ input, pullRequestContext }) {
  const formMethods = useTableSettingsFormContext();
  const defaultOperator =
    input.default_new?.operator ?? input.operator?.list?.[0] ?? 'equals';
  const operatorOptions = useMemo(
    () => (input.operator?.list ?? []).map(toOption),
    [input.operator?.list],
  );

  const idCol = input.field?.id_column ?? 'id';
  const nameCol = input.field?.name_column ?? 'name';

  const [state, loadFieldOptions] = useAsyncFn(
    () =>
      fetchPullRequestOptions(
        input.field?.api,
        pullRequestContext,
        idCol,
        nameCol,
      ),
    [input.field?.api, pullRequestContext, idCol, nameCol],
  );
  const fieldOptions = state.value ?? [];

  const fieldArrayName = `table.additional_source_settings.${input.name}`;
  const { fields, append, remove } = useFieldArray({
    control: formMethods.control,
    name: fieldArrayName as any,
  });

  const addRow = () =>
    append({ field: null, operator: defaultOperator, value: '' } as any);

  const updateRow = (index: number, key: string, val: any) => {
    formMethods.setValue(`${fieldArrayName}.${index}.${key}` as any, val);
  };

  return (
    <Box pt={2}>
      <Flex alignItems="center" gap={2} mb={3}>
        <InputLabel variant="semibold" label={input.display_name} mb="0" />
        <RiveryButton
          label="Add Filter"
          type="button"
          variant="text-link"
          size="sm"
          leftIcon={<Icon as={PlusIcon} boxSize={4} />}
          onClick={addRow}
          _hover={{ textDecoration: 'none', fontWeight: 'inherit' }}
        />
      </Flex>
      <Flex flexDir="column" gap={3} minW="720px">
        {fields.map((field, index) => {
          const rowField = formMethods.watch(
            `${fieldArrayName}.${index}.field` as any,
          );
          const rowOperator = formMethods.watch(
            `${fieldArrayName}.${index}.operator` as any,
          );
          const rowValue = formMethods.watch(
            `${fieldArrayName}.${index}.value` as any,
          );
          const fieldOption = rowField?.[0]
            ? { value: rowField[0][idCol], label: rowField[0][nameCol] }
            : null;
          const handleFieldChange = (opt: any) =>
            updateRow(
              index,
              'field',
              opt ? [{ [idCol]: opt.value, [nameCol]: opt.label }] : null,
            );
          return (
            <Grid
              key={field.id}
              templateColumns="450px auto 200px 260px auto auto"
              gap={3}
              alignItems="center"
            >
              <SelectFormGroup
                label=""
                options={fieldOptions}
                controlId={`${input.name}-field-${index}`}
                placeholder="Click To Select..."
                value={fieldOption}
                onChange={handleFieldChange}
                onMenuOpen={() => {
                  if (state.value === undefined && !state.loading)
                    loadFieldOptions();
                }}
                chakra
                isLoading={state.loading}
              />
              <IconButton
                icon={<Icon as={RefreshIcon} boxSize={4} />}
                variant="ghost"
                size="sm"
                aria-label="Refresh field options"
                onClick={() => loadFieldOptions()}
                isDisabled={!input.field?.api || !pullRequestContext}
              />
              <SelectFormGroup
                label=""
                options={operatorOptions}
                controlId={`${input.name}-operator-${index}`}
                placeholder="Operator"
                value={
                  operatorOptions.find(o => o.value === rowOperator) ?? null
                }
                onChange={opt => updateRow(index, 'operator', opt?.value ?? '')}
                chakra
              />
              <FilterValueCell
                input={input}
                row={{
                  field: rowField,
                  operator: rowOperator,
                  value: rowValue,
                }}
                index={index}
                updateRow={updateRow}
              />
              <IconButton
                onClick={() => remove(index)}
                icon={<Icon as={DeleteIcon} boxSize={4} />}
                variant="ghost"
                size="sm"
                aria-label={`Remove filter ${index + 1}`}
              />
              <RenderGuard condition={index === fields.length - 1}>
                <IconButton
                  onClick={addRow}
                  icon={<Icon as={PlusIcon} boxSize={4} />}
                  variant="ghost"
                  size="sm"
                  aria-label="Add filter"
                />
              </RenderGuard>
            </Grid>
          );
        })}
      </Flex>
    </Box>
  );
}
