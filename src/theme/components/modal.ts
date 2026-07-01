import { ComponentStyleConfig } from '@chakra-ui/theme';

const Modal: ComponentStyleConfig = {
  baseStyle: {
    header: {
      py: 4,
      px: 6,
      borderBottom: '1px',
      borderBottomColor: 'gray.300',
    },
    body: {
      p: 6,
    },
    footer: {
      borderTop: '1px',
      borderTopColor: 'gray.300',
      justifyContent: 'flex-end',
      p: 4,
      gap: 2,
    },
  },
  defaultProps: {},
  variants: {
    drawer: {
      dialogContainer: {
        right: 0,
        left: 'unset',
        // width: '95vw', // for it to look like a drawer
      },
      dialog: {
        w: 'full',
        h: 'full',
        maxWidth: 'calc(100vw - 96px)',
        maxHeight: '100vh',
        mt: 'auto',
        mb: '0',
        borderRadius: 0,
        position: 'fixed',
        right: 0,
      },
    },
    full: {
      dialogContainer: {
        right: 0,
        left: 'unset',
        // width: '95vw', // for it to look like a drawer
      },
      dialog: {
        w: 'full',
        h: 'full',
        maxWidth: 'full',
        maxHeight: '100vh',
        mt: 'auto',
        mb: '0',
        borderRadius: 0,
        position: 'fixed',
        right: 0,
      },
    },
    medium: {
      dialog: {
        maxHeight: '80vh',
        minWidth: '80vw',
      },
    },
    confirmation: {
      dialog: {
        pr: 8,
      },
      body: {
        p: 6,
        paddingBlockStart: 4,
        pl: 0,
        pr: 0,
        ml: '72px',
      },
      header: {
        ml: 9,
        pl: 0,
        pb: 0,
        pt: 8,
        pr: 0,
        borderBottom: 'none',
        fontSize: 16,
        fontWeight: 500,
      },
      footer: {
        borderTop: 'none',
        p: 6,
        pr: 0,
        pl: '72px',
        paddingBlockStart: 0,
      },
    },
  },
};

export default Modal;
