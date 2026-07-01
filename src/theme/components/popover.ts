import { ComponentStyleConfig } from '@chakra-ui/theme';

const Popover: ComponentStyleConfig = {
  baseStyle: {
    content: {
      width: '300px',
      role: 'list',
      position: 'relative',
      zIndex: 'popover',
      boxShadow: 'lg',
      _focus: {
        boxShadow: 'lg',
      },
      _active: {
        boxShadow: 'lg',
      },
    },
    body: {
      p: 0,
    },
  },
  parts: [],
  defaultProps: {},
  variants: {
    tooltip: {
      content: {
        maxWidth: '300px',
        w: 'auto',
        boxShadow: 'md',
        '--popper-arrow-bg': 'var(--chakra-colors-gray-200)',
        borderRadius: 'md',
        border: 'none',
      },
      header: {
        bgColor: 'gray.200',
        color: 'gray.800',
        borderTopRadius: 'md',
        px: 3,
        py: 2,
      },
      body: {
        bgColor: 'gray.200',
        color: 'gray.700',
        fontSize: 'sm',
        fontWeight: '400',
        lineHeight: '150%',
        p: '6px 10px 6px',
        whiteSpace: 'pre-wrap',
        borderRadius: 'md',
        borderWidth: 0,
      },
      arrow: {},
    },
  },
};

export default Popover;
