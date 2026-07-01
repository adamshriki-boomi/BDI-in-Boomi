import {
  Box,
  Link as ChakraLink,
  ChakraProps,
  forwardRef,
  Icon,
  IconButton,
  LinkProps,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuItemProps,
  MenuList,
  MenuProps,
  Portal,
} from '@chakra-ui/react';
import { EnvFeatureFlag } from 'components';
import {
  DeleteIcon,
  DownloadIcon,
  EditIcon,
} from 'components/Icons/components';
import { Tagger } from 'components/Tracking/Tagger';
import { FunctionComponent, ReactNode, useMemo } from 'react';
import { MdMoreVert } from 'react-icons/md';
import { Link } from 'react-router-dom';

type TMenuItem = Omit<MenuItemProps, 'id' | 'value'> & {
  value?: ReactNode;
  divider?: boolean;
  external?: boolean;
  href?: string;
  filterFn?: () => Boolean;
  id?: any;
  featureFlag?: string;
  target?: string;
  tagger?: string;
};

interface RiveryDropdownProps extends Omit<MenuProps, 'children'> {
  headerComponents?: JSX.Element;
  customMenuButton?: FunctionComponent;
  menuButtonAriaLabel?: string;
  menuButtonDisabled?: boolean;
  menuItems: TMenuItem[];
  menuListStyle?: ChakraProps;
  menuButtonStyle?: any;
  useAsPortal?: boolean;
  'data-pendo-id'?: string;
}

function useFilterItems(items: TMenuItem[]) {
  const features = useMemo(() => {
    return items
      .filter(item => (item?.filterFn ? item?.filterFn() : true))
      ?.filter(Boolean);
  }, [items]);
  return features;
}

const EditMenuItem = {
  icon: <Icon as={EditIcon} boxSize={5} />,
  value: 'Edit',
};
const DeleteMenuItem = {
  icon: <Icon as={DeleteIcon} boxSize={5} />,
  value: 'Delete',
};

const DonwloadMenuItem = {
  icon: <Icon as={DownloadIcon} boxSize={5} />,
  value: 'Download',
};

RiveryDropdown.EditMenuItem = EditMenuItem;
RiveryDropdown.DeleteMenuItem = DeleteMenuItem;
RiveryDropdown.DonwloadMenuItem = DonwloadMenuItem;
export default function RiveryDropdown({
  headerComponents = null,
  customMenuButton = null,
  menuButtonAriaLabel = '',
  menuButtonDisabled = false,
  menuItems,
  menuListStyle = null,
  menuButtonStyle = null,
  useAsPortal = false,
  'data-pendo-id': pendoId,
  ...rest
}: RiveryDropdownProps) {
  return (
    <Menu closeOnBlur autoSelect={false} {...rest}>
      <MenuButtonWrapper
        isDisabled={menuButtonDisabled}
        showDefault={!customMenuButton}
        menuButtonStyle={menuButtonStyle}
        menuButtonAriaLabel={menuButtonAriaLabel}
        data-pendo-id={pendoId}
      >
        {customMenuButton}
      </MenuButtonWrapper>
      <PortalWrapper portal={useAsPortal}>
        <MenuList
          zIndex={100}
          minWidth={120}
          py={1}
          bg="white"
          {...menuListStyle}
        >
          <Box>
            {headerComponents}
            {useFilterItems(menuItems)?.map((item, idx) => {
              const featureFlag = item.featureFlag;
              delete item.featureFlag;
              return (
                <MenuItemWrapper
                  key={`menu-item-${item.value}-${idx}`}
                  isLink={Boolean(item.href)}
                  isExternal={item.external}
                  href={item.href}
                  target={item.target}
                >
                  <FeatureFlagWrapper flag={featureFlag}>
                    <TaggerWrapper tagger={item.tagger}>
                      <ChakraMenuItem item={item} />
                    </TaggerWrapper>
                  </FeatureFlagWrapper>
                </MenuItemWrapper>
              );
            })}
          </Box>
        </MenuList>
      </PortalWrapper>
    </Menu>
  );
}

function TaggerWrapper({ tagger = null, children }) {
  return tagger ? <Tagger tags={tagger}>{children}</Tagger> : children;
}

function PortalWrapper({ portal = false, children }) {
  return portal ? <Portal>{children}</Portal> : children;
}

function MenuButtonWrapper({
  showDefault,
  isDisabled,
  children = null,
  menuButtonStyle = null,
  menuButtonAriaLabel,
  ...rest
}) {
  return (
    <MenuButton
      aria-label={menuButtonAriaLabel}
      disabled={isDisabled}
      as={showDefault ? IconButton : children}
      icon={<Icon as={MdMoreVert} boxSize={5} />}
      border={0}
      borderRadius={50}
      size="sm"
      {...menuButtonStyle}
      {...rest}
    />
  );
}

const InternalLink = pathName =>
  forwardRef((props, ref) => {
    return <Link to={pathName} ref={ref} {...props} />;
  });

function MenuItemWrapper({
  isLink,
  isExternal,
  children,
  href,
  target,
}: LinkProps & {
  isLink: boolean;
  isExternal: boolean;
}) {
  return isLink ? (
    <ChakraLink
      as={!isExternal && InternalLink(href ?? '')}
      href={href}
      target={target}
      _hover={{ textDecoration: 'none', color: 'inherit' }}
    >
      {children}
    </ChakraLink>
  ) : (
    <>{children}</>
  );
}

function FeatureFlagWrapper({ children, flag }) {
  return flag ? (
    <EnvFeatureFlag flag={flag}>{children}</EnvFeatureFlag>
  ) : (
    children
  );
}

function ChakraMenuItem({ item, ...rest }) {
  const {
    value: textTypeItem,
    divider,
    admin,
    external,
    filterFn,
    ...restItem
  } = item;
  return (
    <>
      <MenuItem
        pr={5}
        color="font"
        bg="transparent"
        sx={{
          '& .chakra-icon': {
            color: 'background-deselected',
          },
        }}
        _hover={{
          bg: 'background-action-hover-weak!important',
          boxShadow: 'none',
          border: 'none',
          '& .chakra-icon': {
            color: 'background-deselected-hover',
          },
        }}
        {...restItem}
        {...rest}
      >
        {item.asLink && textTypeItem ? (
          <Link to={item.href}>{item.value}</Link>
        ) : (
          item.name || item.value
        )}
      </MenuItem>
      {item.divider ? <MenuDivider m={1} /> : null}
    </>
  );
}
