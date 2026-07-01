import { Portal } from '@chakra-ui/react';
import { Box, Fade, Grid } from 'components';
import { DrawerType, WIDE_MENU_LG } from '../common';
import { ResourceCenterContent } from '../ResourceCenter';
import { AccountEnvSelection } from './AccountEnvSelection';
import { CreateRiverDrawerContent } from './CreateRiver';
import { UserDrawerContent } from './Sections/AccountSettings';

const Drawers = {
  [DrawerType.ENVIRONMENTS]: AccountEnvSelection,
  [DrawerType.CREATE_RIVER]: CreateRiverDrawerContent,
  [DrawerType.USER]: UserDrawerContent,
  [DrawerType.RESOURCE_CENTER]: ResourceCenterContent,
};
export const DrawersWidth = {
  [DrawerType.CREATE_RIVER]: WIDE_MENU_LG,
  [DrawerType.RESOURCE_CENTER]: WIDE_MENU_LG,
};
export function DrawerComponent({ drawerType, setDrawer }) {
  const Component = Drawers?.[drawerType];
  return Component ? <Component setDrawer={setDrawer} /> : <div />;
}

export const SidebarDrawer = ({
  onClose,
  offsetLeft,
  isDisplayed,
  onDrawerChange,
  type,
  ...props
}) => {
  return (
    <Box
      bg="blackAlpha.600"
      position="fixed"
      boxSize="full"
      transform={`translateX(${isDisplayed ? offsetLeft : '-200%'})`}
    >
      <Grid
        onClick={onClose}
        height="full"
        position="fixed"
        width="full"
        visibility={'visible'}
        overflow="hidden"
        transition="all 0.3s"
        {...props}
      >
        <Portal>
          <Backdrop show={isDisplayed} />
        </Portal>
        <Grid
          aria-expanded={isDisplayed}
          position="absolute"
          zIndex="modal"
          h="100vh"
          bg="white"
          boxShadow="7px 0 7px 0 rgba(0, 0, 0, 0.1)"
          w={DrawersWidth[type] ?? '300px'}
          transition="transform 0.3s ease-out"
        >
          <Box overflow="hidden" onClick={e => e.stopPropagation()}>
            <DrawerComponent setDrawer={onDrawerChange} drawerType={type} />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};
const Backdrop = ({ show }) => (
  <Fade in={show}>
    {show ? (
      <Box position="fixed" h="100vh" w="100vw" zIndex="base" inset={0} />
    ) : null}
  </Fade>
);
