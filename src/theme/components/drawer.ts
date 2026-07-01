import { ComponentStyleConfig } from '@chakra-ui/theme';

const Drawer: ComponentStyleConfig = {
  baseStyle: {
    header: {
      px: 0,
      mx: 6,
    },
  },
  defaultProps: {},
  sizes: {
    small: {
      dialog: {
        maxW: '300px',
      },
    },
    default: {
      dialog: {
        maxW: '520px',
      },
    },
    medium: {
      dialog: {
        maxW: '738px',
      },
    },
    large: {
      dialog: {
        maxW: 'full',
      },
    },
  },
  variants: {
    semifull: {
      dialog: {
        maxWidth: '85vw',
        w: 'full',
        h: 'full',
      },
    },
  },
};

export default Drawer;
