import { tabsAnatomy } from '@chakra-ui/anatomy';
import { createMultiStyleConfigHelpers } from '@chakra-ui/react';

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(tabsAnatomy.keys);

const baseStyle = definePartsStyle({});

const variants = {
  line: definePartsStyle({
    tab: {
      h: '48px',
      borderRadius: '4px 4px 0px 0px',
      color: 'exo-color-font',
      _focus: {
        boxShadow: 'none',
      },
      _selected: {
        bg: 'exo-color-background-selected-weak',
        fontWeight: '600',
        borderColor: 'exo-color-background-selected',
      },
      _hover: {
        bg: 'exo-color-background-action-hover-weak',
        color: 'exo-color-font',
      },
    },
    tabpanel: {
      pt: '12px',
      p: 0,
    },
    tabpanels: {
      p: 0,
    },
  }),

  wizard: definePartsStyle({
    root: {
      display: 'grid',
      alignItems: 'center',
      overflow: 'hidden',
      gridTemplateRows: 'auto 1fr',
      gridGap: '4',
    },
    tablist: {
      borderBottom: 0,
      justifyContent: 'center',
      '& .tab-line': {
        opacity: 0.5,
        borderColor: 'exo-color-border',
      },
      '& .tab-line-selected': {
        opacity: 1,
        borderColor: 'exo-color-background-selected!important',
      },
    },
    tab: {
      '& .tab-index': {
        borderColor: 'exo-color-border',
      },
      _selected: {
        color: 'exo-color-background-selected',
        fontWeight: '400!important',
        '& .tab-index': {
          borderColor: 'exo-color-border-selected',
        },
      },
      _disabled: {
        color: 'exo-color-font-secondary',
        opacity: 1,
      },
      borderBottom: 0,
      py: 3,
    },
    tabpanels: {
      height: 'full',
      overflow: 'hidden',
    },
    tabpanel: {
      height: 'full',
      pt: 0,
    },
  }),
};

const sizes = {
  sm: definePartsStyle({}),
};

const exoTabs = defineMultiStyleConfig({
  baseStyle,
  variants,
  sizes,
  defaultProps: {
    size: 'sm',
    variant: 'line',
  },
});

export default exoTabs;
