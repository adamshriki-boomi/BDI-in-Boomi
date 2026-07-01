import { storageTargets } from 'api/types';
import {
  Box,
  Flex,
  Icon,
  IconButton,
  KeyIcon,
  RenderGuard,
  RiveryOverlay,
  Text,
} from 'components';
import { ExpressionColumnTag } from './ExpressionColumnTag';
import { TableItemProps } from './table.types';

export function SourceName({
  value,
  row: { original },
  column: {
    getProps: { modifiedColumnsMap, updateColumn, targetName = null },
  },
}: TableItemProps) {
  const customValue = modifiedColumnsMap.get(original.name);
  const isKey = original?.is_key || customValue?.is_key;
  const expression = customValue?.expression;
  const calculated = customValue?.calculated_column_mode;

  const isStorageTarget = storageTargets.includes(targetName);
  return (
    <>
      <IconButton
        height="30px"
        variant="ghost"
        minW="unset"
        pr="2"
        onClick={() =>
          updateColumn(original.name, { ...original, is_key: !isKey })
        }
        icon={
          <Icon
            as={KeyIcon}
            color={
              isKey
                ? 'yellow.300'
                : isStorageTarget
                ? 'icon-disabled'
                : 'border'
            }
          />
        }
        aria-label={`${isKey ? 'unset' : 'set'} ${value} as key`}
        isDisabled={isStorageTarget}
        {...(isKey && { opacity: '1!important' })}
      />
      <Flex
        w="full"
        justify="space-between"
        textStyle="R7"
        {...(isKey && { ml: 2 })}
      >
        <RiveryOverlay
          description={calculated ? expression : value}
          placement="right"
        >
          <Text
            maxW="200px"
            whiteSpace="nowrap"
            overflow="hidden"
            textOverflow="ellipsis"
          >
            {calculated ? expression : value}
          </Text>
        </RiveryOverlay>
        <RenderGuard condition={calculated}>
          <Box px={2}>
            <ExpressionColumnTag label="Calculated" type={calculated} />
          </Box>
        </RenderGuard>
      </Flex>
    </>
  );
}
