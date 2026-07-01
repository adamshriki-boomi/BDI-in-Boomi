import * as React from 'react';
import { useTableSettings } from '../form.hooks';
import { CommonTableSettings } from './commonSettings';
import { useFormContext } from 'react-hook-form';
import { RiverySwitch, SwitchComplexLabel } from 'components/Form/components';

export function PostgresSettings({ targetDefinition }) {
  return (
    <CommonTableSettings
      targetDefinition={targetDefinition}
      fieldNames={{
        loading_method: 'table.additional_target_settings.target_loading',
        merge_method: 'table.additional_target_settings.merge_method',
        ordered_merge_key:
          'table.additional_target_settings.is_ordered_merge_key',
      }}
      targetOverrideOptions={
        <AnalyzeTableInLoad
          analyze={targetDefinition?.additional_settings?.analyze_table}
        />
      }
    />
  );
}

function AnalyzeTableInLoad({ analyze }) {
  const { value, update } = useTableSettings(
    'additional_target_settings.analyze_tables',
  );
  const formApi = useFormContext();
  const targetValue = formApi.watch('analyzeTable');
  const tableValue = value !== undefined ? value : targetValue;

  return (
    <RiverySwitch
      formControlStyle={{ alignItems: 'baseline' }}
      leftLabel
      ml="auto"
      label={
        <SwitchComplexLabel
          label="Analyze table in Load"
          description="Analyze table after loading"
        />
      }
      isChecked={Boolean(tableValue)}
      onChange={e => update(e.target.checked)}
      name="additional_target_settings.analyze_table"
    />
  );
}
