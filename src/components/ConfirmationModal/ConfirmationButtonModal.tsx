import { IconButton, useDisclosure } from 'components';
import React, { ReactElement } from 'react';
import { MdDelete } from 'react-icons/md';
import { ConfirmationModal } from './ConfirmationModal';

type Props = {
  name: string;
  header?: string;
  type: string;
  children?: ReactElement;
  confirmLabel?: string;
  warningMessage?: string;
  onConfirm: (props?: any) => any;
  ariaLabel?: string;
};

export function ConfirmationButtonModal({
  name,
  onConfirm,
  header,
  type,
  confirmLabel = 'Delete',
  warningMessage = `Are you sure you want to delete ${name}?`,
  children = null,
  ariaLabel = null,
  ...props
}: Props) {
  const { isOpen, onClose, onOpen } = useDisclosure();
  const onClick = e => {
    e.preventDefault();
    onOpen();
    e.stopPropagation();
  };
  return (
    <>
      <ConfirmationModal
        title={header}
        ariaLabel={ariaLabel}
        confirmLabel={confirmLabel}
        description={warningMessage}
        onConfirm={onConfirm}
        onClose={onClose}
        show={isOpen}
      />

      {children ? (
        React.cloneElement(children, { onClick, type })
      ) : (
        <DefaultButtonComponent type={type} onOpen={onClick} />
      )}
    </>
  );
}
const DefaultButtonComponent = ({ type, onOpen, ...props }) => (
  <IconButton
    icon={<MdDelete />}
    size="small"
    p={1}
    variant="primary"
    aria-label={`delete ${type}`}
    onClick={onOpen}
    {...props}
  />
);
