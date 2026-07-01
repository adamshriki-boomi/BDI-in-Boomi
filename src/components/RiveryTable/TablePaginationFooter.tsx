import { Box, Flex, Text } from '@chakra-ui/react';
import { SelectFormGroup } from 'components/Form/components';
import React from 'react';
import { compare } from 'utils/array.utils';
import { perPageSelectors } from './RiveryTable';
import { TablePagination } from './TablePagination';

export function TablePaginationFooter({
  isFixedPageSize,
  entityType,
  pageSize,
  onPageSizeChange,
  gotoPage,
  previousPage,
  nextPage,
  canPreviousPage,
  canNextPage,
  pageCount,
  pageIndex,
  compact,
  countDisplay,
}) {
  return (
    <Flex mb="4" mt="6" justifyContent="space-between" alignItems="center">
      <Flex alignItems="baseline" flexWrap="nowrap" flexShrink="0" gap={1}>
        <Text mb="1" mr="1" color="font-secondary">
          Rows Per Page
        </Text>
        <Box w="70px">
          <SelectFormGroup
            controlId="items per page"
            options={perPageSelectors}
            value={perPageSelectors.find(compare('value', pageSize))}
            onChange={ev => onPageSizeChange(ev.value)}
            label=""
            chakra
            size="sm"
            customStyles={{
              indicatorsContainer: base => ({
                ...base,
                '& > button': {
                  minWidth: 'unset',
                },
              }),
            }}
          />
        </Box>
        <Box>{compact ? null : countDisplay}</Box>
      </Flex>
      <Flex justifyContent={isFixedPageSize ? 'flex-end' : 'space-between'}>
        <TablePagination
          gotoPage={gotoPage}
          previousPage={previousPage}
          nextPage={nextPage}
          canPreviousPage={canPreviousPage}
          canNextPage={canNextPage}
          pageCount={pageCount}
          totalPages={pageCount}
          currentIndex={pageIndex}
          itemClassName={isFixedPageSize ? 'small' : null}
        />
      </Flex>
    </Flex>
  );
}
