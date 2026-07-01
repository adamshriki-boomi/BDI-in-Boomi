import { ComponentStyleConfig } from '@chakra-ui/theme';

const exoAlert: ComponentStyleConfig = {
  parts: ['description', 'container', 'icon', 'button', 'title'],
  baseStyle: {
    description: {
      color: 'exo-color-font',
    },
    title: {
      color: 'exo-color-font',
      fontWeight: '600',
      fontSize: '16px',
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
          color: 'exo-color-icon-disabled',
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
          title: {
            color: 'exo-color-background-success-strong-hover',
          },
          icon: {
            color: 'exo-color-background-success-strong',
            boxSize: 4,
          },
          container: {
            bg: 'exo-color-background-success',
            borderColor: 'exo-color-background-success-strong',
            boxShadow:
              '0px 4px 6px -1px rgba(0, 0, 0, 0.10), 0px 2px 4px -2px rgba(0, 0, 0, 0.05)',
          },
        };
      }
      if (status === 'error') {
        return {
          title: {
            color: 'exo-color-background-danger-strong-hover',
          },
          icon: {
            color: 'exo-color-background-danger-strong',
            boxSize: 4,
          },
          container: {
            bg: 'exo-color-background-danger-weak',
            borderColor: 'exo-color-background-danger-strong',
            boxShadow:
              '0px 4px 6px -1px rgba(0, 0, 0, 0.10), 0px 2px 4px -2px rgba(0, 0, 0, 0.05)',
          },
        };
      }
      if (status === 'info') {
        return {
          icon: {
            color: 'white',
            boxSize: 4,
          },
          description: {
            color: 'white',
          },
          title: {
            color: 'white',
            fontWeight: 'medium',
          },
          container: {
            color: 'white',
            bg: 'exo-color-background-brand',
            borderColor: 'border-contrast',
            boxShadow:
              '0px 4px 6px -1px rgba(0, 0, 0, 0.10), 0px 2px 4px -2px rgba(0, 0, 0, 0.05)',
          },
        };
      }
      if (status === 'warning') {
        return {
          icon: {
            color: 'exo-color-background-warning-strong',
            boxSize: 4,
          },
          container: {
            bg: 'exo-color-background-warning',
            borderColor: 'exo-color-background-warning-strong',
            boxShadow:
              '0px 4px 6px -1px rgba(0, 0, 0, 0.10), 0px 2px 4px -2px rgba(0, 0, 0, 0.05)',
          },
        };
      }
    },
    // primary: {
    //   icon: {
    //     bgColor: 'transparent',
    //     border: 'none',
    //     color: 'exo-color-background-selected',
    //     alignSelf: 'flex-start',
    //   },
    //   container: {
    //     border: '1px solid',
    //     borderRadius: '4px',
    //     bgColor: 'exo-color-background-selected-weak !important',
    //     borderColor: 'exo-color-background-selected',
    //   },
    // },
    'warning-light': {
      icon: {
        bgColor: 'transparent',
        border: 'none',
        color: 'exo-color-background-warning-strong',
        alignSelf: 'flex-start',
      },
      container: {
        border: '1px solid',
        borderRadius: '4px',
        bgColor: 'exo-color-background-warning',
        borderColor: 'exo-color-background-warning-strong',
      },
    },
    info: {
      icon: {
        bgColor: 'transparent',
        border: 'none',
        color: 'exo-color-background-info-strong',
        alignSelf: 'flex-start',
      },
      container: {
        border: '1px solid',
        borderRadius: '4px',
        bgColor: 'transparent',
        borderColor: 'border-contrast',
      },
    },
    'error-light': {
      icon: {
        bgColor: 'transparent',
        border: 'none',
        color: 'exo-color-background-danger-strong',
        alignSelf: 'flex-start',
      },
      container: {
        border: '1px solid',
        borderRadius: '4px',
        bgColor: 'exo-color-background-danger-weak',
        borderColor: 'exo-color-background-danger-strong',
      },
    },
    'success-contained': {
      icon: {
        color: 'exo-color-background-success-strong',
        alignSelf: 'flex-start',
      },
      container: {
        border: '1px solid',
        borderRadius: '4px',
        bgColor: 'exo-color-background-success',
        borderColor: 'exo-color-background-success-strong',
      },
    },
    secondary: {
      icon: {
        bgColor: 'transparent',
        border: 'none',
        color: 'exo-color-background-info-strong',
        alignSelf: 'flex-start',
      },
      container: {
        border: '1px solid',
        borderRadius: '4px',
        bgColor: 'exo-color-background-secondary',
        borderColor: 'transparent',
      },
    },
  },
};

export default exoAlert;
