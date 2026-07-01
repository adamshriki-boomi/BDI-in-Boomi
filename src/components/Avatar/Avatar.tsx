import { CenterProps, Image, TextProps } from '@chakra-ui/react';
import { Center, Text } from 'components';
import React from 'react';

enum Size {
  Small,
  Medium,
  XSmall,
  XLarge,
}
export interface AvatarProps extends CenterProps {
  name?: string;
  src?: string;
  alt?: string;
  // any chakra color
  variant?: string;
  size?: Size;
  initialsOnly?: boolean;
}
Avatar.size = Size;
export function Avatar({
  name,
  src,
  alt = '',
  size = Size.Small,
  variant = 'purple.700',
  initialsOnly = true,
  ...rest
}: AvatarProps) {
  return (
    <Center
      bg={variant}
      color="white"
      flexWrap="nowrap"
      borderRadius={50}
      position="relative"
      overflow="hidden"
      boxSize={SizeStyle[size]?.avatarContainer}
      {...rest}
    >
      <Initials name={name} fontSize={SizeStyle[size]?.initials} />
      {src && !initialsOnly && (
        <Image
          src={src}
          alt={alt || name}
          position="absolute"
          h="100%"
          w="100%"
        />
      )}
    </Center>
  );
}
const SizeStyle = {
  [Size.XSmall]: {
    avatarContainer: '20px',
    initials: 'xs',
  },
  [Size.Small]: {
    avatarContainer: '30px',
    initials: 'sm',
  },
  [Size.Medium]: {
    avatarContainer: '45px',
    initials: 'lg',
  },
  [Size.XLarge]: {
    avatarContainer: '80px',
    initials: '30px',
  },
};

interface InitialsProps extends TextProps {
  name: string;
}

export const Initials = ({ name, ...rest }: InitialsProps) => {
  const initials = name?.length
    ? name
        ?.split(' ')
        .map(string => string.substring(0, 1))
        .join('')
    : '';
  return <Text {...rest}>{initials}</Text>;
};
