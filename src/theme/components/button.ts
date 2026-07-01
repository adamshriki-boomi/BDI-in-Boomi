import { ComponentStyleConfig } from '@chakra-ui/theme';

const Button: ComponentStyleConfig = {
  baseStyle: {
    fontWeight: 500,
    borderRadius: 4,
    _focus: {
      boxShadow: 'none',
    },
  },
  sizes: {
    xxs: {
      w: '15px',
      height: '28px',
    },
    small: {
      fontSize: '12px',
      px: '14px',
      py: '4px',
      height: '28px',
    },
    base: {
      fontSize: '14px',
      px: '18px',
      py: '7.5px',
      height: '36px',
    },
    xl: {
      fontSize: '16px',
      px: '16px',
      py: '10px',
      height: '44px',
    },
  },
  variants: {
    primary: props => {
      const danger = props.colorScheme === 'danger';
      return {
        bg: danger ? 'red.100' : 'purple.400',
        color: 'white',
        _hover: {
          _disabled: {
            bg: 'gray.200',
          },
          bg: danger ? 'red.300' : 'purple.500',
        },
        _focus: {
          boxShadow: 'none',
        },
        _active: {
          bg: danger ? 'red.400' : 'purple.600',
          boxShadow: danger ? '0 0 0 3px #FEB8AE' : '0 0 0 3px #C6B8E1',
        },
        _pressed: {
          bg: danger ? 'red.100' : 'purple.300',
        },
        _loading: {
          bg: danger ? 'red.400' : 'purple.400!important',
          color: danger ? 'red.50' : 'purple.50!important',
        },
        _disabled: {
          bg: 'gray.200',
          color: 'gray.500',
          opacity: 1,
          cursor: 'default',
          _active: {
            bg: 'gray.200',
            color: 'gray.500',
            boxShadow: 'none',
          },
          _focus: {
            bg: 'gray.200',
            color: 'gray.500',
            boxShadow: 'none',
          },
        },
      };
    },
    green: props => {
      const danger = props.colorScheme === 'danger';
      return {
        bg: danger ? 'background-danger-strong' : 'green.200',
        color: 'white',
        _hover: {
          bg: danger ? 'red.300' : 'green.400',
        },
        _focus: {
          boxShadow: 'none',
        },
        _active: {
          bg: danger ? 'red.400' : 'green.600',
          boxShadow: danger ? '0 0 0 3px #FEB8AE' : '0 0 0 3px #C6B8E1',
        },
        _pressed: {
          bg: danger ? 'red.200' : 'green.300',
        },
        _loading: {
          bg: danger ? 'red.400' : 'green.200',
          color: danger ? 'red.50' : 'green.50',
        },
        _disabled: {
          bg: 'gray.200',
          color: 'gray.500',
          opacity: 1,
          cursor: 'default',
          _hover: {
            bg: 'gray.200',
            color: 'gray.500',
            opacity: 1,
            cursor: 'default',
          },
        },
      };
    },
    'outlined-primary': props => {
      const danger = props.colorScheme === 'danger';
      return {
        bg: 'transparent',
        color: danger ? 'background-danger-strong' : 'purple.400',
        border: '1px solid',
        borderColor: danger ? 'background-danger-strong' : 'purple.400',
        _hover: {
          color: danger ? 'red.300' : 'purple.600',
          borderColor: danger ? 'red.300' : 'purple.600',
          bg: danger ? 'transparent' : 'purple.50',
          _disabled: {
            borderColor: 'gray.500',
            color: 'gray.500',
          },
        },
        _focus: {
          boxShadow: danger ? '0 0 0 3px #FEB8AE' : '0 0 0 3px #C6B8E1',
          bg: danger ? 'transparent' : 'purple.50',
        },
        _active: {
          bg: danger ? 'transparent' : 'purple.500',
          color: danger ? 'red.400' : 'purple.50',
          borderColor: danger ? 'red.400' : 'purple.50',
          boxShadow: 'none',
        },
        _pressed: {
          bg: danger ? 'transparent' : 'purple.500',
          color: danger ? 'red.400' : 'purple.50',
          borderColor: danger ? 'red.400' : 'purple.50',
          boxShadow: 'none',
        },
        _loading: {
          color: danger ? 'red.50' : 'purple.100',
          borderColor: danger ? 'red.50' : 'purple.100',
          bg: danger ? 'transparent' : 'purple.50',
        },
        _disabled: {
          color: 'gray.500',
          borderColor: 'gray.500',
          opacity: 1,
          cursor: 'default',
          _active: {
            color: 'gray.500',
            borderColor: 'gray.500',
            boxShadow: 'none',
          },
          _focus: {
            color: 'gray.500',
            borderColor: 'gray.500',
          },
        },
      };
    },
    'outlined-green': props => {
      const danger = props.colorScheme === 'danger';
      return {
        bg: 'transparent',
        color: danger ? 'background-danger-strong' : 'green.200',
        border: '1px solid',
        borderColor: danger ? 'background-danger-strong' : 'green.200',
        _hover: {
          color: danger ? 'red.300' : 'green.400',
          borderColor: danger ? 'red.300' : 'green.400',
        },
        _focus: {
          boxShadow: 'none',
        },
        _active: {
          color: danger ? 'red.400' : 'green.600',
          borderColor: danger ? 'red.400' : 'green.600',
          boxShadow: danger ? '0 0 0 3px #FEB8AE' : '0 0 0 3px #C6B8E1',
        },
        _pressed: {
          color: danger ? 'red.200' : 'green.300',
          borderColor: danger ? 'red.200' : 'green.300',
        },
        _loading: {
          color: danger ? 'red.50' : 'green.50',
          borderColor: danger ? 'red.50' : 'green.50',
        },
        _disabled: {
          color: 'gray.500',
          borderColor: 'gray.500',
          opacity: 1,
          cursor: 'default',
          _hover: {
            color: 'gray.500',
            borderColor: 'gray.500',
            opacity: 1,
            cursor: 'default',
          },
        },
      };
    },
    default: {
      bg: 'gray.200',
      color: 'font',
      _hover: {
        bg: 'gray.400',
        _disabled: {
          bg: 'gray.200',
        },
      },
      _focus: {
        boxShadow: 'none',
      },
      _active: {
        bg: 'gray.700',
        boxShadow: '0 0 0 3px #CED4DA',
      },
      _pressed: {
        bg: 'gray.300',
      },
      _loading: {
        bg: 'gray.400',
        color: 'gray.700',
      },
      _disabled: {
        bg: 'gray.200',
        color: 'gray.400',
        opacity: 1,
        cursor: 'default',
        _hover: {
          bg: 'gray.200',
          color: 'gray.400',
          opacity: 1,
          cursor: 'default',
        },
      },
    },
    'outlined-default': props => {
      const danger = props.colorScheme === 'danger';
      return {
        bg: 'transparent',
        border: '1px solid',
        borderColor: danger ? 'red.300' : 'gray.300',
        color: danger ? 'red.300' : 'font',
        _hover: {
          bg: danger ? 'red.50' : 'gray.200',
          borderColor: danger ? 'red.300' : 'gray.700',
        },
        _focus: {
          boxShadow: 'none',
        },
        _active: {
          bg: 'gray.400',
          borderColor: danger ? 'red.300' : 'gray.700',
          boxShadow: '0 0 0 3px #CED4DA',
        },
        _pressed: {
          bg: 'gray.300',
          borderColor: danger ? 'red.300' : 'gray.700',
        },
        _loading: {
          bg: 'gray.200',
          borderColor: danger ? 'red.300' : 'gray.400',
        },
        _disabled: {
          color: 'gray.400',
          borderColor: 'gray.400',
          opacity: 1,
          cursor: 'default',
          _hover: {
            color: 'gray.400',
            borderColor: 'gray.400',
            opacity: 1,
            cursor: 'default',
          },
        },
      };
    },
    text: props => {
      const danger = props.colorScheme === 'danger';
      return {
        bg: 'transparent',
        color: danger ? 'background-danger-strong' : 'font',
        _hover: {
          bg: danger ? 'red.300' : 'gray.400',
          color: danger ? 'white' : 'unset',
        },
        _focus: {
          boxShadow: danger ? 'red.400' : 'none',
        },
        _active: {
          bg: danger ? 'red.200' : 'gray.300',
          boxShadow: '0 0 0 3px #CED4DA',
        },
        _pressed: {
          bg: danger ? 'red.200' : 'gray.300',
        },
        _loading: {
          bg: danger ? 'red.400' : 'gray.200',
          color: danger ? 'red.500' : 'gray.600',
        },
        _disabled: {
          bg: danger ? 'gray.200' : 'transparent',
          color: danger ? 'gray.500' : 'gray.400',
          opacity: 1,
          cursor: 'default',
          _hover: {
            bg: 'transparent',
            color: 'gray.400',
            opacity: 1,
            cursor: 'default',
          },
        },
      };
    },
    'text-link': props => {
      const danger = props.colorScheme === 'danger';
      return {
        bg: 'transparent',
        p: 0,
        color: danger ? 'background-danger-strong' : 'font',
        _hover: {
          color: danger ? 'background-danger-strong' : 'unset',
          fontWeight: 'medium',
          textDecoration: 'underline',
        },
        _focus: {
          textDecoration: 'underline',
        },
        _active: {
          textDecoration: 'underline',
        },
        _pressed: {
          textDecoration: 'underline',
        },
        _loading: {
          color: danger ? 'red.500' : 'gray.600',
        },
        _disabled: {
          color: danger ? 'gray.500' : 'gray.400',
          opacity: 1,
          cursor: 'default',
          _hover: {
            bg: 'transparent',
            color: 'gray.400',
            opacity: 1,
            cursor: 'default',
          },
        },
      };
    },
    link: {
      bg: 'transparent',
      color: 'purple.400',
      _hover: {
        color: 'blue.200',
        textDecoration: 'underline',
      },
      _focus: {
        color: 'blue.200',
        textDecoration: 'underline',
        boxShadow: 'none',
      },
      _active: {
        color: 'blue.300',
        textDecoration: 'underline',
      },
      _loading: {
        color: 'blue.300',
        textDecoration: 'underline',
      },
      _disabled: {
        bg: 'transparent',
        color: 'gray.400',
        opacity: 1,
        cursor: 'default',
        _hover: {
          bg: 'transparent',
          color: 'gray.400',
          opacity: 1,
          cursor: 'default',
        },
      },
      sx: {
        span: {
          marginInlineEnd: 0,
        },
      },
    },
    transparent: {
      bgColor: 'transparent',
      _hover: {
        bgColor: 'transparent',
      },
    },
    tree: props => {
      const checked = props.colorScheme === 'checked';
      return {
        '& .tree-extra-info': {
          color: 'textSecondary',
        },
        bgColor: 'transparent',
        color: checked ? 'purple.500' : 'gray.800',
        fontWeight: '400',
        '& .chakra-button__icon': {
          color: checked ? 'purple.500' : 'gray.700',
          fontWeight: checked ? '500' : '400',
        },
        _hover: {
          bgColor: 'gray.200',
        },
        _active: {
          '& .tree-extra-info': {
            color: 'font',
            fontWeight: '400',
          },
          '& .chakra-button__icon': {
            color: 'primary',
            fontWeight: checked ? '500' : '400',
          },
          fontWeight: checked ? '500' : '400',
          bgColor: 'purple.50',
          _hover: {
            '& .chakra-button__icon': {
              color: 'white',
            },
            '& .tree-extra-info': {
              color: 'white',
            },
            color: 'white',
            bgColor: 'purple.400',
          },
        },
      };
    },
    accountSelector: {
      bgColor: 'transparent',
      color: 'gray.800',
      _hover: {
        bgColor: 'gray.200',
      },
      _active: {
        bgColor: 'purple.200',
        color: 'gray.50',
        _hover: {
          bgColor: 'gray.200',
          color: 'gray.800',
        },
      },
    },
    // environmentSelector: {
    //   bgColor: 'transparent',
    //   color: 'gray.800',
    //   fontWeight: '400',
    //   _hover: {
    //     bgColor: 'gray.200',
    //   },
    //   _active: {
    //     fontWeight: '500',
    //     bgColor: 'purple.200',
    //     color: 'gray.50',
    //     _hover: {
    //       bgColor: 'gray.200',
    //       color: 'gray.800',
    //     },
    //   },
    // },
  },
};

export default Button;
