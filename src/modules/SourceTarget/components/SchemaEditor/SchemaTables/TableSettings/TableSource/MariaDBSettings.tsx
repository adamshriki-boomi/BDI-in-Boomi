import { DefaultSettings } from './DefaultSourceSettings';
import * as React from 'react';
import { DateTimeEditor } from '../components';
import { useTableSettings } from '../form.hooks';
import { Box, RenderGuard } from 'components';
import { useGetRiverCommonProps } from 'modules/SourceTarget';

export function MariaDBSettings({ sourceDefinition }) {
  return (
    <DefaultSettings
      sourceDefinition={sourceDefinition}
      additionalSourceSettingsBottom={<DatesSystemVersioning />}
    />
  );
}

function DatesSystemVersioning() {
  const { value, update } = useTableSettings('date_range');
  const { isSystemVersioning } = useGetRiverCommonProps();
  return (
    <RenderGuard condition={isSystemVersioning}>
      <Box mt={4}>
        <DateTimeEditor
          value={value as any}
          onChange={update}
          onlyCustom={true}
        />
      </Box>
    </RenderGuard>
  );
}
