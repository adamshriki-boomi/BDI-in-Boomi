import { Flex } from 'components';
import * as React from 'react';
import { useSttTarget } from '../../form';
import { SingleTableTargetSettings } from './commonTargetDefinitions';
import { getMergeMethods } from './commonMergeMethod';
import { TargetTypesV1 } from 'api/types';
import { useFormContext } from 'react-hook-form';

export function TargetRedshift() {
  const formApi = useFormContext();
  const targetField = useSttTarget();
  return (
    <Flex flexDir="column" w="full" gap={4}>
      <TableTargetRedshiftSettings
        formApi={formApi}
        targetField={targetField}
        fieldNames={{
          loading_method: 'river.properties.target.loading_method',
          merge_method: 'river.properties.target.merge_method',
          ordered_merge_key: 'river.properties.target.is_ordered_merge_key',
          order_expression: 'river.properties.target.order_expression',
        }}
      />
    </Flex>
  );
}

function TableTargetRedshiftSettings({
  formApi,
  targetField,
  fieldNames,
  isTableView = false,
}) {
  return (
    <SingleTableTargetSettings
      formApi={formApi}
      targetField={targetField}
      fieldNames={fieldNames}
      isTableView={isTableView}
      mergeMethods={getMergeMethods(TargetTypesV1.REDSHIFT)}
    />
  );
}
