import { Flex, Icon, RiveryButton, Text } from 'components';
import {
  BookOpen,
  Newspaper,
  RdsStatusMonitor,
  VideoCamera,
} from 'components/Icons/components';
import Community from 'components/Icons/components/Community';
import SvgSupport from 'components/Icons/components/Support';
import { EnvelopeIcon } from 'layout/Sidebar/components/icons';

export function ExternalLink({ text, link, icon, onClick = null }) {
  return (
    <RiveryButton
      w="fit-content"
      color="font-link-secondary"
      fontWeight="normal"
      justifyContent="start"
      variant="link"
      label={text}
      href={!onClick ? link : null}
      onClick={onClick}
      leftIcon={<Icon as={icon} boxSize={4} />}
      target="_blank"
      h="24px"
      textDecoration="none"
      _hover={{
        color: 'font-link-hover',
        fontWeight: 'medium',
        textDecoration: 'underline',
      }}
      _focus={{
        color: 'font-link-hover',
      }}
      size="small"
    />
  );
}

export function ExternalLinks({ links, title }) {
  return (
    <Flex flexDir="column" gap={2}>
      <Text textStyle="M8">{title}</Text>
      <Flex flexDir="column" gap={2}>
        {links.map(({ icon, text, link, onClick }, idx) => (
          <ExternalLink
            key={idx}
            text={text}
            link={link}
            icon={icon}
            onClick={onClick}
          />
        ))}
      </Flex>
    </Flex>
  );
}

export const LearnMoreLinks = [
  {
    icon: BookOpen,
    text: 'Documentation',
    link: 'https://help.boomi.com/docs/Atomsphere/Data_Integration/GettingStarted/start-here',
  },
  { icon: Newspaper, text: 'Blog', link: 'https://rivery.io/blog/' },
  {
    icon: VideoCamera,
    text: 'Webinars',
    link: 'https://rivery.io/downloads-category/webinars/',
  },
];

export const UpdatesLinks = (scheduleMeeting, isTrial) => [
  {
    icon: RdsStatusMonitor,
    text: 'System Status',
    link: 'https://status.boomi.com/',
  },
  {
    icon: Community,
    text: 'Community',
    link: 'https://community.boomi.com/s/topic/0TO6S000008fYtTWAU/boomi-data-integration',
  },
  {
    icon: SvgSupport,
    text: 'Support Portal',
    onClick: () =>
      window.open(
        isTrial
          ? 'https://rivery.io/contact-us/'
          : 'https://community.boomi.com/s/support',
        '_blank',
      ),
  },
  {
    icon: EnvelopeIcon,
    text: 'Contact Sales',
    link: null,
    onClick: () => scheduleMeeting(),
  },
];
