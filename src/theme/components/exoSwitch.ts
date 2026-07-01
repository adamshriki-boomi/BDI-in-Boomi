import { switchAnatomy } from '@chakra-ui/anatomy';
import { createMultiStyleConfigHelpers } from '@chakra-ui/react';

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(switchAnatomy.keys);

const baseStyle = definePartsStyle({
  label: {
    mb: '0px !important',
    ml: 'auto',
  },
  track: {
    bg: 'white',
    border: '1px solid',
    borderColor: 'exo-color-border',
    width: '1.7rem',
    _focus: {
      boxShadow: 'none',
    },
    _hover: {
      borderColor: 'exo-color-background-action-hover',
    },
    _checked: {
      bg: 'exo-color-background-selected',
      borderColor: 'transparent',
      _disabled: {
        bg: 'exo-color-background-disabled',
        borderColor: 'transparent',
      },
      _hover: {
        bg: 'exo-color-background-selected-hover',
      },
    },
    _disabled: {
      bg: 'white',
      border: '1px solid',
      borderColor: 'exo-color-border',
    },
  },
  thumb: {
    bg: 'exo-color-background-deselected',
    _checked: {
      bg: 'white',
      border: 'none',
      transform: 'translateX(15px)',
    },
  },
});

const variants = {
  whiteBorder: {
    track: {
      _checked: {
        border: '1px solid !important',
        borderColor: 'white !important',
      },
    },
  },
  checked: {
    track: {
      bg: 'exo-color-background-selected',
      _checked: {
        _focus: {
          boxShadow: 'none',
        },
      },
    },
    thumb: {
      bg: 'white',
      _checked: {
        bg: 'white',
        border: 'none',
        transform: 'translateX(15px)',
      },
    },
  },
  activate: definePartsStyle({
    thumb: {
      mt: '0.5px',
      w: '16px',
      h: '16px',
      _checked: {
        border: 'none',
        transform: 'translateX(16px)',
      },
    },
    track: {
      height: '18px',
      width: '32px',
      _checked: {
        bg: 'exo-color-background-success-strong',
        _hover: {
          bg: 'exo-color-background-success-strong-hover',
        },
        _focus: {
          boxShadow: 'none',
        },
      },
    },
  }),
};

const exoSwitch = defineMultiStyleConfig({
  baseStyle,
  variants,
});

export default exoSwitch;
