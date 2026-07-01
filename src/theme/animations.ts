import { keyframes } from '@chakra-ui/react';

export const slideInFromRight = keyframes`
0% {
  transform: translateZ(50px) translatex(50px);
  opacity: 0;
}
100% {
  transform: translateZ(0) translateY(0);
  opacity: 1;
}
`;
export const slideInFromRightAnimation = {
  animation: `${slideInFromRight} 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94)`,
};

export const shimmer = keyframes`
100% {
  transform: translateX(100%);
}
`;
export const shimmerAnimation = {
  animation: `${shimmer} shimmer calc(var(--skeleton-duration) * 1s) infinite`,
};

export const revealSlideRight = {
  animation: 'slide-up-from-bottom 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
};
