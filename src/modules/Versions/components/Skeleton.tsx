import { Box, keyframes, Skeleton, SkeletonProps } from 'components';
import * as React from 'react';

interface VersionSkeletonProps extends SkeletonProps {
  loading: boolean;
}
/**
 * wraps a component (as) with a loading state that mimics the shape of your yet-to-load content
 */
export function VersionSkeleton({
  loading,
  width,
  children = null,
  ...props
}: VersionSkeletonProps) {
  return loading ? (
    <Skeleton
      {...props}
      width={loading && width}
      animation={
        loading && `${colorChange} 0.5s ease-in-out infinite alternate both`
      }
    >
      {children}
    </Skeleton>
  ) : (
    <Box {...props}>{children}</Box>
  );
}

const colorChange = keyframes`
0% {
  background-color: var(--chakra-colors-gray-200);
  color: var(--chakra-colors-gray-200);
}

100% {
  background-color: var(--chakra-colors-gray-400);
  color: var(--chakra-colors-gray-400);
}
`;
