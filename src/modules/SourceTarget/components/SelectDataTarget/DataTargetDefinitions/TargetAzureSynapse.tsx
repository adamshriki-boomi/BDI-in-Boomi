import { Flex } from 'components';
import * as React from 'react';
import { useSttTarget } from '../../form';
import { SingleTableTargetSettings } from './commonTargetDefinitions';
import { useFormContext } from 'react-hook-form';

export function TargetAzureSynapse() {
  const formApi = useFormContext();
  const targetField = useSttTarget();
  return (
    <Flex flexDir="column" w="full" gap={4}>
      <TableTargetAzureSynapseSettings
        formApi={formApi}
        targetField={targetField}
        fieldNames={{
          loading_method: 'river.properties.target.loading_method',
        }}
      />
    </Flex>
  );
}

function TableTargetAzureSynapseSettings({
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
    />
  );
}
