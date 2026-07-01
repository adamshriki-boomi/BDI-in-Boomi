import { Flex } from 'components';
import * as React from 'react';
import { useSttTarget } from '../../form';
import { SingleTableTargetSettings } from './commonTargetDefinitions';
import { useFormContext } from 'react-hook-form';
import { getMergeMethods } from './commonMergeMethod';
import { TargetTypesV1 } from 'api/types';

export function TargetBigQuery() {
  const formApi = useFormContext();
  const targetField = useSttTarget();
  return (
    <Flex flexDir="column" w="full" gap={4}>
      <TableTargetBigQuerySettings
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

function TableTargetBigQuerySettings({ formApi, targetField, fieldNames }) {
  return (
    <SingleTableTargetSettings
      formApi={formApi}
      targetField={targetField}
      fieldNames={fieldNames}
      isTableView={false}
      mergeMethods={getMergeMethods(TargetTypesV1.BIG_QUERY)}
    />
  );
}
