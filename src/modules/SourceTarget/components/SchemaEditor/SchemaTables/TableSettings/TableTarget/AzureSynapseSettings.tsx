import { DistributionMethod } from 'modules/SourceTarget/components/SelectDataTarget/DataTargetSettings/TargetAzureSynapse';
import * as React from 'react';
import { useTableSettings } from '../form.hooks';
import { CommonTableSettings } from './commonSettings';
import { useEffectOnce } from 'react-use';
import { DistributionMethodTypes } from 'api/types';

export function AzureSynapseSettings({ targetDefinition }) {
  const { value, update } = useTableSettings(
    'additional_target_settings.distribution_method',
  );

  useEffectOnce(() => {
    if (!value) {
      update(DistributionMethodTypes.ROUND_ROBIN);
    }
  });
  return (
    <CommonTableSettings
      targetDefinition={targetDefinition}
      fieldNames={{
        loading_method: 'table.additional_target_settings.target_loading',
        ordered_merge_key:
          'table.additional_target_settings.is_ordered_merge_key',
        order_expression: 'table.additional_target_settings.order_expression',
      }}
      beforeOverrideOptions={
        <DistributionMethod
          onChange={option => {
            update(option?.value ?? '');
          }}
          value={value}
        />
      }
    />
  );
}
