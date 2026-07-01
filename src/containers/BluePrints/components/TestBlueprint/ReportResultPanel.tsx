import { Box, Code, IconButton, Tooltip } from '@chakra-ui/react';
import { ArrowsExpand, CopyIcon, Flex, HStack, Icon } from 'components';
import { StatusReflection } from 'containers/River/RiverSourceToTarget/components/RiverActivation/components/StatusReflection';
import type { ResultSnapshot } from './helpers';

type Props = {
  result: ResultSnapshot;
  isExpanded: boolean;
  onToggleExpand: () => void;
  isCopied: boolean;
  onCopy: () => void;
};

export function ReportResultPanel({
  result,
  isExpanded,
  onToggleExpand,
  isCopied,
  onCopy,
}: Props) {
  return (
    <Flex
      flexDir="column"
      gap={2}
      bg={result.isSuccess ? 'background-success' : 'background-danger-weak'}
      p={4}
      border="1px solid"
      borderColor="border"
      borderRadius={4}
    >
      <HStack justify="space-between" align="flex-start">
        <StatusReflection
          status={result.isSuccess ? 'D' : 'E'}
          description={
            result.isSuccess
              ? 'Blueprint Tested Successfully'
              : 'Blueprint Test Failed'
          }
          flexShrink={0}
        />
        <HStack spacing={1}>
          <Tooltip label={isCopied ? 'Copied!' : 'Copy'}>
            <IconButton
              aria-label="Copy result"
              size="sm"
              variant="ghost"
              icon={<Icon as={CopyIcon} />}
              onClick={onCopy}
            />
          </Tooltip>
          <Tooltip label={isExpanded ? 'Collapse' : 'Expand'}>
            <IconButton
              aria-label="Expand result"
              size="sm"
              variant="ghost"
              icon={<Icon as={ArrowsExpand} />}
              onClick={onToggleExpand}
            />
          </Tooltip>
        </HStack>
      </HStack>
      {result.isSuccess ? (
        <Code
          bg="background"
          display="block"
          whiteSpace="pre"
          wordBreak="break-word"
          overflow="auto"
          h={isExpanded ? '600px' : '250px'}
          padding={4}
        >
          {JSON.stringify(result.data, null, 2)}
        </Code>
      ) : (
        <Box
          bg="background"
          p={4}
          overflow="auto"
          h={isExpanded ? '600px' : '250px'}
        >
          {JSON.stringify(result.error)}
        </Box>
      )}
    </Flex>
  );
}
