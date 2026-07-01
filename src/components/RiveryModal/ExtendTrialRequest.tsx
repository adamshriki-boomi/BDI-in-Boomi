import { FormTypes, ModalForm } from 'modules';

export const ExtendTrialRequest = ({ showModal, closeModal }) => {
  return (
    <ModalForm
      show={showModal}
      toggle={closeModal}
      type={FormTypes.EXTEND_TRIAL}
      title="Request To Extend Trial"
      clickData={{ message: 'Hi Team, can you please extend my trial?' }}
    />
  );
};
