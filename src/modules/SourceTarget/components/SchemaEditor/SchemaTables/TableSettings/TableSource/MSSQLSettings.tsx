import { Flex, RenderGuard } from 'components';
import { RiverySwitch, SwitchComplexLabel } from 'components/Form';
import { useEffectOnce } from 'react-use';
import { useTableSettings } from '../form.hooks';
import { DefaultSettings } from './DefaultSourceSettings';
import { TargetTypesV1 } from 'api/types';
import * as React from 'react';
import { IRiverExtractMethod } from 'modules/SourceTarget/store';

interface IncludeDeletedRowsProps {
  target: TargetTypesV1;
  extractMethod: IRiverExtractMethod;
  sourceIncludeDeletedRows?: boolean;
}

export function MSSQLSettings({ sourceDefinition, targetDefinition }) {
  return (
    <DefaultSettings
      sourceDefinition={sourceDefinition}
      additionalSourceSettingsBottom={
        <IncludeDeletedRows
          target={targetDefinition.name}
          extractMethod={sourceDefinition?.additional_settings?.extract_method}
          sourceIncludeDeletedRows={
            sourceDefinition?.additional_settings?.include_deleted_rows
          }
        />
      }
    />
  );
}

function IncludeDeletedRows({
  target,
  extractMethod,
  sourceIncludeDeletedRows,
}: IncludeDeletedRowsProps) {
  const isChangeTrackingRiver =
    extractMethod === IRiverExtractMethod.CHANGE_TRACKING;
  const deletedRowsSupportedTargets = [
    TargetTypesV1.SNOWFLAKE,
    TargetTypesV1.DATABRICKS,
  ];
  const shouldShowDeletedRows =
    isChangeTrackingRiver && deletedRowsSupportedTargets.includes(target);

  const { value: tableIncludeDeletedRows, update } = useTableSettings(
    'additional_source_settings.include_deleted_rows',
  );

  useEffectOnce(() => {
    if (tableIncludeDeletedRows == null) {
      update(sourceIncludeDeletedRows ?? false);
    }
  });

  return (
    <Flex flexDir="column" w="450px" gap={2} mt={4}>
      <RenderGuard condition={shouldShowDeletedRows}>
        <RiverySwitch
          formControlStyle={{ alignItems: 'baseline' }}
          label={
            <SwitchComplexLabel
              label="Include Deleted Rows (default value for all selected tables)"
              description="This option will also pull deleted rows. The rows key fields will remain the same, and the rest of the fields will be NULL."
            />
          }
          leftLabel
          ml="auto"
          isChecked={Boolean(tableIncludeDeletedRows) ?? false}
          onChange={({ target }) => update(target.checked)}
          name="table.additional_source_settings.include_deleted_rows"
        />
      </RenderGuard>
    </Flex>
  );
}
