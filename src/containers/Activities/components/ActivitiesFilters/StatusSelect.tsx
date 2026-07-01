import { StatusTypes } from 'api/types';
import { CustomSelectForm } from 'components/Form/components/SelectFormGroup/CustomSelectForm';
import { getQueryParams } from 'hooks/router';
import React, { useMemo } from 'react';
import { pluck } from 'utils/array.utils';

export function StatusSelect({ onChange, name, value, ...rest }) {
  const { status } = getQueryParams(['status']);
  const selectedValue = useMemo(() => {
    if (typeof status == 'string') {
      return statusTypeOptions?.filter(option => status === option.value);
    }
    return statusTypeOptions?.filter(option => status?.includes(option.value));
  }, [status]);
  const handleChange = options => {
    if (typeof options == 'string') {
      onChange(value.filter(val => val !== options));
      return;
    }
    onChange(options.map(pluck('value')));
  };

  return (
    <CustomSelectForm
      name={name}
      label="Status"
      controlId="status type"
      options={statusTypeOptions}
      customStyles={{
        menuPortal: base => ({ ...base, zIndex: 5000 }),
      }}
      value={selectedValue}
      updateFilter={handleChange}
      chakra
      size="md"
      isClearable
      {...rest}
    />
  );
}
const statusTypeOptions = [
  { label: 'Succeeded', value: StatusTypes.SUCCEEDED },
  { label: 'Failed', value: StatusTypes.FAILED },
  { label: 'Running', value: StatusTypes.RUNNING },
  { label: 'Pending', value: StatusTypes.PENDING },
  // { label: 'Canceled', value: StatusTypes.CANCELED },
];
