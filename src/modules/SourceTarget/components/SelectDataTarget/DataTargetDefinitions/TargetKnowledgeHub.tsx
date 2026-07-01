import { Box, Flex } from 'components';
import { useFormContext } from 'react-hook-form';
import { TargetTypesV1 } from 'api/types';
import { useSttTarget } from '../../form';
import { SingleTableTargetSettings } from './commonTargetDefinitions';
import { getMergeMethods } from './commonMergeMethod';

export function TargetKnowledgeHub() {
  const formApi = useFormContext();
  const targetField = useSttTarget();

  return (
    <Flex flexDir="column" w="full" gap={4}>
      <Box>
        <SingleTableTargetSettings
          formApi={formApi}
          targetField={targetField}
          fieldNames={{
            loading_method: 'river.properties.target.loading_method',
            merge_method: 'river.properties.target.merge_method',
          }}
          isTableView={false}
          mergeMethods={getMergeMethods(TargetTypesV1.KNOWLEDGE_HUB)}
        />
      </Box>
    </Flex>
  );
}
