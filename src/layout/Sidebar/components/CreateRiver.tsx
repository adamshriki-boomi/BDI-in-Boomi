import { Center, useBoolean } from '@chakra-ui/react';
import { Box, Grid, Icon, PlusIcon, SlideFade, Text } from 'components';
import { RiverTypeBoxes } from 'containers/Onboarding/components/Steps/Step1';
import { useLayoutEffect } from 'react';
import { useAccount, useCore } from 'store/core';
import { SidebarTags } from 'utils/tracking.tags';
import { DrawerType } from '../common';
import { FadingText, SideBarElement, sideBarItemStyle } from './SubComponents';

export function CreateRiver({ isOpen, setDrawer, drawerType }) {
  const { isAccountBlocked, isAccountActive } = useCore();
  const { isViewerRole } = useAccount();
  const isCreateOpened = drawerType === DrawerType.CREATE_RIVER;

  return (
    <SideBarElement
      _hover={{ bg: 'transparent' }}
      aria-label="Create"
      data-pendo-id={SidebarTags.CREATE_BUTTON}
      bg={isCreateOpened ? 'primaryLight' : 'inherit'}
      minHeight="45px"
      maxHeight="45px"
      isOpen={isOpen}
      onClick={() => {
        isCreateOpened ? setDrawer(null) : setDrawer(DrawerType.CREATE_RIVER);
      }}
      pointerEvents={
        isAccountBlocked || !isAccountActive || isViewerRole ? 'none' : 'all'
      }
      as={Box}
      data-group
      icon={
        <Icon
          as={PlusIcon}
          boxSize="18px"
          bg="background-secondary"
          borderRadius={50}
        />
      }
      description="Create"
      text={
        <FadingText
          isOpen={isOpen}
          text="Create"
          color="background-secondary"
          _groupHover={{ color: 'purple.50' }}
        />
      }
      aria-expanded={isCreateOpened}
      className="create-river"
      {...sideBarItemStyle}
    />
  );
}

export const useFadeInDelay = (delay = 250) => {
  const [show, setShow] = useBoolean();
  useLayoutEffect(() => {
    if (!show) {
      setTimeout(() => {
        setShow.on();
      }, delay);
    }
  }, [setShow, delay, show]);
  return show;
};

export function CreateRiverDrawerContent({ setDrawer }) {
  const show = useFadeInDelay();

  return (
    <SlideFade in={show} style={{ height: '100%' }} offsetX="-50px" offsetY={0}>
      <Grid
        templateRows="auto 1fr min-content minmax(20%, 167px)"
        flexDir="column"
        h="full"
        pt="60px"
        alignItems="center"
        justifyItems="center"
        aria-label="Create data flow drawer"
        overflow="auto"
        boxSizing="content-box"
      >
        <Center flexDir="column" px={10} gap={8}>
          <Grid textAlign="center">
            <Text m="auto!important" textStyle="M5" mr={12}>
              Create Data Pipelines & Workflows
            </Text>
            <Text textStyle="R7" color="font-secondary">
              Each type of Data Flow helps you accomplish different tasks.
            </Text>
          </Grid>
        </Center>
        <Grid mt={6} px={9} alignSelf="flex-start">
          <RiverTypeBoxes
            createDrawer
            onDismissDrawer={() => setDrawer(null)}
            homePage={false}
          />
        </Grid>
      </Grid>
    </SlideFade>
  );
}
