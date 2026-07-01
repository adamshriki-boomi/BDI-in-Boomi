import { Link, Text } from 'components';
import * as React from 'react';

export function WhitelistIps() {
  return (
    <Text color="font-secondary" fontSize="sm" mt={2}>
      To ensure secure and successful connectivity, please define your{' '}
      <Link
        href="https://help.boomi.com/docs/Atomsphere/Data_Integration/Security/RemoteAccess/ConnectionMethods/connection-methods"
        target="_blank"
        rel="noopener noreferrer"
        color="font-link"
        textDecoration="underline"
      >
        preferred access method
      </Link>
    </Text>
  );
}
