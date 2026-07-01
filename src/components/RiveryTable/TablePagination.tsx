import { Button, Icon, IconButton, IconButtonProps } from '@chakra-ui/react';
import { ButtonGroup } from 'components';
import {
  ChevronDoubleLeft,
  ChevronDoubleRight,
  ChevronLeft,
  ChevronRight,
} from 'components/Icons';
import React from 'react';
import { parseSearchParams } from 'utils/searchParams';
import { calculatePagination } from './table.utils';

type Props = {
  gotoPage: (page: number) => any;
  previousPage: () => any;
  nextPage: () => any;
  canPreviousPage: boolean;
  canNextPage: boolean;
  pageCount: number;
  currentIndex: number;
  totalPages: number;
  itemClassName?: string;
};

export function TablePagination({
  gotoPage,
  previousPage,
  nextPage,
  canPreviousPage,
  canNextPage,
  pageCount,
  currentIndex,
  totalPages,
  itemClassName,
}: Props) {
  const hasPages = totalPages && totalPages > 1;
  const hideGoToFirstPage = totalPages <= 1 && !Number(currentIndex);

  const dots = calculatePagination(currentIndex, totalPages);
  return (
    <ButtonGroup
      isAttached
      variant="outlined"
      size="sm"
      color="brand"
      fontWeight="normal"
      gap={1}
      sx={{
        '& > button': {
          borderRadius: `4px !important`,
          height: 7,
          padding: '1px 0px !important',
          fontWeight: 'normal',
          borderColor: 'transparent',
          _hover: {
            border: '1px solid',
          },
        },
      }}
    >
      {hideGoToFirstPage ? null : (
        <ArrowButton
          className={itemClassName}
          aria-label="goto first page"
          onClick={() => gotoPage(0)}
          isDisabled={!canPreviousPage}
          icon={ChevronDoubleLeft}
        />
      )}
      {hasPages ? (
        <>
          <ArrowButton
            className={itemClassName}
            aria-label="goto previous page"
            onClick={() => gotoPage(0)}
            isDisabled={!canPreviousPage}
            icon={ChevronLeft}
          />
          {dots?.map(({ pageNum, label = pageNum }) => (
            <Button
              className={itemClassName}
              borderWidth="1px"
              color={
                Number(pageNum) === Number(currentIndex) + 1
                  ? 'background-selected'
                  : 'font'
              }
              bgColor={
                Number(pageNum) === Number(currentIndex) + 1
                  ? 'background-selected-weak'
                  : 'background-secondary'
              }
              key={`pagination-${pageNum}`}
              aria-label={`goto page ${label}`}
              onClick={() => gotoPage(pageNum - 1)}
            >
              {label}
            </Button>
          ))}
          <ArrowButton
            className={itemClassName}
            aria-label="goto next page"
            onClick={nextPage}
            isDisabled={!canNextPage}
            icon={ChevronRight}
          />
          <ArrowButton
            className={itemClassName}
            aria-label="goto last page"
            onClick={() => gotoPage(pageCount - 1)}
            isDisabled={!canNextPage}
            icon={ChevronDoubleRight}
          />
        </>
      ) : null}
    </ButtonGroup>
  );
}

function ArrowButton({
  icon,
  ...rest
}: Omit<IconButtonProps, 'icon'> & { icon: any }) {
  return (
    <IconButton icon={<Icon as={icon} />} bg="background-secondary" {...rest} />
  );
}

interface SimplePaginationProps {
  onNext: (pageId: string, include_ids?: string) => any;
  onPrevious: (pageId: string, include_ids?: string) => any;
  /* A url with params, expecting to have a 'next_page_id' or 'prev_page_id' parameter */
  nextPage: string;
  prevPage: string;
  isNextDisabled?: boolean;
  isPrevDisabled?: boolean;
}
export function BasicPagination({
  onNext,
  onPrevious,
  nextPage,
  prevPage,
  isNextDisabled,
  isPrevDisabled,
}: SimplePaginationProps) {
  const next = parseSearchParams(nextPage);
  const prev = parseSearchParams(prevPage);
  return (
    <ButtonGroup size="sm">
      <ArrowButton
        aria-label="goto previous page"
        onClick={() =>
          onPrevious(prev?.previous_page_id, prev?.include_ids?.toString())
        }
        isDisabled={!prevPage || isPrevDisabled}
        icon={ChevronLeft}
      />
      <ArrowButton
        aria-label="goto next page"
        onClick={() =>
          onNext(next?.next_page_id, next?.include_ids?.toString())
        }
        isDisabled={!nextPage || isNextDisabled}
        icon={ChevronRight}
      />
    </ButtonGroup>
  );
}
