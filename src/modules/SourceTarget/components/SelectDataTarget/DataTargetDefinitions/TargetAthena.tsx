import { Flex } from 'components';
import { useSttTarget } from '../../form';
import { SingleTableTargetSettings } from './commonTargetDefinitions';
import { useFormContext } from 'react-hook-form';

export function TargetAthena() {
  const formApi = useFormContext();
  const targetField = useSttTarget();
  return (
    <Flex flexDir="column" w="full" gap={4}>
      <TableTargetAthenaSettings
        formApi={formApi}
        targetField={targetField}
        fieldNames={{
          loading_method: 'river.properties.target.loading_method',
          ordered_merge_key: 'river.properties.target.ordered_merge_key',
          order_expression: 'river.properties.target.order_expression',
        }}
      />
    </Flex>
  );
}

function TableTargetAthenaSettings({
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
