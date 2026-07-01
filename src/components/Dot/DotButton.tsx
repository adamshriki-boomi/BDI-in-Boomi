import { IconButton } from '@chakra-ui/react';
import { Box } from 'components';
import React from 'react';
import Dot from './Dot';

export default function DotButton({
  color,
  icon = null,
  size = null,
  onClick = null,
  checked = false,
}) {
  return (
    <IconButton
      my={2}
      icon={
        <Box
          borderRadius={50}
          border={checked ? '1px solid' : null}
          borderColor="brand"
          p={1}
        >
          <Dot color={color} icon={icon} size={size} />
        </Box>
      }
      variant="none"
      _active={{ boxShadow: 'none' }}
      _focus={{ boxShadow: 'none' }}
      aria-label={icon ? `${icon} ${color}` : color}
      onClick={onClick && (() => onClick(color))}
    />
  );
}
