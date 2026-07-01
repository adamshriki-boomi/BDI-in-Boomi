import { Grid, GridProps } from 'components';
import { RiverRightBar } from './RiverRightBar';

interface SidebarShellProps extends GridProps {
  showSidebar?: boolean;
  /**
   * (default: null) gridTemplateAreas that is applied when showSidebar is false
   */
  fallbackAreas?: string;
  disabled?: boolean;
  formApi?: any;
  sideBarTopPadding?: string;
}

export const SidebarShell = ({
  children,
  showSidebar = true,
  fallbackAreas = null,
  formApi = null,
  gridTemplateAreas,
  sideBarTopPadding = '62px',
  ...rest
}: SidebarShellProps) => (
  <Grid
    gridTemplateAreas={
      showSidebar
        ? gridTemplateAreas ||
          `
          'content ${SidebarShell.sidebarGridArea}'
          'footer ${SidebarShell.sidebarGridArea}'
          `
        : fallbackAreas
    }
    gridTemplateColumns={showSidebar ? SidebarShell.Layout : null}
    overflow="hidden"
    height="full"
    {...rest}
  >
    {children}
    {showSidebar ? (
      <RiverRightBar
        gridArea="sidebar"
        formApi={formApi}
        sideBarTopPadding={sideBarTopPadding}
      />
    ) : null}
  </Grid>
);
SidebarShell.Layout = '1fr 52px';
SidebarShell.sidebarGridArea = 'sidebar';
