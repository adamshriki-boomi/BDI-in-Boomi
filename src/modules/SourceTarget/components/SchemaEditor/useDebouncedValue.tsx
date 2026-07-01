import { useState } from 'react';
import { useDebounce } from 'react-use';

export const useDebouncedValue = () => {
  const [value, setQuery] = useState<string>();
  const [finalValue, setValue] = useState<string>();
  useDebounce(
    () => {
      setValue(value);
    },
    500,
    [value],
  );
  return { value, finalValue, setQuery };
};
