import {
  Flex,
  HStack,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  StyleProps,
  Text,
} from '@chakra-ui/react';
import { Box } from 'components';
import RiveryButton, { CloseIconButton } from 'components/Buttons/RiveryButton';
import { RenderGuard } from 'components/RenderGuard';
import React, { ReactNode } from 'react';
import { useToggle } from 'react-use';
import { Tagger } from '../Tracking/Tagger';

export type Footer = {
  notification?: ReactNode;
  saveLabel?: ReactNode;
  cancelLabel?: ReactNode;
  handleOnClose?: () => void;
  disabledSave?: boolean;
  justify?: 'end' | 'space-between';
};
export type RiveryModalProps = {
  body?: ReactNode;
  hasFooter?: boolean;
  'data-pendo-id'?: string;
  /**
   * children is supposed to be used when you want to compose/design the modal's inner content on your own
   * usually - it's relevant when used with a form
   */
  children?: ReactNode;
  title?: ReactNode;
  disabledSave?: boolean;
  show?: boolean;
  footer?: Footer;
  modalProps?: any;
  toggle?: () => any;
  ariaLabel?: string;
  onClose?: () => any;
  onSuccess?: () => any;
  backdrop?: 'static' | boolean;
  centered?: boolean;
  headerChildren?: ReactNode;
  style?: {
    content?: StyleProps;
    header?: StyleProps;
    body?: StyleProps;
    footer?: StyleProps;
  };
  variant?: string;
  headerLess?: boolean;
};

RiveryModal.useModal = useModal;
RiveryModal.Body = ModalBody;
RiveryModal.Footer = ModalFooter;

export function RiveryModal({
  children,
  body,
  title,
  show = false,
  toggle,
  onClose,
  onSuccess = undefined,
  modalProps = null,
  ariaLabel = undefined,
  backdrop = 'static',
  footer = undefined,
  centered = true,
  headerChildren,
  style,
  variant,
  headerLess = false,
  'data-pendo-id': pendoId,
}: RiveryModalProps) {
  const handleOnClose = () => {
    onClose && onClose();
    toggle && toggle();
  };
  const handleOnSuccess = () => {
    onSuccess && onSuccess();
    toggle && toggle();
  };
  return (
    <Modal
      isOpen={show}
      onClose={handleOnClose}
      isCentered={centered}
      variant={variant}
      scrollBehavior="inside"
      {...modalProps}
    >
      {backdrop ? <ModalOverlay /> : null}

      <ModalContent
        maxHeight="80vh"
        aria-label={ariaLabel}
        data-pendo-id={pendoId}
        {...style?.content}
      >
        {headerLess ? null : (
          <ModalHeader
            as={Flex}
            justifyContent="space-between"
            alignItems="center"
            {...style?.header}
          >
            {title ? <Text textStyle="M6">{title}</Text> : null}
            {headerChildren}
            <RenderGuard condition={modalProps?.isClosable !== false}>
              <CloseIconButton
                onClick={handleOnClose}
                aria-label="close"
                position="relative"
                left="2"
                ml={
                  !Boolean(title) && !Boolean(headerChildren) ? 'auto' : 'unset'
                }
              />
            </RenderGuard>
          </ModalHeader>
        )}
        {body ? (
          <ModalBody
            as={Flex}
            px="6"
            pb="6"
            flexDir="column"
            overflow="hidden"
            overflowY="auto"
            {...style?.body}
          >
            {body}
          </ModalBody>
        ) : null}
        {children}
        {footer ? (
          <ModalFooter {...style?.footer}>
            <FooterComponent
              handleOnClose={handleOnClose}
              handleOnSuccess={handleOnSuccess}
              {...footer}
            />
          </ModalFooter>
        ) : null}
      </ModalContent>
    </Modal>
  );
}

function useModal(visible = false) {
  return useToggle(visible);
}

export interface FooterComponentProps extends Footer {
  handleOnClose(): void;
  handleOnSuccess(): void;
}

export const FooterComponent = ({
  handleOnSuccess,
  handleOnClose,
  disabledSave = false,
  saveLabel = 'Save',
  cancelLabel = 'Cancel',
  notification = null,
  justify = 'end',
}: FooterComponentProps) => {
  return (
    <HStack justify={justify} gap={2} m="0" w="full">
      {notification ? <Box mr="auto">{notification}</Box> : null}
      <Tagger tags="modal-cancel">
        {typeof cancelLabel === 'string' ? (
          <RiveryButton
            size="small"
            variant="default"
            label={cancelLabel}
            onClick={handleOnClose}
          />
        ) : (
          cancelLabel
        )}
      </Tagger>
      <Tagger tags="modal-close">
        {typeof saveLabel === 'string' ? (
          <RiveryButton
            size="small"
            variant="primary"
            label={saveLabel}
            disabled={disabledSave}
            onClick={handleOnSuccess}
            type="submit"
          />
        ) : (
          saveLabel
        )}
      </Tagger>
    </HStack>
  );
};
