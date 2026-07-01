import { Flex } from 'components';
import { Link } from 'react-router-dom';
import RiveryAlert from 'components/Alert/Alert';
import { ExoText } from 'components/Exosphere/ExoText';
import { ExoSideDrawer } from 'components/Exosphere/ExoSideDrawer';
import MultiEmailsCreatableSelect from 'components/Form/components/MultiEmailsComponent';
import { RiveryButton } from 'components';
import { createSidebarUrl } from 'layout/Sidebar/common';
import { useCallback, useEffect, useState } from 'react';
import { useCore } from 'store/core';
import { useEnvironmentsActions } from 'store/environments';
import { useToastComponent } from 'hooks/useToast';
import { emailValidation } from 'utils/validations';

interface SuspendedVariableDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  initialEmails: string;
  envVariables: Record<string, any> | undefined;
  refetchEnvironments: () => void;
  userOptions: Array<{ value: string; label: string }>;
}

const VARIABLE_NAME = 'Suspended_Rivers_Alert_Group';

const isValidEmail = (email: string): boolean => {
  return emailValidation.test(email.trim());
};

export function SuspendedVariableDrawer({
  isOpen,
  onClose,
  initialEmails,
  envVariables,
  refetchEnvironments,
  userOptions,
}: SuspendedVariableDrawerProps) {
  const [emails, setEmails] = useState(initialEmails);
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState('');
  const { selectedAccountId: accountId, envId } = useCore();
  const { updateVariableValue } = useEnvironmentsActions();
  const { success, error } = useToastComponent();

  // Update local state when initialEmails changes
  useEffect(() => {
    if (isOpen) {
      setEmails(initialEmails);
      setValidationError('');
    }
  }, [isOpen, initialEmails]);

  const handleSave = useCallback(async () => {
    // Validate emails before saving
    const emailsArray = emails
      ? emails
          .split(',')
          .map(e => e.trim())
          .filter(Boolean)
      : [];

    // Validate email format
    const invalidEmails = emailsArray.filter(email => !isValidEmail(email));
    if (invalidEmails.length > 0) {
      setValidationError('All recipients must be valid email addresses');
      return;
    }

    setValidationError('');
    setIsLoading(true);
    try {
      const res: any = await updateVariableValue({
        variable: VARIABLE_NAME,
        variable_value: `[${emails}]`,
        env_id: envId,
      });

      if ([200, 201].includes(res?.payload?.status)) {
        // Refetch environments to get the updated variable value
        await refetchEnvironments();
        success({ description: 'Recipients list saved successfully' });
        onClose();
      }
    } catch (err) {
      error({
        title: 'Failed to save recipients',
        duration: 30000,
        description:
          err?.response?.data?.message ||
          'An error occurred while saving the recipients list',
      });
    } finally {
      setIsLoading(false);
    }
  }, [
    emails,
    envId,
    updateVariableValue,
    refetchEnvironments,
    success,
    error,
    onClose,
  ]);

  const handleClose = useCallback(() => {
    setEmails(initialEmails);
    setValidationError('');
    onClose();
  }, [initialEmails, onClose]);

  return (
    <ExoSideDrawer
      isOpen={isOpen}
      onClose={handleClose}
      title="Edit Recipients Variable"
      onSave={handleSave}
      saveDisabled={isLoading}
      isLoading={isLoading}
      saveLabel="Save"
      cancelLabel="Cancel"
    >
      <Flex flexDirection="column" gap={3}>
        <ExoText
          styleName="Body Small 1"
          color="var(--exo-color-font-secondary)"
        >
          Notifications are sent when a scheduled Data Flow fails repeatedly.{' '}
          <br />A warning is sent after 3 consecutive days, and the Data Flow is
          suspended after 7. Alerts go to the account owner and last modifier,
          with optional additional recipients.
        </ExoText>

        <MultiEmailsCreatableSelect
          label="Additional Recipients (optional)"
          emailsField={{
            value: emails,
            onChange: (newValue: string) => {
              setEmails(newValue);
              setValidationError('');
            },
          }}
          options={userOptions}
          validationMessage={validationError}
        />

        <RiveryAlert
          variant="info"
          description={
            <>
              <ExoText
                style={{ display: 'inline-block' }}
                styleName="Body Small 1 Bold"
              >
                Note:
              </ExoText>{' '}
              This recipient list is synced with the{' '}
              <ExoText
                style={{ display: 'inline-block' }}
                styleName="Body Small 1 Bold"
                color="var(--exo-color-font-secondary)"
              >
                Suspended_Rivers_Alert_Group
              </ExoText>{' '}
              <RiveryButton
                as={Link}
                label="Variable"
                to={createSidebarUrl(
                  'variables',
                  'variables',
                )({ accountId, envId })}
                variant="link"
              />
              . Changes apply immediately in both places.
            </>
          }
        />
      </Flex>
    </ExoSideDrawer>
  );
}
