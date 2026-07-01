let currentlyOpenMenu: HTMLElement | null = null;

export interface MenuOption {
  label: string;
  icon?: string;
  onClick: () => void;
  pendoId?: string;
}

interface CreateTableActionsMenuRendererOptions {
  /** Array of menu options to display */
  options: MenuOption[];
  /** Width of the menu in pixels (default: 160) */
  menuWidth?: number;
  /** data-pendo-id for the trigger (kebab) button */
  triggerPendoId?: string;
}

/**
 * Creates a generic action menu renderer function that can be used with ag-grid cell renderers.
 * Uses direct DOM manipulation with Exosphere web components for compatibility.
 *
 * @example
 * ```tsx
 * const renderer = createTableActionsMenuRenderer({
 *   options: [
 *     { label: 'Edit', icon: 'Edit', onClick: () => handleEdit() },
 *     { label: 'Delete', icon: 'Delete', onClick: () => handleDelete() },
 *   ],
 *   menuWidth: 160,
 * });
 *
 * // Use in ag-grid column definition
 * { cellRenderer: renderer }
 * ```
 */
export function createTableActionsMenuRenderer({
  options,
  menuWidth = 160,
  triggerPendoId,
}: CreateTableActionsMenuRendererOptions) {
  return (params: any) => {
    const container = document.createElement('div');
    Object.assign(container.style, {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      paddingTop: 'var(--exo-spacing-x-small)',
      position: 'relative',
    });

    // Create trigger button
    const triggerBtn = document.createElement('ex-icon-button') as any;
    triggerBtn.setAttribute('icon', 'More options');
    triggerBtn.setAttribute('type', 'tertiary');
    triggerBtn.setAttribute('size', 'default');
    triggerBtn.setAttribute('flavor', 'branded');
    triggerBtn.setAttribute('label', 'Actions');
    if (triggerPendoId) {
      triggerBtn.setAttribute('data-pendo-id', triggerPendoId);
    }

    // Create menu container (using fixed positioning to prevent clipping)
    const menuContainer = document.createElement('div');
    menuContainer.className = 'menu';
    Object.assign(menuContainer.style, {
      position: 'fixed',
      zIndex: '9999',
      display: 'none',
      borderRadius: '4px',
      backgroundColor: 'var(--exo-color-background, #fff)',
      width: `${menuWidth}px`,
      minWidth: `${menuWidth}px`,
      maxWidth: `${menuWidth}px`,
      boxSizing: 'border-box',
    });

    // Function to position menu relative to button
    const positionMenu = () => {
      const buttonRect = triggerBtn.getBoundingClientRect();
      menuContainer.style.top = `${buttonRect.bottom}px`;
      menuContainer.style.left = `${buttonRect.right - menuWidth}px`; // Align right edge with button
    };

    // Create menu with explicit width using customWidth attribute
    const menu = document.createElement('ex-menu') as any;
    menu.setAttribute('customWidth', String(menuWidth));

    // Create menu item group
    const menuItemGroup = document.createElement('ex-menu-item-group') as any;

    // Create menu items from options
    const menuItems: HTMLElement[] = [];
    options.forEach(option => {
      const menuItem = document.createElement('ex-menu-item') as any;
      menuItem.className = 'menu-item';
      Object.assign(menuItem.style, {
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'flex-start',
        flex: '1 0 0',
        minHeight: 'var(---exo-spacing-x-large, 32px)',
      });
      if (option.icon) {
        menuItem.setAttribute('icon', option.icon);
      }
      if (option.pendoId) {
        menuItem.setAttribute('data-pendo-id', option.pendoId);
      }
      menuItem.textContent = option.label;
      menuItemGroup.appendChild(menuItem);
      menuItems.push(menuItem);
    });

    menu.appendChild(menuItemGroup);
    menuContainer.appendChild(menu);
    container.appendChild(triggerBtn);
    container.appendChild(menuContainer);

    // Clear selected state from all menu items
    const clearSelectedState = () => {
      menuItems.forEach(menuItem => {
        // Remove selected attribute if it exists
        if (menuItem.hasAttribute('selected')) {
          menuItem.removeAttribute('selected');
        }
        // Remove aria-selected if it exists
        if (menuItem.hasAttribute('aria-selected')) {
          menuItem.removeAttribute('aria-selected');
        }
        // Remove any selected class
        menuItem.classList.remove('selected');
        // Reset any internal selected state via property
        if ('selected' in menuItem) {
          (menuItem as any).selected = false;
        }
      });
    };

    // Toggle menu on button click
    triggerBtn.addEventListener('click', (e: Event) => {
      e.stopPropagation();

      // Check if this menu is currently open by checking the global tracker
      const isCurrentlyOpen = currentlyOpenMenu === menuContainer;

      // Close any previously open menu
      if (currentlyOpenMenu && currentlyOpenMenu !== menuContainer) {
        currentlyOpenMenu.style.display = 'none';
        currentlyOpenMenu = null;
      }

      // Toggle based on actual current state
      if (isCurrentlyOpen) {
        // Close this menu
        closeMenu();
      } else {
        // Clear any selected state before opening
        clearSelectedState();
        // Open this menu
        positionMenu();
        menuContainer.style.display = 'block';
        currentlyOpenMenu = menuContainer;
      }
    });

    // Close menu when clicking outside
    const closeMenu = () => {
      clearSelectedState();
      menuContainer.style.display = 'none';
      if (currentlyOpenMenu === menuContainer) {
        currentlyOpenMenu = null;
      }
    };

    // Use a single document-level click handler to close all menus
    const handleDocumentClick = (e: Event) => {
      // Check if the click is outside the container
      if (!container.contains(e.target as Node)) {
        closeMenu();
      }
    };

    document.addEventListener('click', handleDocumentClick);

    // Reposition menu on scroll or resize when it's open
    const handleReposition = () => {
      if (currentlyOpenMenu === menuContainer) {
        positionMenu();
      }
    };
    window.addEventListener('scroll', handleReposition, true);
    window.addEventListener('resize', handleReposition);

    // Handle menu item clicks
    menuItems.forEach((menuItem, index) => {
      const option = options[index];
      if (option) {
        menuItem.addEventListener('click', (e: Event) => {
          e.stopPropagation();
          e.preventDefault();
          // Clear selected state immediately
          clearSelectedState();
          closeMenu();
          option.onClick();
        });
      }
    });

    return container;
  };
}

export default createTableActionsMenuRenderer;
