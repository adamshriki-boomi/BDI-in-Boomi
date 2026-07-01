import { CenterProps, Image } from '@chakra-ui/react';
import { Center } from 'components';
import React from 'react';

enum Size {
  XXSmall,
  XSmall,
  Small,
  Medium,
  Large,
}
const SizeStyle = {
  [Size.XXSmall]: {
    dotSize: '4px',
  },
  [Size.XSmall]: {
    dotSize: '16px',
  },
  [Size.Small]: {
    dotSize: '32px',
  },
  [Size.Medium]: {
    dotSize: '40px',
  },
  [Size.Large]: {
    dotSize: '48px',
  },
};
Dot.size = Size;

interface DotProps extends CenterProps {
  color: string;
  size?: Size;
  icon?: any;
}

export default function Dot({
  color,
  size = Size.Small,
  icon = null,
  ...rest
}: DotProps) {
  return (
    <Center
      borderRadius={50}
      boxSize={SizeStyle[size]?.dotSize}
      bg={color}
      {...rest}
    >
      {icon ? (
        <Image
          src={`/dist/icons/icon-picker-${icon}.svg`}
          key={`icon-picker-${icon}`}
          alt={icon}
          h="100%"
          w="100%"
        />
      ) : (
        false
      )}
    </Center>
  );
}
