import { SelectFormGroup } from 'components/Form';
import { Controller, useFormContext } from 'react-hook-form';
import { compare } from 'utils/array.utils';

export function ModeSelect({ name = 'mode', label = 'Mode' }) {
  const { control } = useFormContext();
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange } }) => (
        <SelectFormGroup
          label={label}
          options={modeOptions}
          controlId={`mode-select`}
          onChange={option => onChange(option.value)}
          value={modeOptions.find(compare('value', value))}
          defaultValue={modeOptions[0]}
          chakra
        />
      )}
    />
  );
}
const modeOptions = [
  { label: 'NULLABLE', value: 'NULLABLE' },
  { label: 'REPEATED', value: 'REPEATED' },
  { label: 'REQUIRED', value: 'REQUIRED' },
];
