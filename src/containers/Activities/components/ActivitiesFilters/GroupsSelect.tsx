import { RiverGroupsQuerySelect } from 'components/Form/components/FrequentComponents';
import { useGroups } from 'containers/River/components/Groups/useGroups';
import React from 'react';
import { getCrossId, getOId } from 'utils/api.sanitizer';
import { pluck } from 'utils/array.utils';

const selectProps = {
  getOptionLabel: pluck<any, string>('name'),
  getOptionValue: getCrossId,
};

export function GroupsSelect({ onChange, name, value, ...props }) {
  const { groups } = useGroups();
  const selectedValue = groups?.filter(({ cross_id }) =>
    value?.includes(getOId(cross_id)),
  );
  const handleChange = options => {
    if (typeof options === 'string') {
      onChange(value.filter(val => val !== options));
      return;
    }
    onChange(options.map(selectProps.getOptionValue));
  };

  return (
    <RiverGroupsQuerySelect
      name={name}
      value={selectedValue}
      onChange={handleChange}
      selectProps={selectProps}
      isMulti={true}
      {...props}
    />
  );
}
