import {
  Avatar,
  Center,
  Flex,
  Grid,
  Icon,
  InfoIcon,
  LogoutIcon,
  RenderGuard,
  RiveryButton,
  Sparkles,
  Text,
} from 'components';
import { useLogout } from 'containers/Login/hooks/useLogout';
import { DrawerType } from 'layout/Sidebar/common';
import { ChangePassword } from 'modules';
import { useToggle } from 'react-use';
import { useCore } from 'store/core';
import { displayDate } from 'utils/date.utils';
import { SidebarTags } from 'utils/tracking.tags';
import { CogWheel } from '../icons';
import { ReactComponent as GiftIcon } from '../icons/GiftIcon.svg';
import {
  FadingText,
  Section,
  SideBarElement,
  sideBarItemStyle,
} from '../SubComponents';

export default function AccountSection({
  isOpen,
  setDrawer,
  drawerType,
  dismissPopups = () => void 0,
}) {
  const { username, userImage, userDetails } = useCore();
  const isResourceCenterOpen = drawerType === DrawerType.RESOURCE_CENTER;

  return (
    <Flex
      flexDir="column"
      overflow="hidden"
      borderTop="1px"
      borderTopColor="purple.400"
      pt={2}
    >
      <Section
        gap={1}
        items={AccountItems}
        flex={3}
        isOpen={isOpen}
        dismissPopups={dismissPopups}
      />
      <SideBarElement
        isOpen={isOpen}
        icon={<Icon color="white" as={InfoIcon} boxSize={4} mr={1} />}
        text={<FadingText text="Help" isOpen={isOpen} />}
        description="Help"
        onClick={e => {
          e.stopPropagation();
          drawerType === DrawerType.RESOURCE_CENTER
            ? setDrawer(null)
            : setDrawer(DrawerType.RESOURCE_CENTER);
        }}
        aria-expanded={isResourceCenterOpen}
        className="help-center"
        {...sideBarItemStyle}
      />
      <SideBarElement
        isOpen={isOpen}
        icon={
          <Icon
            id="ask-ai-button"
            color="yellow.200"
            as={Sparkles}
            boxSize={4}
            mr={1}
          />
        }
        text={<FadingText color="yellow.200" text="Ask AI" isOpen={isOpen} />}
        id="ask-ai-button"
        description="Ask AI"
        data-pendo-id={SidebarTags.ASK_AI_BUTTON}
        {...sideBarItemStyle}
      />
      <SideBarElement
        cursor="pointer"
        aria-label="user-menu"
        onClick={e => {
          e.stopPropagation();
          drawerType === DrawerType.USER
            ? setDrawer(null)
            : setDrawer(DrawerType.USER);
        }}
        pl={7}
        pr={2}
        mb={2}
        gap={isOpen ? 3 : 0}
        minHeight="48px"
        maxHeight="48px"
        isOpen={isOpen}
        _hover={{ ...sideBarItemStyle?._hover, '& .avatar': { ml: '-14px' } }}
        icon={
          <Avatar
            className="avatar"
            color="font"
            variant="gray.300"
            paddingInlineStart="0px !important"
            name={username}
            src={userImage}
            size={Avatar.size.Small}
            boxSize={6}
            ml="0px"
          />
        }
        text={
          <FadingText
            text={`${userDetails.first_name} ${userDetails.last_name}`}
            isOpen={isOpen}
          />
        }
        description={`${userDetails.first_name} ${userDetails.last_name}`}
      />
    </Flex>
  );
}

const AccountItems = [
  {
    text: 'Settings',
    icon: CogWheel,
    dropdown: true,
    roles: ['admin'],
  },
  {
    text: "What's New",
    icon: GiftIcon,
    id: 'beamer-button',
    'data-pendo-id': SidebarTags.WHATS_NEW_BUTTON,
  },
];

export function UserDrawerContent() {
  const [showPasswordModal, togglePasswordModal] = useToggle(false);
  const { username, userImage, userEmail, user } = useCore();
  const logout = useLogout();

  return (
    <Grid
      templateRows="260px 1fr"
      py={4}
      flexDir="column"
      h="full"
      aria-label="Create data flow drawer"
    >
      <Center
        borderBottom="1px solid var(--chakra-colors-gray-300)"
        mx={4}
        pb={2}
      >
        <Flex
          flexDir="column"
          justify="center"
          alignItems="center"
          py={2}
          px={6}
          gap={4}
        >
          <Avatar
            className="avatar"
            color="font"
            variant="primaryBright"
            paddingInlineStart="0px !important"
            name={username}
            src={userImage}
            size={Avatar.size.XLarge}
            boxSize={20}
            mr={1}
          />
          <Flex justify="center" alignItems="center" flexDir="column">
            <Text fontSize="20px" fontWeight="medium">
              {username}
            </Text>
            <Text color="font-secondary">{userEmail}</Text>
          </Flex>
          <RenderGuard condition={Boolean(user?.last_login)}>
            <Text fontSize="small" color="font-secondary">
              Last login {displayDate(user?.last_login, 'dd-MMM-yy, HH:mm')}
            </Text>
          </RenderGuard>
          <RiveryButton
            variant="default"
            size="sm"
            label="Change Password"
            onClick={togglePasswordModal}
          />
        </Flex>
      </Center>
      <Flex
        alignSelf="flex-end"
        borderTop="1px solid var(--chakra-colors-gray-300)"
        pt={4}
        mx={4}
      >
        <RiveryButton
          variant="text-link"
          color="font-link-secondary"
          label="Log Out"
          textDecoration="none"
          _hover={{ color: 'font-link-hover', textDecoration: 'underline' }}
          aria-label="Log Out"
          onClick={logout}
          leftIcon={<Icon boxSize={5} as={LogoutIcon} />}
        />
      </Flex>
      <ChangePassword
        open={showPasswordModal}
        togglePasswordModal={togglePasswordModal}
      />
    </Grid>
  );
}
