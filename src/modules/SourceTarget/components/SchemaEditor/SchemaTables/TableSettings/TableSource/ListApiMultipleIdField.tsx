import { Box, Flex, Icon, IconButton } from 'components';
import { CustomSelectForm, InputLabel } from 'components/Form';
import { RefreshIcon } from 'components/Icons';
import { useAsyncFn } from 'react-use';
import { useTableSettingsFormContext } from '../form.hooks';
import { fetchPullRequestOptions } from './genericSourceSettings.helpers';

export function ListApiMultipleIdField({ input, pullRequestContext }) {
  const formMethods = useTableSettingsFormContext();
  const idCol = input.id_column ?? 'id';
  const nameCol = input.name_column ?? 'name';
  const [state, loadOptions] = useAsyncFn(
    () =>
      fetchPullRequestOptions(input.api, pullRequestContext, idCol, nameCol),
    [input.api, pullRequestContext, idCol, nameCol],
  );
  const options = state.value ?? [];
  const error = state.error?.message ?? null;

  const fieldName = `table.additional_source_settings.${input.name}`;
  const savedValue: any[] = formMethods.watch(fieldName as any) ?? [];

  // Convert each stored item (dict or legacy raw ID) to { value, label } for react-select.
  // Uses real labels from loaded options when available.
  const displayValue = savedValue.map((item: any) => {
    const id = item !== null && typeof item === 'object' ? item[idCol] : item;
    const match = options.find(o => String(o.value) === String(id));
    return {
      value: id,
      label:
        match?.label ??
        (typeof item === 'object' ? item[nameCol] : null) ??
        String(id),
    };
  });

  const loadedValueStrings = new Set(options.map(o => String(o.value)));
  const fallbackOptions = displayValue.filter(
    o => !loadedValueStrings.has(String(o.value)),
  );
  const mergedOptions = [...fallbackOptions, ...options];

  // Save in backend dict format: [{ [idCol]: id, [nameCol]: label }]
  const handleChange = (selected: any[] | null) => {
    formMethods.setValue(
      fieldName as any,
      Array.isArray(selected)
        ? selected.map(o => ({ [idCol]: o.value, [nameCol]: o.label }))
        : [],
      { shouldDirty: true },
    );
  };

  return (
    <Box pt={2}>
      <InputLabel label={input.display_name} variant="semibold" />
      <Flex alignItems="flex-end" gap={2}>
        <Box w="450px" flexShrink={0}>
          <CustomSelectForm
            controlId={input.name}
            name={fieldName}
            value={displayValue}
            onChange={handleChange}
            options={mergedOptions}
            isMulti
            isClearable={input.allow_clear === true}
            closeMenuOnSelect={false}
            label={input.label}
            chakra
            isLoading={state.loading}
            onMenuOpen={() => {
              if (state.value === undefined && !state.loading) loadOptions();
            }}
            {...(error && { displayError: error })}
          />
        </Box>
        <IconButton
          icon={<Icon as={RefreshIcon} boxSize={4} />}
          variant="ghost"
          size="sm"
          aria-label="Refresh options"
          onClick={() => loadOptions()}
          isDisabled={!input.api || !pullRequestContext}
        />
      </Flex>
    </Box>
  );
}
