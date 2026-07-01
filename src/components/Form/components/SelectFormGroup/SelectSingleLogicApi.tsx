import { FormSelect } from 'components/Form/components/FormSelect';
import { createOption } from 'components/Form/components/SelectFormGroup/SelectFormGroup';
import { isVariableString } from 'containers/River/hooks/useAsyncMetadata';
import React from 'react';
import { useGetMetadataQuery } from 'store/metadata';

export const SelectSingleLogicApi = ({
  api,
  value,
  step,
  name,
  label,
  toMetaQueryConfig,
}) => {
  const response = useGetMetadataQuery(toMetaQueryConfig(step));
  const selectedOption = value ? createOption(value) : '';
  return (
    <FormSelect
      name={`content.${name}`}
      label={label}
      metadataResponse={response}
      options={response.data}
      isValidNewOption={isVariableString}
      controlId={name}
      api={api}
      value={selectedOption}
      editableCreate
      defaultCreateLabel=""
      placeholder={`Select ${label} or use a variable`}
      hideErrorTitle
      isClearable
    />
  );
};
