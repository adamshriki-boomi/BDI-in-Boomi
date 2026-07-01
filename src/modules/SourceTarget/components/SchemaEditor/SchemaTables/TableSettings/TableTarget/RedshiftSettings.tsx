import { SelectFormGroup } from 'components/Form';
import { compare } from 'utils/array.utils';
import { useTableSettings } from '../form.hooks';
import { CommonTableSettings } from './commonSettings';
import { distributionMethodOptions } from 'containers/River/Targets/TargetRedshift';

export function RedshiftSettings({ targetDefinition }) {
  return (
    <CommonTableSettings
      targetDefinition={targetDefinition}
      fieldNames={{
        loading_method: 'table.additional_target_settings.target_loading',
        merge_method: 'table.additional_target_settings.merge_method',
        ordered_merge_key:
          'table.additional_target_settings.is_ordered_merge_key',
        order_expression: 'table.additional_target_settings.order_expression',
      }}
      afterOverrideOptions={<DistributionMethod />}
    />
  );
}

function DistributionMethod() {
  const { value, update } = useTableSettings(
    'additional_target_settings.distribution_method',
  );
  return (
    <SelectFormGroup
      optional
      label="Distribution Method"
      options={distributionMethodOptions}
      controlId="distribution method"
      onChange={option => {
        update(option?.value ?? '');
      }}
      value={distributionMethodOptions.find(compare('value', value))}
      chakra
      isClearable
      backspaceRemovesValue
      defaultValue={distributionMethodOptions[0]}
    />
  );
}
