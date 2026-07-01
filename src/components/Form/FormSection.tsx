import { Box, Flex, Text } from 'components';
import React from 'react';

export function FormSection({ children = null, title = '' }) {
  return (
    <Box my={3}>
      <Text color="primary" mb={2}>
        {title}
      </Text>
      <Flex flexDir="column" pl={3} gap="4">
        {children}
      </Flex>
    </Box>
  );
}
