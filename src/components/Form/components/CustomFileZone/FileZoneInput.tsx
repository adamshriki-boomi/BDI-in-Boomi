import * as React from 'react';
import { Control, useController } from 'react-hook-form';
import { CustomFileZone, CustomFileZoneEventPayload } from './CustomFileZone';

type FileZoneInputProps = {
  // react-hook-form control
  control: Control;
  connectionType: string;
  // toggle prop name in "control"
  toggleName: string;
  // filezone prop name in "control"
  filezoneName: string;
  defaultBucketFieldName: string;
  dataSourceId: string;
};

/**
 * React-Hook-Form Wrapper for CustomFileZone
 */
export function FileZoneInput({
  control,
  connectionType,
  toggleName,
  filezoneName,
  defaultBucketFieldName,
  dataSourceId,
}: FileZoneInputProps) {
  const { field: toggleField } = useController({
    name: toggleName,
    control,
  });
  const { field: fileZoneField } = useController({
    name: filezoneName,
    control,
  });
  const { field: defaultBucketField } = useController({
    name: defaultBucketFieldName,
    control,
  });
  const { field: fzTargetTypeIdField } = useController({
    name: 'fz_target_type_id',
    control,
  });

  const onChange = ({
    id,
    checked,
    fzTargetTypeId,
    defaultBucket,
  }: CustomFileZoneEventPayload) => {
    toggleField.onChange(checked);
    fileZoneField.onChange(id);
    fzTargetTypeIdField.onChange(fzTargetTypeId);
    defaultBucketField.onChange(defaultBucket);
  };

  const value = {
    checked: toggleField.value,
    id: fileZoneField.value,
    defaultBucket: defaultBucketField.value,
    fzTargetTypeId: fzTargetTypeIdField.value,
  };
  return (
    <CustomFileZone
      name={toggleName}
      connectionType={connectionType}
      onChange={onChange}
      value={value}
    />
  );
}
