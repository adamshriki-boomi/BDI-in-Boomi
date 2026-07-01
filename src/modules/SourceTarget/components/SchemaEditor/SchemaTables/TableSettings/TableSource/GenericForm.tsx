import { Box, Text } from 'components';
import { isProdDomain } from 'utils/utils';
import {
  CustomSelectForm,
  Input,
  InputLabel,
  RiveryCheckbox,
  RiverySwitch,
} from 'components/Form';
import { useTableSettings, useTableSettingsFormContext } from '../form.hooks';
import { ListOfFiltersField } from './ListOfFiltersField';
import { ListApiMultipleIdField } from './ListApiMultipleIdField';

function InputTextField({ input }) {
  const formMethods = useTableSettingsFormContext();
  const defaultValue = input.default ?? '';
  return (
    <Box pt={2}>
      <InputLabel label={input.display_name} variant="semibold" />
      <Input
        type="text"
        hideLabel
        secondaryLabel={input.label}
        placeholder=""
        name={`table.additional_source_settings.${input.name}`}
        defaultValue={defaultValue}
        api={formMethods}
        chakra
      />
    </Box>
  );
}

function InputNumberField({ input }) {
  const formMethods = useTableSettingsFormContext();
  const defaultValue = input.default ?? 0;
  return (
    <Box pt={2}>
      <InputLabel label={input.display_name} variant="semibold" />
      <Input
        type="number"
        hideLabel
        secondaryLabel={input.label}
        placeholder="0"
        name={`table.additional_source_settings.${input.name}`}
        defaultValue={defaultValue}
        api={formMethods}
        chakra
      />
    </Box>
  );
}

function CheckboxField({ input }) {
  const formMethods = useTableSettingsFormContext();
  const defaultValue = input.default ?? false;
  return (
    <Box pt={2}>
      <RiveryCheckbox
        name={`table.additional_source_settings.${input.name}`}
        label={input.display_name}
        defaultChecked={defaultValue}
        api={formMethods}
      />
    </Box>
  );
}

function ListMultiselectOptionsField({ input }) {
  const formMethods = useTableSettingsFormContext();
  const idCol = input.id_column ?? 'id';
  const nameCol = input.name_column ?? 'name';
  const options = (input.options ?? []).map(opt => ({
    value: opt[idCol],
    label: opt[nameCol],
  }));

  return (
    <Box pt={2}>
      <InputLabel label={input.display_name} variant="semibold" />
      <Box w="450px">
        <CustomSelectForm
          controlId={input.name}
          name={`table.additional_source_settings.${input.name}`}
          api={formMethods}
          options={options}
          isMulti
          isClearable={input.allow_clear === true}
          closeMenuOnSelect={input.keep_open !== true}
          label={input.label}
          chakra
        />
      </Box>
    </Box>
  );
}

function NotImplementedField({ input }) {
  const isProd = isProdDomain();
  if (isProd) return null;
  return (
    <Box>
      <Text color="red.500" fontWeight="bold" fontSize="lg">
        Not Implemented Yet
      </Text>
      <Text color="gray.500" fontSize="sm">
        ({input.type})
      </Text>
    </Box>
  );
}

function NoteField({ input }) {
  return (
    <Text color="font" fontSize="sm">
      {input.note ?? ''}
    </Text>
  );
}

function SwitchField({ input }) {
  const defaultValue = input.default ?? false;
  const { value, update } = useTableSettings(
    `additional_source_settings.${input.name}`,
  );
  return (
    <Box pt={2}>
      <RiverySwitch
        name={input.name}
        label={input.display_name}
        isChecked={value ?? defaultValue}
        onChange={({ target }) => update(target.checked)}
      />
    </Box>
  );
}

const FIELD_COMPONENTS = {
  input_text: InputTextField,
  input_number: InputNumberField,
  checkbox: CheckboxField,
  switch: SwitchField,
  note: NoteField,
  list_of_filters: ListOfFiltersField,
  list_api_multiple_id: ListApiMultipleIdField,
  list_multiselect_options: ListMultiselectOptionsField,
};

export function GenericUIField({ input, pullRequestContext }) {
  const Component = FIELD_COMPONENTS[input.type] ?? NotImplementedField;
  return <Component input={input} pullRequestContext={pullRequestContext} />;
}
