import { ComponentStyleConfig } from '@chakra-ui/theme';

const Alert: ComponentStyleConfig = {
  parts: ['description', 'container', 'icon', 'button', 'title'],
  baseStyle: {
    description: {
      color: 'gray.800',
    },
    container: {
      border: '1px solid',
      borderRadius: '4px',
      WebkitAlignItems: 'start',
      py: '8px !important',
      '> button': {
        mt: 1,
        p: 0,
        '> svg': {
          color: 'gray.600',
        },
      },
    },
    icon: {
      mt: 1,
    },
  },
  variants: {
    solid: props => {
      const status = props.status;
      if (status === 'success') {
        return {
          icon: {
            color: 'green.200',
            boxSize: 4,
          },
          title: {
            color: 'green.200',
            fontWeight: 'medium',
          },
          container: {
            bg: 'white !important',
            borderColor: 'green.100',
          },
        };
      }
      if (status === 'error') {
        return {
          icon: {
            color: 'red.200',
            boxSize: 4,
          },
          title: {
            color: 'red.200',
            fontWeight: 'medium',
          },
          description: {
            color: 'red.100',
          },
          container: {
            bg: 'white !important',
            borderColor: 'background-danger-strong',
          },
        };
      }
      if (status === 'info') {
        return {
          icon: {
            color: 'gray.800',
            boxSize: 4,
          },
          title: {
            color: 'gray.800',
            fontWeight: 'medium',
          },
          container: {
            bg: 'white !important',
            borderColor: 'border-contrast',
          },
        };
      }
      if (status === 'warning') {
        return {
          icon: {
            color: 'yellow.400',
            boxSize: 4,
          },
          title: {
            color: 'yellow.400',
            fontWeight: 'medium',
          },
          description: {
            color: 'gray.700',
          },
          container: {
            bg: 'white !important',
            borderColor: 'yellow.300',
          },
        };
      }
    },
    primary: {
      icon: {
        bgColor: 'transparent',
        border: 'none',
        color: 'purple.600',
        alignSelf: 'flex-start',
      },
      container: {
        bgColor: 'rgb(198,184, 225, 0.31)',
        borderColor: 'rgb(198,184, 225)',
      },
      description: {
        color: 'purple.600',
        textStyle: 'R7',
      },
    },
    'warning-light': {
      icon: {
        bgColor: 'transparent',
        border: 'none',
        color: 'gray.800',
        alignSelf: 'flex-start',
      },
      container: {
        bgColor: 'rgba(255, 236, 143, 0.30)',
        borderColor: 'yellow.400',
      },
      description: {
        color: 'gray.800',
        textStyle: 'R7',
      },
    },
    info: {
      icon: {
        bgColor: 'transparent',
        border: 'none',
        color: 'gray.800',
        alignSelf: 'flex-start',
      },
      container: {
        bgColor: 'background-secondary',
        borderColor: 'gray.300',
      },
      description: {
        color: 'gray.800',
        textStyle: 'R7',
      },
    },
    'error-light': {
      icon: {
        color: 'red.300',
        alignSelf: 'flex-start',
      },
      container: {
        bgColor: 'rgba(254, 184, 174, 0.30)',
        borderColor: 'red.200',
      },
      description: {
        color: 'red.300',
        textStyle: 'R7',
      },
      title: {
        color: 'red.300',
      },
    },
    'success-contained': {
      icon: {
        color: 'green.400',
        alignSelf: 'flex-start',
      },
      container: {
        bgColor: 'green.50',
        borderColor: 'green.50',
      },
      title: { color: 'green.400' },
      description: {
        color: 'green.400',
        textStyle: 'R7',
      },
    },
  },
};

export default Alert;
