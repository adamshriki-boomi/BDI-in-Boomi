import { Box } from 'components';
import * as React from 'react';

export const StringColorizer = ({ value }: { value: string }) => {
  const bgColor = value ? createColorHash(value).hex : null;
  return (
    <Box
      borderRadius="full"
      marginRight="1"
      h="6px"
      w="6px"
      bgColor={bgColor}
    />
  );
};

// Ref: https://github.com/RolandR/ColorHash
function createColorHash(value: string) {
  const sum = value
    .split('')
    .reduce((result, char) => result + char.charCodeAt(0), 0);
  const calcColorValue = (index: number): any =>
    `0.${Math.sin(sum + index)
      .toString()
      .substr(6)}`;

  const r = ~~(calcColorValue(1) * 256);
  const g = ~~(calcColorValue(2) * 256);
  const b = ~~(calcColorValue(3) * 256);

  const rgb = `rgb(${[r, g, b].join(', ')})`;
  const calcHex = (color: number) =>
    ('00' + color.toString(16)).substr(-2, 2).toUpperCase();

  const hex = [r, g, b].reduce((acc, value) => acc + calcHex(value), '#');

  return {
    r,
    g,
    b,
    rgb,
    hex,
  };
}
