import { FormControl } from '@chakra-ui/react';
import { Flex, FormErrorMessage, RiveryModal } from 'components';
import RiveryButton from 'components/Buttons/RiveryButton';
import { Input } from 'components/Form';
import { useToastComponent } from 'hooks/useToast';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useToggle } from 'react-use';
import { useCoreActions } from 'store/core';
import { passwordNote, passwordRegex } from 'utils/validations';

type FormProps = {
  new_password: string;
  confirm_password: string;
  password: string;
};

const hasPasswordChanged = response =>
  response?.payload?.message === 'Password Changed';
const containsErrors = errors => Object.keys(errors)?.length > 0;

type ChangePasswordProps = {
  open?: boolean;
  togglePasswordModal?(): void;
};

export function ChangePassword({
  open,
  togglePasswordModal,
}: ChangePasswordProps) {
  return (
    <RiveryModal
      ariaLabel="change-password-modal"
      show={open}
      toggle={togglePasswordModal}
      title="Change Password"
    >
      <PasswordForm togglePasswordModal={togglePasswordModal} />
    </RiveryModal>
  );
}

function PasswordForm({ togglePasswordModal }) {
  const { updatePassword } = useCoreActions();
  const { success } = useToastComponent();
  const [changeComplete, toggleChangeComplete] = useToggle(false);
  const [isLoading, toggleLoading] = useToggle(false);
  const [responseError, setResponseError] = useState('');
  const { register, handleSubmit, ...formHookApi } = useForm<FormProps>({
    mode: 'onBlur',
    reValidateMode: 'onChange',
  });
  const onChangePassword = async (data: FormProps) => {
    if (containsErrors(formHookApi.formState.errors)) return;
    toggleLoading();
    const response: any = await updatePassword(data);
    if (hasPasswordChanged(response)) {
      toggleChangeComplete(true);
    } else {
      setResponseError(response?.payload);
    }
    toggleLoading();
  };
  const customValidators = {
    confirm_password: {
      validate: value => {
        const newPassword = formHookApi.getValues().new_password?.trim();
        const confirmPassword = value.trim();
        const isValid =
          confirmPassword?.length === 0 || newPassword === confirmPassword;
        return !isValid ? 'Passwords do not match' : isValid;
      },
    },
  };

  const getCustomValidator = (validation, fieldName: string): any =>
    customValidators[fieldName]
      ? { ...customValidators[fieldName], ...validation }
      : validation;

  useEffect(() => {
    if (changeComplete) {
      success({ description: 'Password Changed' });
      formHookApi.clearErrors();
      formHookApi.reset();
      toggleChangeComplete(false);
      togglePasswordModal(false);
    }
  }, [
    changeComplete,
    formHookApi,
    success,
    toggleChangeComplete,
    togglePasswordModal,
  ]);

  return (
    <>
      <form
        aria-label="password form"
        onSubmit={handleSubmit(onChangePassword)}
      >
        <RiveryModal.Body
          as={Flex}
          flexDir="column"
          gap="4"
          justifyContent="stretch"
        >
          {fields.map(({ validate, ...field }) => (
            <Input
              key={field.name}
              required
              {...field}
              api={formHookApi}
              chakra
              ref={
                register(
                  field.name as any,
                  getCustomValidator(validate, field.name),
                ) as any
              }
            />
          ))}
          {responseError?.length > 0 ? (
            <FormControl isInvalid={true}>
              <FormErrorMessage>{responseError}</FormErrorMessage>
            </FormControl>
          ) : null}
        </RiveryModal.Body>
        <RiveryModal.Footer>
          {!changeComplete && (
            <RiveryButton
              variant="primary"
              type="submit"
              disabled={isLoading}
              label="Change Password"
              role="submit"
            />
          )}
        </RiveryModal.Footer>
      </form>
    </>
  );
}

const fields = [
  {
    label: 'Current Password',
    type: 'password',
    name: 'password',
    validate: { required: 'Please enter your current password' },
  },
  {
    label: 'New Password',
    type: 'password',
    name: 'new_password',
    validate: {
      required: true,
      pattern: {
        value: passwordRegex,
        message: passwordNote,
      },
    },
  },
  {
    label: 'Repeat New Password',
    type: 'password',
    name: 'confirm_password',
    validate: { required: true },
  },
];
