// import { InfiniteLoader } from 'react-virtualized';
import { Box } from '@chakra-ui/react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { memo, useCallback, useLayoutEffect, useRef } from 'react';
import { useIntersection } from 'react-use';

interface InfiniteScrollComponentProps {
  list: any[];
  component(item: any, index: number): React.ReactNode;
  rowHeight: number;
  fetchMoreData?(): void;
  ariaLabel?: string;
  listHeight?: number | string;
  // indicates a next page exists so fetchMoreData should be invoked
  hasMore?: boolean;
  isFetching?: boolean;
  onScrollReady?: (list: HTMLDivElement) => any;
  overflow?: string;
}

export const InfiniteScrollComponent = ({
  list,
  component,
  rowHeight,
  fetchMoreData = undefined,
  ariaLabel = '',
  listHeight = 'full',
  hasMore = false,
  isFetching = false,
  onScrollReady,
  overflow = 'auto',
}: InfiniteScrollComponentProps) => {
  const itemCount = list?.length || 0;
  const parentRef = useRef(null);
  const { getVirtualItems, getTotalSize } = useVirtualizer({
    count: itemCount,
    getScrollElement: () => parentRef.current,
    estimateSize: useCallback(() => rowHeight, [rowHeight]),
    overscan: 5,
  });
  const intersectionRef = useRef(null);
  const intersection = useIntersection(intersectionRef, {
    root: null,
    rootMargin: '0px',
    threshold: 1,
  });
  const isLoadMoreDisabled = intersection && intersection.intersectionRatio < 1;
  const setupRef = useCallback(
    (el: HTMLDivElement) => {
      if (parentRef?.current) return;
      parentRef.current = el;
      onScrollReady && onScrollReady(el);
    },
    [onScrollReady, parentRef],
  );

  return (
    <Box
      aria-label={ariaLabel}
      ref={setupRef}
      height={listHeight}
      overflow={overflow}
      position="relative"
    >
      <Box willChange="transform" height={`${getTotalSize()}px`}>
        {getVirtualItems().map(({ index, size, start }) => (
          <VirtualItem
            component={component}
            index={index}
            item={list[index]}
            key={`infinite-scroll-${index}`}
            listLength={itemCount}
            height={`${size}px`}
            transform={`translateY(${start}px)`}
          >
            {index === itemCount - 1 ? (
              <Box ref={intersectionRef}>
                <LoadMore
                  enabled={!isLoadMoreDisabled}
                  show={hasMore}
                  onFetch={fetchMoreData}
                  isFetching={isFetching}
                />
              </Box>
            ) : null}
          </VirtualItem>
        ))}
      </Box>
    </Box>
  );
};
const LoadMore = ({ enabled, show, onFetch, isFetching }) => {
  useLayoutEffect(() => {
    if (!isFetching && show && enabled && onFetch) {
      onFetch();
    }
  }, [enabled, isFetching, onFetch, show]);

  return show ? <Box height="100px" /> : null;
};
const VirtualItemComponent = ({
  component: Component,
  index,
  item,
  listLength,
  children = null,
  ...style
}) => {
  return item ? (
    <Box position="absolute" top={0} left={0} width="full" {...style}>
      <Component item={item} index={index} listLength={listLength} />
      {children}
    </Box>
  ) : null;
};
const VirtualItem = memo(VirtualItemComponent);
