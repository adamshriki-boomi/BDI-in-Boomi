import { ComponentStyleConfig } from '@chakra-ui/theme';

const Switch: ComponentStyleConfig = {
  baseStyle: {
    label: {
      mb: '0px !important',
    },
    track: {
      bg: 'gray.200',
      width: '1.7rem !important',
      _focus: {
        boxShadow: 'none',
      },
      _checked: {
        bg: 'primary',
        border: 'none',
        _hover: {
          bg: 'primary',
        },
        _focus: {
          boxShadow: '0 0 0 3px #C6B8E1',
        },
      },
      _disabled: {
        bg: 'gray.200',
      },
    },
    thumb: {
      _checked: {
        border: 'none',
        transform: 'translateX(15px)',
      },
    },
  },
  variants: {
    checked: {
      track: {
        bg: 'primary',
        _checked: {
          _focus: {
            boxShadow: 'none',
          },
        },
      },
    },
    whiteBorder: {
      track: {
        _checked: {
          border: '1px solid !important',
          borderColor: 'white !important',
        },
      },
    },
    activate: {
      thumb: {
        mt: '0.5px',
        w: '16px !important',
        h: '16px !important',
        _checked: {
          border: 'none',
          transform: 'translateX(18px)',
        },
      },
      track: {
        height: '18px !important',
        width: '34px !important',
        _checked: {
          bg: 'green.200',
          _hover: {
            bg: 'green.200',
          },
          _focus: {
            boxShadow: 'none',
          },
        },
      },
    },
  },
};

export default Switch;
