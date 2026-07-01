import { FlexProps } from '@chakra-ui/react';
import { Flex } from 'components';
import { PageOverlaySpinner } from 'components/Loaders/Loader';
import * as React from 'react';

interface TabContentProps extends FlexProps {
  loading: boolean;
}

export function TabContent({ loading, children }: TabContentProps) {
  return (
    <Flex gap={5} flexDirection="column" overflow="hidden" w="full">
      {loading ? <PageOverlaySpinner /> : null}
      {children}
    </Flex>
  );
}
