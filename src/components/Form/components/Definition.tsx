import { Box, StyleProps } from 'components';
import * as React from 'react';

export type DefinitionProps = {
  children: string;
};
export function Definition({
  children,
  ...props
}: DefinitionProps & StyleProps) {
  return children ? (
    <Box
      as="aside"
      dangerouslySetInnerHTML={{ __html: children }}
      w="full"
      mb="5"
      fontSize="xs"
      {...props}
    />
  ) : null;
}
