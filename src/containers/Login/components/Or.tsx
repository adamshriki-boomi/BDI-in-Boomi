import { Box, Text } from 'components';
import React from 'react';

export const Or = ({ ...props }) => (
  <Box
    textAlign="center"
    lineHeight={0}
    borderBottom="1px"
    borderBottomColor="border"
    color="border"
    opacity={1}
    {...props}
  >
    <Text bg="white" display="inline" lineHeight={0} px={3}>
      Or
    </Text>
  </Box>
);
