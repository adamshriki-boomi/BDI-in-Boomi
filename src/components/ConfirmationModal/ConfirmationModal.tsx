import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  ButtonProps,
  Flex,
  Icon,
} from '@chakra-ui/react';
import { RenderGuard, Text } from 'components';
import { RiveryButton } from 'components/Buttons';
import React, { ReactNode } from 'react';
import { ExclamationCircle, OutlinedClose } from '../Icons/';

const icons = {
  error: OutlinedClose,
  warning: ExclamationCircle,
  success: ExclamationCircle,
  info: ExclamationCircle,
};
const variantsToColorScheme = {
  error: 'danger',
  warning: 'danger',
  success: 'success',
  info: 'info',
};
export interface ConfirmationModalProps {
  children?: ReactNode;
  description?: string;
  onConfirm?: (props?: any) => any;
  confirmLabel?: ReactNode;
  confirmColorScheme?: any;
  confirmProps?: ButtonProps;
  cancelLabel?: string;
  onCancel?: (props?: any) => void;
  onClose?: () => any;
  footerExtraButtons?: ReactNode;
  variant?: 'error' | 'warning' | 'success' | 'info';
  title: ReactNode;
  show?: boolean;
  ariaLabel?: string;
  customConfirm?: ReactNode;
  closeOnOverlayClick?: boolean;
  className?: string;
  dialogWidth?: string;
}
export function ConfirmationModal({
  description = '',
  onConfirm,
  onCancel = null,
  onClose,
  children = null,
  confirmLabel = 'Yes',
  cancelLabel = 'Cancel',
  confirmProps,
  variant = 'error',
  confirmColorScheme,
  title,
  show = false,
  footerExtraButtons = null,
  ariaLabel,
  customConfirm = null,
  closeOnOverlayClick = true,
  className = null,
  dialogWidth = 'md',
}: ConfirmationModalProps) {
  const cancelRef = React.useRef();
  return (
    <>
      <AlertDialog
        isOpen={show}
        onClose={() => {
          onCancel && onCancel();
          onClose && onClose();
        }}
        leastDestructiveRef={cancelRef}
        isCentered
        variant="confirmation"
        closeOnOverlayClick={closeOnOverlayClick}
      >
        <AlertDialogOverlay>
          <AlertDialogContent
            aria-label={ariaLabel}
            className={className}
            maxW={dialogWidth}
          >
            <AlertDialogHeader as={Flex} gap="3" pb={2}>
              <Icon as={icons?.[variant]} w={6} h={6} color={variant} />
              {title}
            </AlertDialogHeader>
            <AlertDialogBody borderTop="1px" borderTopColor="gray.300">
              {description ? (
                <Text m={0} dangerouslySetInnerHTML={{ __html: description }} />
              ) : null}
              {children}
            </AlertDialogBody>

            <AlertDialogFooter gap="2">
              <RenderGuard condition={cancelLabel !== null}>
                <RiveryButton
                  label={cancelLabel}
                  variant="text"
                  onClick={() => {
                    onCancel && onCancel();
                    onClose && onClose();
                  }}
                />
              </RenderGuard>
              {footerExtraButtons}
              {customConfirm ? (
                customConfirm
              ) : (
                <RiveryButton
                  label={confirmLabel}
                  textTransform="capitalize"
                  variant="primary"
                  colorScheme={
                    confirmColorScheme || variantsToColorScheme[variant]
                  }
                  onClick={() => {
                    onConfirm();
                    onClose && onClose();
                  }}
                  {...confirmProps}
                />
              )}
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
}
