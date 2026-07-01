import { DrawerFooter } from '@chakra-ui/react';
import {
  FooterComponent,
  FooterComponentProps,
} from 'components/RiveryModal/RiveryChakraModal';
import React from 'react';

export const RiveryDrawerFooter = ({
  footerHeight = undefined,
  ...footerProps
}: { footerHeight?: string } & FooterComponentProps) => {
  return (
    <DrawerFooter
      borderTop="1px solid"
      borderColor="gray.300"
      justifyContent="space-between"
      h={footerHeight}
    >
      <FooterComponent justify="space-between" {...footerProps} />
    </DrawerFooter>
  );
};
