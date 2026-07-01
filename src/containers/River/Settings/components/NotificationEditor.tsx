import { Box, Grid } from '@chakra-ui/react';
import { RiverySwitch } from 'components/Form/components';
import MultiEmailsCreatableSelect from 'components/Form/components/MultiEmailsComponent';
import { useCallback, useState } from 'react';
export function NotificationEditor({
  status: { email = '', enabled = false } = {},
  name,
  onChange,
  children = null,
}) {
  const [inputValue, setInputValue] = useState('');
  const [validationMessage, setValidationMessage] = useState('');
  const onValueChange = useCallback(
    (emailValue: any) => {
      if (Array.isArray(emailValue)) {
        setValidationMessage('');
        onChange({ email: emailValue.map(e => e.value).join(','), enabled });
        return;
      }
      const value = emailValue?.value;
      if (!MultiEmailsCreatableSelect.isValidValue(value)) {
        setValidationMessage(MultiEmailsCreatableSelect.invalidMessage);
      } else {
        setInputValue('');
        const emails = Boolean(email) ? email.concat(',' + value) : value;
        onChange({ email: emails, enabled });
      }
    },
    [email, enabled, onChange],
  );

  const value = Boolean(email)
    ? email.split(',').map(email => ({ value: email, label: email }))
    : null;

  const onKeyDown = useCallback(
    e => {
      validationMessage && setValidationMessage('');
      if (e.key === 'Enter') {
        if (!MultiEmailsCreatableSelect.isValidValue(e.target.value)) {
          e.preventDefault();
          setValidationMessage(MultiEmailsCreatableSelect.invalidMessage);
          return;
        }
        return;
      }
      if (e.key === ',') {
        e.preventDefault();
        const value = inputValue.trim();
        if (value) {
          onValueChange({ value });
          return;
        }
      }
    },
    [inputValue, onValueChange, validationMessage],
  );

  return (
    <Box mb={3}>
      <RiverySwitch
        ml={1}
        label={`Send Notification on ${name}`}
        name={`enable-notifications-${name}`}
        isChecked={enabled}
        onChange={({ target: { checked: enabled } }) =>
          onChange({ email, enabled })
        }
      />
      {enabled ? (
        <Box maxW="450px">
          {children}
          <Grid
            alignItems="start"
            w="full"
            pl="44px"
            templateColumns="60px 1fr"
          >
            <Box>Email to</Box>
            <MultiEmailsCreatableSelect
              custom
              value={value}
              inputValue={inputValue}
              onInputChange={setInputValue}
              onChange={onValueChange}
              onBlur={() => {
                setInputValue('');
                setValidationMessage('');
              }}
              validationMessage={validationMessage}
              onKeyDown={onKeyDown}
              aria-label={`edit-${name}-notifications-email`}
            />
          </Grid>
        </Box>
      ) : null}
    </Box>
  );
}
