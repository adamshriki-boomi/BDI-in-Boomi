import {
  Box,
  Center,
  Divider,
  forwardRef,
  IconButton,
  IconProps,
  MenuButton,
} from '@chakra-ui/react';
import {
  ChevronLeft,
  ChevronRight,
  ExclamationInfoFilled,
  Flex,
  Icon,
  RenderGuard,
  RiveryOverlay,
  Text,
} from 'components';
import { useAccountBannerCases } from 'containers/AccountBanner/useAccountBanner';
import RiveryDropdown from 'containers/River/RiverLogic/Logic/components/RiveryChakraMenu';
import { FormTypes, ModalForm } from 'modules';
import { NavLink } from 'react-router-dom';
import { useToggle } from 'react-use';
import { useCore } from 'store/core';
import { useEnvironmentsMenuItems } from './Dropdowns/environmentsMenuItems';
import { useSettingsMenuItems } from './Dropdowns/settingsMenuItems';

export const sideBarItemStyle = {
  cursor: 'pointer',
  _hover: {
    bg: 'primaryLight',
    fontWeight: 600,
    mx: 3,
    pl: 4,
    '&.chakra-menu__menu-button': {
      pl: '0px',
      '& > span > div': {
        pl: 4,
      },
    },
    borderRadius: '4px',

    '& #beamer-button': {
      pl: '14px',
    },
  },
  _expanded: {
    bg: 'primaryLight',
    fontWeight: 600,
    mx: 3,
    pl: 4,
    borderRadius: '4px',
    '& #beamer-button': {
      pl: '14px',
    },
    '&.chakra-menu__menu-button': {
      pl: '0px',
      '& > span > div': {
        pl: 4,
      },
    },
  },
  _activeLink: {
    bg: 'primaryLight',
    fontWeight: 600,
    mx: 3,
    pl: 4,
    borderRadius: '4px',
    '& #beamer-button': {
      pl: '14px',
    },
  },
};

function SideBarTooltipWrap({
  displayTooltip,
  children,
  description,
  overlayProps = null,
}) {
  return !displayTooltip ? (
    children
  ) : (
    <RiveryOverlay
      portal
      placement="start"
      description={description}
      contentProps={{
        w: 'fit-content !important',
      }}
      {...overlayProps}
    >
      {children}
    </RiveryOverlay>
  );
}

export function SideBarElement({
  isOpen,
  icon = null,
  text,
  showArrow = false,
  description,
  id = '',
  displayTooltip = !isOpen,
  ...style
}) {
  return (
    <SideBarTooltipWrap
      description={description}
      displayTooltip={displayTooltip}
    >
      <Flex
        id={id}
        position="relative"
        gap={2}
        pl={7}
        flex={1}
        alignItems="center"
        overflow="hidden"
        borderRadius={0}
        maxHeight="36px"
        minHeight="36px"
        {...style}
      >
        {icon}
        {text}
        {showArrow && isOpen ? <Icon as={ChevronRight} /> : null}
      </Flex>
    </SideBarTooltipWrap>
  );
}

export const ChevronRightIcon = (props: IconProps) => (
  <Icon as={ChevronRight} {...props} />
);
export const ChevronLeftIcon = (props: IconProps) => (
  <Icon as={ChevronLeft} {...props} />
);
export function FadingText({ text, isOpen, ...rest }) {
  return (
    <Flex alignItems="center" w={isOpen ? '112px' : 0}>
      <Text
        color="background-secondary"
        fontSize="sm"
        opacity={isOpen ? 1 : 0}
        overflow="hidden"
        textAlign="left"
        pr={2}
        {...rest}
      >
        {text}
      </Text>
      {rest?.icon && rest.icon}
    </Flex>
  );
}

function IconWrap({ isBeamer = false, isOpen, children }) {
  return isBeamer ? (
    <Center id="beamer-button" pl="26px" pr={isOpen ? 0 : 7}>
      <IconButton
        mb={1}
        ml="-2px!important"
        bg="transparent"
        _hover={{ bg: 'tansparent' }}
        size="xs"
        aria-label="beamer"
      >
        {children}
      </IconButton>
    </Center>
  ) : (
    children
  );
}

