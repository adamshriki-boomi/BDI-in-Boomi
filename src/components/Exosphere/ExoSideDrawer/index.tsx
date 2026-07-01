import {
  ButtonFlavor,
  ButtonType,
  ExButton,
} from '@boomi/exosphere/dist/react/button';
import { ExSideDrawer } from '@boomi/exosphere/dist/react/side-drawer';
import { useCallback, ReactNode, ComponentProps } from 'react';

export interface ExoSideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode | false;
  saveLabel?: string;
  cancelLabel?: string;
  onSave?: () => void;
  saveDisabled?: boolean;
  isLoading?: boolean;
  isResizeable?: boolean;
  isExpandable?: boolean;
  /**
   * Customizes the width of the side drawer. Accepts percentage values (25, 50, 75)
   * or 'default' for responsive behavior. When set to a percentage, the drawer will
   * use that percentage of the viewport width.
   * @default "25"
   */
  width?: string;
}

/**
 * A reusable side drawer component that wraps Exosphere's ExSideDrawer
 * with a clean React API and proper slot handling.
 *
 * @example
 * // Basic usage with custom footer
 * <ExoSideDrawer
 *   isOpen={isOpen}
 *   onClose={handleClose}
 *   title="Edit Item"
 *   footer={<button onClick={handleSave}>Save</button>}
 * >
 *   <form>...</form>
 * </ExoSideDrawer>
 *
 * @example
 * // With default footer buttons (no footer prop)
 * <ExoSideDrawer
 *   isOpen={isOpen}
 *   onClose={handleClose}
 *   title="Add Item"
 *   onSave={handleSave}
 *   saveLabel="Create"
 * >
 *   <form>...</form>
 * </ExoSideDrawer>
 *
 * @example
 * // Hide footer completely
 * <ExoSideDrawer
 *   isOpen={isOpen}
 *   onClose={handleClose}
 *   title="View Item"
 *   footer={false}
 * >
 *   <div>Content</div>
 * </ExoSideDrawer>
 */
export function ExoSideDrawer(props: ExoSideDrawerProps): JSX.Element {
  const {
    isOpen,
    onClose,
    title,
    children,
    footer,
    saveLabel = 'Save',
    cancelLabel = 'Cancel',
    onSave,
    saveDisabled = false,
    isLoading = false,
    isResizeable = false,
    isExpandable = true,
    // width = '25',
  } = props;
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  // If footer === false, don't show footer at all
  // If footer is a component, show custom footer
  // Otherwise (footer is undefined), show default footer
  const hasFooter = footer !== false;
  const showDefaultFooter = footer === undefined;

  // Type assertion needed because the React wrapper doesn't expose the width prop
  // even though the underlying SideDrawer web component supports it
  const drawerProps = {
    open: isOpen,
    onClose: handleClose,
    panelTitle: title,
    footer: hasFooter,
    resize: isResizeable,
    expandable: isExpandable,
    // width,
  } as ComponentProps<typeof ExSideDrawer>;

  return (
    <ExSideDrawer {...drawerProps} defaultMaxResize defaultMinResize>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          boxSizing: 'border-box',
          paddingLeft: '2px',
          paddingRight: '2px',
        }}
      >
        {children}
      </div>

      {hasFooter && (
        <div
          slot="footer"
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            paddingRight: '24px',
          }}
        >
          {showDefaultFooter ? (
            <>
              <ExButton
                type={ButtonType.TERTIARY}
                flavor={ButtonFlavor.BRANDED}
                onClick={handleClose}
                disabled={isLoading}
              >
                {cancelLabel}
              </ExButton>
              <ExButton
                type={ButtonType.PRIMARY}
                flavor={ButtonFlavor.BASE}
                onClick={onSave}
                disabled={saveDisabled || isLoading}
              >
                {isLoading ? 'Saving...' : saveLabel}
              </ExButton>
            </>
          ) : (
            footer
          )}
        </div>
      )}
    </ExSideDrawer>
  );
}

export default ExoSideDrawer;
