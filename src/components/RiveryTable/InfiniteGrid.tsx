import { GridBox } from 'components';
import React, { useEffect, useRef } from 'react';
import { useScroll } from 'react-use';

/**
 * Added to the grid's end of items list
 * if in view, it will trigger the 'onScrollEnd' function
 */
export const InfiniteGrid = ({ onScrollEnd, ...props }) => {
  const { ref, hasReachedEnd } = useHasReachedEndOfScroll();
  useEffect(() => {
    if (hasReachedEnd && ref?.current) {
      onScrollEnd();
    }
  }, [hasReachedEnd, onScrollEnd, ref]);
  return <GridBox ref={ref} {...props} />;
};

const useHasReachedEndOfScroll = () => {
  const ref = useRef<HTMLDivElement>();
  const scrollY = useScroll(ref);
  const hasReachedEnd = ref?.current
    ? scrollY.y >= ref.current.scrollHeight - ref.current.offsetHeight
    : false;
  return { ref, hasReachedEnd };
};
