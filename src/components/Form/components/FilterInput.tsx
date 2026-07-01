import React, { useEffect, useState } from 'react';
import { MdSearch } from 'react-icons/md';
import { useDebounce } from 'react-use';
import { Input } from './Input';

type FilterInputProps = any;

export function FilterInput({
  onChange,
  value = '',
  ...props
}: FilterInputProps) {
  const [filter, setFilter] = useState(value);
  useDebounce(
    () => {
      onChange && onChange(filter);
    },
    400,
    [filter],
  );

  useEffect(() => {
    setFilter(value);
  }, [value]);
  if (props.api) {
    return (
      <Input type="search" iconRight={<MdSearch size={16} />} {...props} />
    );
  }
  return (
    <Input
      type="search"
      {...props}
      iconRight={<MdSearch size={16} />}
      onChange={ev => setFilter(ev.target.value)}
      value={filter}
    />
  );
}
