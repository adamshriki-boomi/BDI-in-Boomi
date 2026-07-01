import { Box } from '@chakra-ui/react';
import { Flex, Text } from 'components';
import React from 'react';
import { ScriptEditorContent } from './ScriptEditor';

export function PackagesSelector({
  maxLines = 10,
  userRequirements,
  onChange,
  requirements,
  step,
  ...styleProps
}) {
  return (
    <Flex flexDir="column" {...styleProps}>
      <ScriptEditorContent
        path="requirements"
        ariaLabel="requirements"
        styleProps={{
          opacity: 0.5,
          border: '1px solid',
          borderColor: 'gray.400',
        }}
        maxLines={maxLines}
        language=""
        readOnly={true}
        value={requirements}
      />
      <Box mt={3} mb={2}>
        Install additional packages
        <Text display="inline" color="gray.300" ml={2}>
          (optional)
        </Text>
      </Box>
      <ScriptEditorContent
        path={`user-requirements ${step}`}
        ariaLabel="additional packages"
        styleProps={{ border: '1px solid', borderColor: 'gray.300' }}
        maxLines={5}
        language=""
        value={userRequirements}
        onChange={onChange}
      />
    </Flex>
  );
}
