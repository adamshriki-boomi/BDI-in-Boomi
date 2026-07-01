import { RiverySwitch, SwitchComplexLabel } from 'components/Form';
import { useEffect } from 'react';
import { useTableSettings } from '../form.hooks';
import { CommonTableSettings } from './commonSettings';

export function AzureSQLSettings({ targetDefinition }) {
  const { value: targetLoading } = useTableSettings(
    'additional_target_settings.target_loading',
  );
  const { value: recreate_keys, update } = useTableSettings(
    'additional_target_settings.recreate_keys',
  );

  useEffect(() => {
    if (recreate_keys && targetLoading !== 'overwrite') {
      update(false);
    }
  }, [recreate_keys, targetDefinition?.loading_method, targetLoading, update]);

  return (
    <CommonTableSettings
      targetDefinition={targetDefinition}
      fieldNames={{
        loading_method: 'table.additional_target_settings.target_loading',
        merge_method: 'table.additional_target_settings.merge_method',
      }}
      {...([targetDefinition?.loading_method, targetLoading].includes(
        'overwrite',
      ) && {
        targetOverrideOptions: <PurgeKeys />,
      })}
    />
  );
}

function PurgeKeys() {
  const { value, update } = useTableSettings(
    'additional_target_settings.recreate_keys',
  );

  return (
    <RiverySwitch
      formControlStyle={{ alignItems: 'baseline' }}
      leftLabel
      ml="auto"
      label={
        <SwitchComplexLabel
          label="Purge Keys in Overwrite"
          description="Purge the keys in the table using the mapping keys, when running on overwrite"
        />
      }
      isChecked={Boolean(value)}
      onChange={e => update(e.target.checked)}
      name="additional_target_settings.recreate_keys"
    />
  );
}
