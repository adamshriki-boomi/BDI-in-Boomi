import { ExLoader, LoaderSize } from '@boomi/exosphere';
import { Divider, Flex, Icon, RiveryButton, Text } from 'components';
import { useHistory } from 'react-router-dom';
import { useCore } from 'store/core';

export function getDayPart() {
  const now = new Date();
  const hours = now.getHours();
  const dayPart = hours < 12 ? 'Morning' : hours < 18 ? 'Afternoon' : 'Evening';
  return dayPart;
}

export function Welcome() {
  const { username } = useCore();
  return (
    <Flex flexDir="column" gap={1}>
      <Text textStyle="B4" color="purple.600" className="brand-title">
        Good {getDayPart()}, {username}
      </Text>
      <Text textStyle="R7" color="font-secondary">
        Quickly create new Data Flows or access your recent activity and updates
      </Text>
      <Divider color="border-contrast" w="full" pt={4} />
    </Flex>
  );
}

export function RiversListSpinner() {
  return (
    <Flex
      top="0px"
      left="0px"
      position="absolute"
      justifyContent="center"
      opacity="0.8"
      w="full"
      color="brand"
      bgColor="background-secondary"
      h="inherit"
      pt="200px"
      zIndex={1}
    >
      <ExLoader size={LoaderSize.MEDIUM} />
    </Flex>
  );
}

export function ExternalLinks({
  text,
  link,
  icon,
  toggleSupportForm = void 0,
  resourceCenter = false,
  onClick: propsOnclick,
}) {
  const { push, location } = useHistory();
  return (
    <RiveryButton
      w="fit-content"
      justifyContent="start"
      variant="text-link"
      fontWeight="normal"
      color="font-link-secondary"
      textDecoration="none"
      label={text}
      href={link}
      pl={0}
      leftIcon={<Icon as={icon} boxSize={4} />}
      target="_blank"
      _hover={{
        color: 'font-link-hover',
        fontWeight: 'medium',
        textDecoration: 'underline',
      }}
      onClick={() => {
        if (propsOnclick) {
          propsOnclick();
        } else if (resourceCenter) {
          push({
            pathname: location.pathname,
            state: { resource_center: true },
          });
        } else if (!link) {
          toggleSupportForm(true);
        }
      }}
      h="24px"
    />
  );
}
