import { compare } from 'utils/array.utils';

export const getValue = (options, formApi, label) => {
  const { watch } = formApi;
  const value = watch(label);
  return value
    ? options?.find(compare('label', value)) ?? { value, label: value }
    : null;
};

export const khSelectProps = {
  getOptionLabel: (opt: any) => opt?.value?.label ?? opt?.label,
  getOptionValue: (opt: any) => opt?.value?.value ?? opt?.value,
};
