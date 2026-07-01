import { Flex } from 'components';
import { InputLabel, SelectFormGroup } from 'components/Form';
import { compare } from 'utils/array.utils';
import { EnforceMaskingPolicy } from '../components';
import { useTableSettings } from '../form.hooks';
import { CommonTableSettings } from './commonSettings';

export function SnowflakeSettings({ targetDefinition }) {
  return (
    <CommonTableSettings
      targetDefinition={targetDefinition}
      fieldNames={{
        loading_method: 'table.additional_target_settings.target_loading',
        merge_method: 'table.additional_target_settings.merge_method',
        ordered_merge_key:
          'table.additional_target_settings.is_ordered_merge_key',
        order_expression: 'table.additional_target_settings.order_expression',
      }}
      targetOverrideOptions={<EnforceMaskingPolicy />}
      afterOverrideOptions={<EscapeCharacter />}
    />
  );
}

function EscapeCharacter() {
  const { value, update } = useTableSettings(
    'additional_target_settings.escape_character',
  );
  return (
    <Flex flexDir="column">
      <InputLabel variant="semibold" label="Support Escape Character" />
      <SelectFormGroup
        optional
        label="Escape characters allow special characters in strings to be interpreted
      as literal characters, rather than as control characters."
        options={escapeCharactersOptions}
        controlId="escape character"
        onChange={option => {
          update(option?.value ?? '');
        }}
        value={escapeCharactersOptions.find(compare('value', value))}
        chakra
        isClearable
        backspaceRemovesValue
        aria-label="escape-character"
      />
    </Flex>
  );
}
export const escapeCharactersOptions = [
  { label: "\\'", value: "\\'" },
  // eslint-disable-next-line no-useless-escape
  { label: '\\"', value: `\\\"` },
  { label: '\\', value: '\\\\' },
  { label: '\\b', value: `\\\b` },
  { label: '\\f', value: `\\\f` },
  { label: '\\n', value: `\\\n` },
  { label: '\\r', value: `\\\r` },
  { label: '\\t', value: `\\\t` },
  { label: '\\0', value: `\\\0` },
];
