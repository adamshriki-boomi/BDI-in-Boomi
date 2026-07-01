import {
  CopyIcon,
  Flex,
  HStack,
  Icon,
  ListItem,
  RiveryButton,
  Text,
  UnorderedList,
} from 'components';
import RiveryAlert from 'components/Alert/Alert';
import MultiEmailsCreatableSelect from 'components/Form/components/MultiEmailsComponent';
import { useCopyToClipboardWithToast } from 'hooks/useCopyToClipboard';
import { ConnectionSetup } from 'modules/SourceTarget/components/ConnectionSetup';
import { useCallback } from 'react';
import { useController, useFormContext } from 'react-hook-form';
import { useEffectOnce } from 'react-use';
import { useCore } from 'store/core/hooks/useCore';

const normalizeEmailValue = (value: any): string => {
  if (!value) return '';
  return Array.isArray(value) ? value.join(',') : String(value);
};

export function TargetEmail({ connection }) {
  return (
    <Flex
      flexDir="column"
      gap={8}
      height="full"
      w="full"
      overflow="auto"
      sx={{
        scrollbarGutter: 'stable',
      }}
    >
      {/* Email target doesn't use connections, we use ConnectionSetup to display the target's title */}
      <ConnectionSetup
        datasource={connection}
        value={null}
        onChange={() => {}}
        label="Target"
        showConnectionSection={false}
      />

      <Flex w="full" justify="center">
        <Flex w="440px" gap={3} flexDir="column">
          <EmailSettings />
        </Flex>
      </Flex>
    </Flex>
  );
}

function EmailSettings() {
  const formApi = useFormContext();
  const { userEmail } = useCore();
  const { field: rawEmailsField } = useController({
    name: 'river.properties.target.email_list',
    control: formApi.control,
  });

  useEffectOnce(() => {
    if (!rawEmailsField.value) {
      rawEmailsField.onChange(userEmail);
    }
  });

  // Normalize emails to always be a string (handle both string and array from DB)
  const emailsField = {
    ...rawEmailsField,
    value: normalizeEmailValue(rawEmailsField.value),
  };

  const { copyToClipboard } = useCopyToClipboardWithToast();

  const copyEmailAddress = useCallback(() => {
    copyToClipboard(emailsField.value);
  }, [copyToClipboard, emailsField.value]);

  return (
    <Flex flexDir="column" gap={4}>
      <Flex flexDir="column">
        <Text textStyle="M6" color="primary">
          Email Address
        </Text>
        <Text textStyle="R7" color="font-secondary">
          Connect to Gmail, Outlook, or any other email account that supports
          IMAP. When it's done, an email will be sent with a link to download
          the results.
        </Text>
      </Flex>
      <HStack alignItems="start">
        <MultiEmailsCreatableSelect
          placeholder="Enter email addresses"
          emailsField={emailsField}
        />
        <RiveryButton
          label="Copy"
          variant="outlined-primary"
          leftIcon={<Icon as={CopyIcon} />}
          onClick={copyEmailAddress}
        />
      </HStack>
      <RiveryAlert
        variant="warning-light"
        description={
          <UnorderedList ml={6}>
            <ListItem>Email links are only valid for 72 hours.</ListItem>
            <ListItem>
              Only 200,000 rows will be extracted per source file.
            </ListItem>
          </UnorderedList>
        }
      />
    </Flex>
  );
}
