import { Box, Flex, RenderGuard } from 'components';
import { RiverySwitch } from 'components/Form';
import * as React from 'react';
import { useSttTarget } from '../../form';
import { SingleTableTargetSettings } from './commonTargetDefinitions';
import { getMergeMethods } from 'modules/SourceTarget/components/SelectDataTarget/DataTargetDefinitions/commonMergeMethod';
import { TargetTypesV1 } from 'api/types';
import { useFormContext } from 'react-hook-form';

export function TargetSnowflake() {
  const formApi = useFormContext();
  const targetField = useSttTarget();
  const shouldIncludeDeletedRows = formApi?.watch(
    'river.properties.source.additional_settings.include_deleted_rows',
  );

  return (
    <Flex flexDir="column" w="full" gap={4}>
      <Box>
        <SingleTableTargetSettings
          formApi={formApi}
          targetField={targetField}
          fieldNames={{
            loading_method: 'river.properties.target.loading_method',
            merge_method: 'river.properties.target.merge_method',
            ordered_merge_key: 'river.properties.target.is_ordered_merge_key',
            order_expression: 'river.properties.target.order_expression',
          }}
          isTableView={false}
          mergeMethods={getMergeMethods(TargetTypesV1.SNOWFLAKE)}
        />
        <RenderGuard condition={shouldIncludeDeletedRows}>
          <RiverySwitch
            label="Remove deleted rows in case of MSSQL source and using change tracking including deleted rows"
            leftLabel
            ml="auto"
            api={formApi}
            name="river.properties.target.additional_target_settings.remove_deleted_rows"
          />
        </RenderGuard>
      </Box>
    </Flex>
  );
}
