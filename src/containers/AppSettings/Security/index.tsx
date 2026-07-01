import { Flex, Text } from 'components';
import { useGetIsAccountThatIsManagedByBoomi } from 'containers/Settings/Users/users.helpers';
import PrivateLink from './PrivateLink';
import ReverseSSH from './ReverseSSH';
import SCIMConfiguration from './SCIM';
import SSO from './SSO';
import VPN from './VPN';

export default function Security() {
  const isManagedByBoomi = useGetIsAccountThatIsManagedByBoomi();
  return (
    <Flex flexDir="column" pt={1} gap={16}>
      <Section title="Security and Authentication Settings">
        <SSO />
        {!isManagedByBoomi && <SCIMConfiguration />}
      </Section>
      <Section title="Secure Connection Methods">
        <PrivateLink />
        <VPN />
        <ReverseSSH />
      </Section>
    </Flex>
  );
}

function Section({ children, title }) {
  return (
    <Flex flexDir="column" gap={2}>
      <Text textStyle="M5" color="primary">
        {title}
      </Text>
      <Flex flexDir="column" gap={6} pt={2}>
        {children}
      </Flex>
    </Flex>
  );
}