export function Section({
  divider = false,
  items,
  isOpen = false,
  dismissPopups = () => void 0,
  ...style
}) {
  const {
    envId,
    selectedAccountId: accountId,
    role,
    isGlobalOperatorRole,
  } = useCore();
  return (
    <Flex flexDir="column" {...style}>
      <RenderGuard condition={divider}>
        <Divider
          borderColor="purple.400"
          maxW={isOpen ? '170px' : '64px'}
          mx="auto"
          mb={3}
        />
      </RenderGuard>
      {items.map(
        (
          {
            roles,
            text,
            icon,
            link = undefined,
            dropdown = false,
            id = '',
            'data-pendo-id': dataPendoId = undefined,
          },
          idx,
        ) => {
          const isAllowedByRole =
            !roles || roles.includes(role) || isGlobalOperatorRole;
          if (!isAllowedByRole) {
            return null;
          }
          const beamerButton = id === 'beamer-button';
          return dropdown ? (
            <SideBarDropdown
              key={`${idx}-${text}`}
              type={text}
              customMenuButton={forwardRef((props, ref) => (
                <DropdownMenuButton
                  isOpen={isOpen}
                  text={text}
                  icon={icon}
                  ref={ref}
                  dismissPopups={dismissPopups}
                />
              ))}
            />
          ) : (
            <SideBarElement
              pl={beamerButton ? 0 : 7}
              id={id}
              data-pendo-id={dataPendoId}
              isOpen={isOpen}
              as={link ? NavLink : Box}
              to={link ? link({ accountId, envId }) : ''}
              {...sideBarItemStyle}
              _hover={{ ...sideBarItemStyle._hover, pl: beamerButton ? 0 : 4 }}
              key={`${idx}-${text}`}
              text={isOpen ? <FadingText isOpen={isOpen} text={text} /> : null}
              icon={
                <IconWrap isBeamer={beamerButton} isOpen={isOpen}>
                  <Icon as={icon} boxSize="18px" color="background-secondary" />
                </IconWrap>
              }
              description={text}
            />
          );
        },
      )}
    </Flex>
  );
}

const menuButtonStyle = {
  '& > span > div': {
    background: 'primaryLight',
    fontWeight: '600',
    marginInlineStart: 3,
    marginInlineEnd: 3,
    paddingLeft: 4,
    borderRadius: '4px',
  },
};

export const DropdownMenuButton = forwardRef(
  ({ text, icon, isOpen, selfIcon = false, dismissPopups, ...props }, ref) => {
    const { showMiniNotification } = useAccountBannerCases({ miniMode: true });
    const isSettingsItem = text === 'Settings';
    const showNotification = showMiniNotification && isSettingsItem;

    return (
      <SideBarTooltipWrap
        description={text}
        displayTooltip={!isOpen}
        overlayProps={{ contentProps: { ml: 0, w: 'fit-content !important' } }}
      >
        <MenuButton
          maxHeight="36px"
          minHeight="36px"
          ref={ref}
          aria-label={text}
          {...props}
          py={4}
          {...(!isOpen && { width: '78px' })}
          onClick={dismissPopups}
          _hover={menuButtonStyle}
          _active={menuButtonStyle}
        >
          <SideBarElement
            isOpen={isOpen}
            text={
              isOpen ? (
                <FadingText
                  isOpen={isOpen}
                  text={text}
                  icon={
                    showNotification && isOpen ? (
                      <Icon
                        marginInlineStart="0px!important"
                        color="data-solid-coral"
                        as={ExclamationInfoFilled}
                        boxSize="16px"
                      />
                    ) : null
                  }
                />
              ) : null
            }
            description={text}
            color="white"
            pl={7}
            icon={<Icon as={icon} boxSize="18px" />}
            showArrow={isOpen}
            aria-expanded={window.location.pathname.includes(
              text.toLowerCase(),
            )}
            {...sideBarItemStyle}
          />
        </MenuButton>
      </SideBarTooltipWrap>
    );
  },
);

function useDropdownItems(setUpgradeForm) {
  const settingsMenuItems = useSettingsMenuItems(setUpgradeForm);

  const environmentsItems = useEnvironmentsMenuItems();

  const menuItems = {
    Settings: settingsMenuItems,
    Environments: environmentsItems,
  };

  return menuItems;
}

const menuListPosition = {
  Settings: '-162px',
  Environments: '-18px',
};

export function SideBarDropdown({ type, customMenuButton }) {
  const [showUpgraedForm, toggleUpgradeForm] = useToggle(false);
  const message =
    'Hey team, please contact me.\n' +
    `I would love to enable this feature for my account.`;

  const menuItems = useDropdownItems(toggleUpgradeForm);
  return (
    <>
      <RiveryDropdown
        useAsPortal
        placement="right"
        menuItems={menuItems[type]}
        aria-label={`${type}-dropdown`}
        customMenuButton={customMenuButton}
        menuListStyle={{
          p: 0,
          minWidth: '230px !important',
          position: 'absolute',
          top: menuListPosition[type],
          left: '-8px',
          borderRadius: '0px 4px 4px 0px',
          borderWidth: 0,
          shadow: 'xl',
        }}
      />
      <ModalForm
        show={showUpgraedForm}
        toggle={toggleUpgradeForm}
        type={FormTypes.CONTACT}
        title="Contact us"
        clickData={{ message }}
      />
    </>
  );
}
