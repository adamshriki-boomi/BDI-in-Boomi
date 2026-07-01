import { CollisionDetection } from '@dnd-kit/core';

function getValueIndex(
  array: number[],
  comparator: (value: number, tracked: number) => boolean,
) {
  const result = array.reduce((acc: any, value, index) => {
    if (!acc || comparator(value, acc.value)) {
      return { value, index };
    } else {
      return acc;
    }
  }, null);

  return result.index;
}

const getMinValueIndex = (array: number[]) =>
  getValueIndex(array, (value, tracked) => value < tracked);

export const closestYCenter: CollisionDetection = (rects, rect) => {
  const distances = rects.map(([_, currRect]) =>
    Math.abs(rect.top - (currRect.offsetTop + 0.5 * currRect.height)),
  );
  const minValueIndex = getMinValueIndex(distances);
  return rects[minValueIndex] ? rects[minValueIndex][0] : null;
};
