import { Icon, VStack } from '@chakra-ui/react';
import RiveryButton from 'components/Buttons/RiveryButton';
import { Tagger } from 'components/Tracking/Tagger';
import React from 'react';
import { IoMdAddCircle } from 'react-icons/io';

type EmptyRiverProps = {
  onAddStep: () => any;
};
export function EmptyRiver({ onAddStep }: EmptyRiverProps) {
  return (
    <VStack justifyContent="center" gap={1} mt={4}>
      <h5>Nothing to see here</h5>
      <aside>Start your logic flow by adding your first logic step</aside>
      <Tagger tags={[{ 'add-logic-step': 'empty' }]}>
        <RiveryButton
          leftIcon={<Icon as={IoMdAddCircle} width={4} height={4} />}
          label="Add Logic Step"
          variant="outlined-primary"
          mt={3}
          onClick={onAddStep}
        />
      </Tagger>
    </VStack>
  );
}
