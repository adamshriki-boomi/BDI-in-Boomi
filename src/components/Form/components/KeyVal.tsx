import { StyleProps } from '@chakra-ui/react';
import { Box } from 'components';
import * as React from 'react';
export enum FontWeight {
  LIGHT = 'light',
  NORMAL = 'normal',
  MEDIUM = 'medium',
  BOLD = 'bold',
}
export function KeyVal({
  display_name,
  value = null,
  fontWeight = FontWeight.LIGHT,
  styleProps = null,
}: {
  display_name: string;
  value?: string;
  fontWeight?: FontWeight;
  styleProps?: StyleProps;
}) {
  return (
    <Box fontWeight={fontWeight} {...styleProps}>
      {display_name}: <u>{value}</u>
    </Box>
  );
}
