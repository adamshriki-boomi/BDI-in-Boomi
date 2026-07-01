import { CommonTableSettings } from './commonSettings';

export function OneLakeSettings({ targetDefinition }) {
  return (
    <CommonTableSettings
      targetDefinition={targetDefinition}
      fieldNames={{
        loading_method: 'table.additional_target_settings.target_loading',
      }}
    />
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
