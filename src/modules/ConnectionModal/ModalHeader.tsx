import {
  Heading,
  HStack,
  Image,
  ModalHeader as UIModalHeader,
} from 'components';
import { CloseIconButton } from 'components/Buttons/RiveryButton';
import * as React from 'react';

type ModalHeaderProps = {
  header: string;
  icon: string;
  onClose: () => any;
  style?: any;
};

export function ModalHeader({
  header,
  icon,
  onClose,
  style = null,
}: ModalHeaderProps) {
  return (
    <UIModalHeader
      borderBottom="1px"
      borderBottomColor="gray.300"
      py="2"
      {...style}
    >
      {onClose ? (
        <CloseIconButton
          onClick={onClose}
          aria-label="close"
          position="absolute"
          top={2}
          right={4}
        />
      ) : null}
      <HStack gap={1}>
        <Image src={icon} height={8} />
        <Heading as="h3" fontSize="xl" fontWeight="medium">
          {header}
        </Heading>
      </HStack>
    </UIModalHeader>
  );
}
