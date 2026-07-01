import { Box } from '@chakra-ui/react';
import { ContainerRunningTypes } from 'api/types';
import React from 'react';

export const descriptions = {
  [ContainerRunningTypes.RUN_ONCE]: 'Group your rivers using a container',
  [ContainerRunningTypes.CONDITION]: (
    <p>
      Perform conditional logic in your workflow
      <br />
      The condition flow will run according to the condition order, only one
      condition will be triggered.
    </p>
  ),
  [ContainerRunningTypes.LOOP_OVER]:
    'Iterate logic steps over a sequence for each item in a list',
};

export const ContainerDescription = ({ type }) => {
  const typeText = descriptions?.[type];
  return typeText ? (
    <Box mb={3} mt={2}>
      {typeText}
    </Box>
  ) : null;
};
