import { TextProps } from '@chakra-ui/react';
import { Text } from 'components';

export const PrimaryHeader = ({ children, ...props }: TextProps) => (
  <Text as="h6" textStyle="R7" textAlign="left" color="primary" {...props}>
    {children}
  </Text>
);
