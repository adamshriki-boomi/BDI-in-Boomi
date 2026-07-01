import { CustomSelectForm } from 'components/Form';
import { getQueryParams } from 'hooks/router';
import React from 'react';
import { compare } from 'utils/array.utils';

export function ScheduledSelect({ onChange, name, value }) {
  const { is_scheduled } = getQueryParams(['is_scheduled']);

  const options = [
    { label: 'Scheduled', value: 'true' },
    { label: 'Unscheduled', value: 'false' },
  ];
  const v =
    (value !== null && options.find(compare('value', is_scheduled))) ?? [];
  return (
    <CustomSelectForm
      name={name}
      label="Scheduled"
      aria-label="Scheduled"
      controlId="scheduled select"
      options={options}
      value={is_scheduled ? v : []}
      onChange={onChange}
      chakra
      isClearable
      isMulti={false}
    />
  );
}
