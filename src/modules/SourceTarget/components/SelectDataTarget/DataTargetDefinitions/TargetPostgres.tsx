import { Flex } from 'components';
import * as React from 'react';
import { useSttTarget } from '../../form';
import { SingleTableTargetSettings } from './commonTargetDefinitions';
import { getMergeMethods } from 'modules/SourceTarget/components/SelectDataTarget/DataTargetDefinitions/commonMergeMethod';
import { TargetTypesV1 } from 'api/types';
import { useFormContext } from 'react-hook-form';

export function TargetPostgres() {
  const formApi = useFormContext();
  const targetField = useSttTarget();
  return (
    <Flex flexDir="column" w="full" gap={4}>
      <SingleTableTargetSettings
        formApi={formApi}
        targetField={targetField}
        fieldNames={{
          loading_method: 'river.properties.target.loading_method',
          merge_method: 'river.properties.target.merge_method',
          ordered_merge_key: 'river.properties.target.is_ordered_merge_key',
        }}
        isTableView={false}
        mergeMethods={getMergeMethods(TargetTypesV1.POSTGRES)}
      />
    </Flex>
  );
}
