import { TargetTypesV1 } from 'api/types';
import { Box, Divider, RiveryButton } from 'components';
import { RiverySwitch, SwitchComplexLabel } from 'components/Form';
import { SchemaV1Select } from 'containers/River/Targets/components/MetaQuery/SchemaV1Select';
import { CustomFzTarget } from 'modules/SourceTarget/components/SelectDataTarget/DataTargetSettings/CustomFzTarget';
import * as React from 'react';
import { useController, useFormContext } from 'react-hook-form';
import {
  CollapseWrap,
  RiveryMetadataField,
  SettingsHeader,
  TruncateColumnsField,
} from './commonTargetSettings';
import { useCallback } from 'react';

export function TargetRedshift({ connectionReady }) {
  const formApi = useFormContext();
  const { field: connectionIdField } = useController({
    name: 'river.properties.target.connection_id',
    control: formApi.control,
  });

  useController({
    name: 'river.properties.target.additional_settings.replace_cascade',
    control: formApi.control,
    defaultValue: true,
  });

  const { field: targetAdditionalSettings } = useController({
    name: 'river.properties.target.additional_settings',
    control: formApi.control,
  });

  const onSwitchChange = useCallback(
    ({ target }, name) => {
      targetAdditionalSettings.onChange({
        ...targetAdditionalSettings.value,
        [name]: target.checked,
      });
    },
    [targetAdditionalSettings],
  );

  return (
    <>
      <SettingsHeader />
      <Box w="full">
        <SchemaV1Select
          ariaLabel="schema_name"
          name="river.properties.target.schema_name"
          connectionId={connectionIdField.value}
          useFormApi={formApi}
          datasource_id={TargetTypesV1.REDSHIFT}
          task_type="target"
          required="Schema is required"
        />
      </Box>
      <CollapseWrap>
        <TruncateColumnsField formApi={formApi} />
        <RiverySwitch
          leftLabel
          ml="auto"
          label={
            <SwitchComplexLabel
              label="Compression Update"
              description="Update the compression of the columns in the target table during the data load (only if the table does not yet exist)"
            />
          }
          isChecked={Boolean(
            targetAdditionalSettings?.value?.compression_update,
          )}
          onChange={e => onSwitchChange(e, 'compression_update')}
          formControlStyle={{ alignItems: 'baseline' }}
        />
        <RiverySwitch
          leftLabel
          ml="auto"
          label={
            <SwitchComplexLabel
              label="Keep Schema-Binding Views"
              description={
                <Box>
                  Keeping the entire schema binding views when using
                  upsert-merge or overwrite. Un-checking this option will{' '}
                  <strong>drop</strong> any{' '}
                  <RiveryButton
                    label="Schema Binding Views"
                    variant="link"
                    size="xs"
                    href="https://docs.aws.amazon.com/redshift/latest/dg/r_CREATE_VIEW.html#r_CREATE_VIEW_usage_notes"
                    target="_blank"
                  />{' '}
                  depending on the target table.
                </Box>
              }
            />
          }
          isChecked={Boolean(targetAdditionalSettings?.value?.replace_cascade)}
          onChange={e => onSwitchChange(e, 'replace_cascade')}
          formControlStyle={{ alignItems: 'baseline' }}
        />
        <RiveryMetadataField formApi={formApi} />
        <Divider />
        <CustomFzTarget connId={connectionIdField.value} api={formApi} />
      </CollapseWrap>
    </>
  );
}
