export function selectStyles(homePage, createDrawer) {
  return {
    item: {
      border: '1px',
      borderColor: createDrawer ? 'border' : 'border-secondary',
      py: createDrawer ? 6 : 4,
      px: createDrawer ? 2 : 4,
      w: createDrawer ? 'full' : homePage ? '245px' : '220px',
      height: createDrawer ? '125px' : '245px',
      templateColumns: createDrawer ? '2fr 5fr' : 'unset',
      bg: 'white',
      borderRadius: 4,
      role: createDrawer ? 'link' : 'undefined',
      shadow: createDrawer ? 'md' : 'unset',
      _hover: {
        bg: createDrawer ? 'gray.200' : 'gray.50',
        shadow: createDrawer ? 'lg' : 'unset',
        borderColor: createDrawer ? 'border-selected' : 'border-secondary',
      },
    },
    icon: {
      width: createDrawer ? '160px' : '175px',
      height: '75px',
    },
  };
}
