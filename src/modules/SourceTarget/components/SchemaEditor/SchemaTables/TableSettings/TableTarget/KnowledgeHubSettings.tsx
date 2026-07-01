import { CommonTableSettings } from './commonSettings';

export function KnowledgeHubSettings({ targetDefinition }) {
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
    />
  );
}
