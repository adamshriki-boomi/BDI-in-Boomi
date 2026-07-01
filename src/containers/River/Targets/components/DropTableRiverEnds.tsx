import { Box } from '@chakra-ui/react';
import { RiverySwitch } from 'components/Form';
import React from 'react';

export const DropTableRiverEnds = ({ api }) => (
  <Box>
    <RiverySwitch
      name="content.drop_after"
      label="Drop table after data flow ends"
      api={api}
    />
  </Box>
);
