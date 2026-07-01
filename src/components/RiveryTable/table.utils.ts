const pageSpread = 2;

export function calculatePagination(
  currentIndex: number,
  lastIndex: number,
): { pageNum: number; label?: string }[] {
  const right = Math.min(
    Math.max(Number(currentIndex) + pageSpread + 1, 2 * pageSpread + 1),
    Number(lastIndex),
  );
  const left = Math.max(right - 2 * pageSpread + 1, 2);

  const head =
    left > 2
      ? [
          { pageNum: 1 },
          {
            label: left === 3 ? '2' : '...',
            pageNum: left - 1,
          },
        ]
      : [{ pageNum: 1 }];
  const tail =
    right < Number(lastIndex)
      ? [
          {
            label: right === lastIndex - 1 ? lastIndex - 1 : '...',
            pageNum: right,
          },
          { pageNum: lastIndex },
        ]
      : [{ pageNum: lastIndex }];

  return [
    head,
    Array.from({ length: right - left }, (_, index) => ({
      pageNum: left + index,
    })),
    tail,
  ].flat();
}
