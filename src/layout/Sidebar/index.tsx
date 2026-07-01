import { Flex, Grid } from 'components';
import { LoginRoutes } from 'containers/Login/LoginRoutes';
import {
  createScriptNode,
  loadScript,
} from 'modules/LoadExternals/LoadExternals';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { useToggle } from 'react-use';
import { useCore } from 'store/core';
import { getOId } from 'utils/api.sanitizer';
import { DrawerType, SLIM_MENU, WIDE_MENU } from './common';
import { SidebarDrawer } from './components/DrawerComponent';
import { PopUp } from './components/MiniOnboardingPopup';
import AccountSection from './components/Sections/AccountSettings';
import { PagesSection } from './components/Sections/Pages';
import { HeaderSection } from './components/Sections/TopSection';

export const Beamer = {
  src: 'https://app.getbeamer.com/js/beamer-embed.js',
  type: 'text/javascript',
  prodOnly: true,
};

export default function SideBar({ setSideBarWidth = null }) {
  const { pathname, search, state } = useLocation<any>();
  const { push } = useHistory();
  const [menuOpen, setOpen] = useToggle(true);
  const [drawerType, setDrawer] = useState(null);
  const { user } = useCore();

  const resetDrawer = useCallback(() => {
    if (state?.resource_center) {
      push({
        state: null,
      });
    }
    setDrawer(null);
  }, [push, state?.resource_center]);

  loadScript(Beamer);

  createScriptNode(BeamerConfig(user));
  useEffect(() => {
    if (state?.resource_center) {
      setDrawer(DrawerType.RESOURCE_CENTER);
    }
  }, [state?.resource_center]);

  const drawerWidth = useMemo(
    () => (menuOpen ? WIDE_MENU : SLIM_MENU),
    [menuOpen],
  );

  useEffect(
    () => setSideBarWidth && setSideBarWidth(drawerWidth),
    [drawerWidth, setSideBarWidth],
  );
  const isDrawerOpened = Boolean(drawerType);
  const [showOnboardingPopup, toggleShowPopup] = useToggle(true);
  const isInOnboardingPage =
    pathname.includes(LoginRoutes.ONBOARDING) ||
    search.includes('create_first_river=true');

  return (
    <Flex
      h="100vh"
      zIndex={6}
      role="navigation"
      aria-label="sidebar"
      bgColor="brand"
    >
      <Flex
        overflowY="auto"
        overflowX="hidden"
        sx={{
          '&::-webkit-scrollbar': {
            w: 2,
            bg: 'brand',
            border: '1px solid var(--chakra-colors-purple-400)',
          },
          '&::-webkit-scrollbar-thumb': {
            bg: 'secondary',
          },
        }}
        position="relative"
      >
        <SidebarDrawer
          onClose={resetDrawer}
          onDrawerChange={setDrawer}
          offsetLeft={drawerWidth}
          isDisplayed={isDrawerOpened}
          type={drawerType}
        />
        <Grid
          onClick={resetDrawer}
          aria-expanded={menuOpen}
          position="sticky"
          bg="brand"
          width={!menuOpen ? SLIM_MENU : WIDE_MENU}
          boxSizing="border-box"
          gridTemplateRows="min-content 1fr min-content"
          gap={2}
        >
          <HeaderSection
            isOpen={menuOpen}
            setOpen={setOpen}
            setDrawer={setDrawer}
            drawerType={drawerType}
          />
          <PagesSection isOpen={menuOpen} />
          <AccountSection
            isOpen={menuOpen}
            setDrawer={setDrawer}
            drawerType={drawerType}
            dismissPopups={() => toggleShowPopup(false)}
          />
        </Grid>
        {showOnboardingPopup && !isInOnboardingPage ? (
          <PopUp trigger={<div />} left={!menuOpen ? SLIM_MENU : WIDE_MENU} />
        ) : null}
      </Flex>
    </Flex>
  );
}

const BeamerConfig = ({ first_name, last_name, user_email, user_id }) =>
  `var beamer_config = {right: '14', top: '10', product_id : '${
    import.meta.env.VITE_BEAMER_PRODUCT_ID
  }', selector: 'beamer-button', user_firstname : '${first_name}', user_lastname: '${last_name}', user_email : '${user_email}', user_id: '${getOId(
    user_id,
  )}'}`;
