import * as React from 'react';
import { CommonTableSettings } from './commonSettings';

export function AthenaSettings({ targetDefinition }) {
  return (
    <CommonTableSettings
      targetDefinition={targetDefinition}
      fieldNames={{
        loading_method: 'table.additional_target_settings.target_loading',
        ordered_merge_key:
          'table.additional_target_settings.is_ordered_merge_key',
        order_expression: 'table.additional_target_settings.order_expression',
      }}
    />
  );
}
