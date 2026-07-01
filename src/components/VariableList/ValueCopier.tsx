import { ExLoader, LoaderSize } from '@boomi/exosphere';
import { Box, HStack } from 'components';
import { ButtonCopy } from './ButtonCopy';

export function ValueCopier({ loading, value }) {
  return (
    <HStack w="100%">
      <Box
        h="40px"
        w="250px"
        flex={1}
        border="1px solid"
        borderRadius={4}
        borderColor="gray.300"
        p={2}
        overflow="auto"
        whiteSpace="nowrap"
      >
        {loading ? <ExLoader size={LoaderSize.MEDIUM} /> : value}
      </Box>
      <ButtonCopy value={value} />
    </HStack>
  );
}
