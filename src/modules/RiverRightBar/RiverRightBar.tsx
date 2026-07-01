import { TopBarContext } from 'app/AppTopBarContext';
import { Box, Flex, Grid } from 'components';
import { useIsNewLegacyRiverSaved } from 'components/OldApp/OldAppIframe';
import { getQueryParams } from 'hooks/router';
import { useCallback, useContext, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useRiverActions } from 'store/river';
import {
  removeParams,
  upsertSearchParam,
  upsertSearchParams,
} from 'utils/searchParams';
import { Actions, DrawerType } from './Actions';
import DrawerComponent from './Drawers';
import {
  useIsInNewRiver,
  useIsInsideRiver,
  useShouldShowSidebar,
} from './useShouldShowSidebar';

function RiverRightBarElement({ formApi = null, sideBarTopPadding, ...props }) {
  const { newRiverCrossId, clearId } = useIsNewLegacyRiverSaved();
  const isInNewRiverPage = useIsInNewRiver();
  const riverId = useIsInsideRiver();
  const isLegacyView = !window.location.pathname.includes('rivers');
  const { river_drawer } = getQueryParams([RiverRightBar.DrawerParam]);
  const resetDrawer = useDismissDrawer(
    !isInNewRiverPage &&
      [DrawerType.ACTIVITIES, DrawerType.VERSIONS].includes(river_drawer),
  );

  const isDrawerOpen = Boolean(river_drawer);
  const { fetchRiver, clear } = useRiverActions();
  useEffect(() => {
    if (isLegacyView || newRiverCrossId) {
      if (riverId) {
        fetchRiver(riverId);
      } else {
        clear();
      }
    }
  }, [clear, fetchRiver, isLegacyView, newRiverCrossId, riverId]);

  useEffect(() => {
    if (riverId === newRiverCrossId) {
      clearId();
    }
  }, [clearId, newRiverCrossId, riverId]);

  return (
    <Flex
      h="full"
      role="menu"
      aria-label="right bar"
      boxShadow="md"
      zIndex="2"
      borderLeft="2px solid"
      borderLeftColor="gray.300"
      {...props}
    >
      <Flex overflowY="auto" overflowX="hidden" w="full">
        <Drawer
          onClose={resetDrawer}
          offsetLeft={'-51px'}
          isDisplayed={isDrawerOpen}
          drawerType={river_drawer}
          createRiverForm={formApi}
        />
        <Grid onClick={resetDrawer} bg="white" gap={2} w="full">
          <Actions
            newRiverCrossId={newRiverCrossId}
            createRiverForm={formApi}
            sideBarTopPadding={sideBarTopPadding}
          />
        </Grid>
      </Flex>
    </Flex>
  );
}

const DrawerGridStyle = {
  [DrawerType.ACTIVITIES]: {
    w: 'calc(100vw - 250px)',
    overflowY: 'hidden',
    overflowX: 'hidden',
    right: '10px',
  },
  [DrawerType.VERSIONS]: {
    w: '350px',
    overflowY: 'auto',
    overflowX: 'hidden',
    right: '-52px',
  },
  [DrawerType.VARIABLES]: {
    w: '950px',
    overflowY: 'auto',
    overflowX: 'hidden',
    right: '0px',
  },
  [DrawerType.DATAFRAMES]: {
    w: '750px',
    overflowY: 'auto',
    overflowX: 'hidden',
    right: '0px',
  },
};

const Drawer = ({
  onClose,
  offsetLeft,
  isDisplayed,
  drawerType,
  createRiverForm,
  ...props
}) => {
  const HEIGHT_WITH_TOP_BANNER = 'calc(100vh - 45px)';
  const { show: isVisible } = useContext(TopBarContext);
  return (
    <Box
      boxSize={!isDisplayed ? 0 : 'full'}
      height={isVisible ? HEIGHT_WITH_TOP_BANNER : 'full'}
      bg="blackAlpha.600"
      position="absolute"
      right="0"
      transform={`translateX(${isDisplayed ? offsetLeft : '-200%'})`}
    >
      <Grid
        height="full"
        position="fixed"
        zIndex="100000"
        width="full"
        visibility={'visible'}
        overflow="hidden"
        {...props}
      >
        <Grid
          aria-expanded={isDisplayed}
          position="absolute"
          zIndex="modal"
          h="100vh"
          w={DrawerGridStyle[drawerType]?.w}
          bg="white!important"
          boxShadow="md"
          right="0"
          overflowY={DrawerGridStyle[drawerType]?.overflowY}
          overflowX={DrawerGridStyle[drawerType]?.overflowX}
        >
          <Box
            height={isVisible ? HEIGHT_WITH_TOP_BANNER : '100vh'}
            overflow="hidden"
            onClick={e => e.stopPropagation()}
          >
            <DrawerComponent createRiverForm={createRiverForm} />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export const RiverRightBar = ({ sideBarTopPadding = '62px', ...props }) => {
  const { isInRiverView, isInNewRiverPage } = useShouldShowSidebar({});
  return isInRiverView || isInNewRiverPage ? (
    <RiverRightBarElement sideBarTopPadding={sideBarTopPadding} {...props} />
  ) : null;
};
RiverRightBar.DrawerParam = 'river_drawer';

export function useDismissDrawer(all = true) {
  const { replace } = useHistory();
  const onDeleteAllSearchParams = useCallback(
    () =>
      replace({
        search: all
          ? ''
          : removeParams(window.location.search, [RiverRightBar.DrawerParam]),
      }),
    [all, replace],
  );
  return onDeleteAllSearchParams;
}

export function useSetDrawer() {
  const { replace } = useHistory();

  const setDrawer = useCallback(
    type => replace({ search: upsertSearchParam('river_drawer', type) }),
    [replace],
  );
  return setDrawer;
}

export function useSetDrawerWithParams() {
  const { replace } = useHistory();

  const setDrawer = useCallback(
    (type, ...rest) =>
      replace({
        search: upsertSearchParams({ river_drawer: type, ...rest[0] }),
      }),

    [replace],
  );
  return setDrawer;
}
