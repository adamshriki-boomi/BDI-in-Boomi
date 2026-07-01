import { RiveryModal } from 'components';
import { useToastComponent } from 'hooks/useToast';
import React, { ReactElement, useCallback } from 'react';
import { useToggle } from 'react-use';
import MarketoForm from 'utils/marketoForms';

type SupportProps = {
  title?: string;
  type?: FormTypes;
  message?: string;
  children: ReactElement;
  toggleParentModal?: any;
};

export enum FormTypes {
  EXTEND_TRIAL = 'VITE_MARKETO_EXTEND_TRIAL_FORM',
  CONTACT = 'VITE_MARKETO_CONTACT_FORM',
  CONTACT_SOURCE = 'VITE_MARKETO_CONTACT_SOURCE_FORM',
  REQUEST_NEW_INTEGRATION = 'VITE_MARKETO_REQUEST_NEW_INTEGRATION_FORM',
}

export function ModalForm({
  type,
  show,
  toggle,
  toggleParentModal = null,
  title,

  clickData = {},
}) {
  const { success } = useToastComponent();

  const [isSubmitted, toggleIsSubmitted] = useToggle(false);
  const onClose = () => {
    toggle();
    toggleParentModal && toggleParentModal();
    toggleIsSubmitted(false);
  };
  const onFormSubmit = ($form: HTMLIFrameElement) => {
    setTimeout(() => {
      onClose();
    }, 500);
  };

  const onSuccess = useCallback(
    () => success({ description: 'Your request was submited' }),
    [success],
  );

  return (
    <>
      <RiveryModal
        modalProps={{ closeOnOverlayClick: false }}
        toggle={onClose}
        title={isSubmitted ? 'Message Sent!' : title}
        show={show}
        style={{
          content: {
            height: 'auto',
          },
        }}
        footer={
          isSubmitted
            ? {
                saveLabel: 'Done',
                cancelLabel: null,
              }
            : null
        }
        body={
          <MarketoForm
            type={type}
            onSuccess={onSuccess}
            onSubmit={onFormSubmit}
            clickData={clickData}
          />
        }
      />
    </>
  );
}
export function ModalFormWrapper({
  title = "We're always ready to help!",
  type = FormTypes.CONTACT,
  children,
  message = null,
  toggleParentModal = null,
}: SupportProps) {
  const [show, toggle] = RiveryModal.useModal();

  return (
    <>
      {React.cloneElement(children, { onClick: toggle })}
      <ModalForm
        type={type}
        show={show}
        clickData={{ message }}
        toggle={toggle}
        title={title}
        toggleParentModal={toggleParentModal}
      />
    </>
  );
}
