import { Box, BoxProps } from '@chakra-ui/react';
import { ReactNode } from 'react';

interface Props extends BoxProps {
  header?: string;
  children: ReactNode;
}

export function View({ header, children, ...props }: Props) {
  return (
    <Box
      layerStyle="base"
      mx="3"
      mt="3"
      overflow="auto"
      p={header ? '3' : '0'}
      gridTemplateRows="min-content"
      {...props}
    >
      {header ? <h3>{header}</h3> : null}
      {children}
    </Box>
  );
}
