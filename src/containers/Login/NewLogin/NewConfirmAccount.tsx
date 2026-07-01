import { Box, Flex, Text } from 'components';
import React from 'react';
import { useLocation } from 'react-router-dom';
import { Contact, NewLoginBox } from './NewLoginBox';

export function NewConfirmAccount({ exoTheme }) {
  const location = useLocation<{ user_email?: string }>();
  const email = location?.state?.user_email;

  return (
    <NewLoginBox
      header={null}
      {...(!exoTheme && {
        border: '2px',
        borderColor: 'purple.200',
        shadow: 'md',
      })}
    >
      <Flex h="full" justifyContent="center" flexDir="column" gap={6}>
        <Box color="primary">
          <Text textStyle="M6">You’re just a step away...</Text>
          <Text>Check your inbox to verify your email address</Text>
        </Box>
        <Box color="font">
          We’ve sent an email to <strong>{email}</strong>
          <br />
          with a link to complete your account setup.
        </Box>
        <Box>
          <Contact />
        </Box>
      </Flex>
    </NewLoginBox>
  );
}
