import { ComponentStyleConfig } from '@chakra-ui/theme';

const exoButton: ComponentStyleConfig = {
  baseStyle: {
    fontWeight: 600,
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
        border: 'none',
        bg: danger ? 'background-danger-strong' : 'background-selected',
        color: 'white',
        _hover: {
          _disabled: {
            bg: 'background-disabled',
          },
          bg: danger
            ? 'background-danger-strong-hover'
            : 'background-selected-hover',
        },
        _focus: {
          boxShadow: 'none',
          outline: '2px solid',
          outlineColor: danger
            ? 'exo-color/background/background-danger-strong'
            : 'background-selected',
          outlineOffset: '1px',
        },
        _active: {
          bg: danger
            ? 'background-danger-strong-hover'
            : 'background-selected-hover',
        },
        _pressed: {
          bg: danger
            ? 'background-danger-strong-hover'
            : 'background-selected-hover',
        },
        _loading: {
          bg: danger
            ? 'background-danger-strong-hover'
            : 'background-selected-hover',
          color: 'white',
        },
        _disabled: {
          bg: 'background-disabled',
          color: 'white',
          opacity: 1,
          cursor: 'default',
        },
      };
    },
    'outlined-primary': props => {
      const danger = props.colorScheme === 'danger';
      return {
        bg: 'white',
        color: danger ? 'background-danger-strong' : 'background-selected',
        border: '1px solid',
        borderColor: danger
          ? 'background-danger-strong'
          : 'background-selected',
        _hover: {
          color: danger
            ? 'background-danger-strong-hover'
            : 'background-selected-hover',
          borderColor: danger
            ? 'background-danger-strong-hover'
            : 'background-selected-hover',
          bg: danger
            ? 'background-danger-weak'
            : 'background-action-secondary-hover',
          _disabled: {
            borderColor: 'background-disabled',
            color: 'background-disabled',
          },
        },
        _focus: {
          bg: danger
            ? 'background-danger-weak'
            : 'background-action-secondary-hover',
          border: '2px solid',
          borderColor: `${
            danger
              ? 'background-danger-strong-hover'
              : 'background-selected-hover'
          }`,
        },
        _active: {
          bg: danger
            ? 'background-danger-weak'
            : 'background-action-secondary-hover',
          border: '2px solid',
          borderColor: `${
            danger
              ? 'background-danger-strong-hover'
              : 'background-selected-hover'
          }`,
        },
        _pressed: {
          bg: 'transparent',
          color: danger ? 'background-danger-strong' : 'background-selected',
          borderColor: danger
            ? 'background-danger-strong'
            : 'background-selected',
          boxShadow: 'none',
        },
        _loading: {
          color: danger ? 'background-danger-strong' : 'background-selected',
          borderColor: danger
            ? 'background-danger-strong'
            : 'background-selected',
          bg: 'transparent',
        },
        _disabled: {
          color: 'background-disabled',
          borderColor: 'background-disabled',
          opacity: 1,
          cursor: 'default',
          _active: {
            color: 'background-disabled',
            borderColor: 'background-disabled',
            boxShadow: 'none',
          },
          _focus: {
            color: 'background-disabled',
            borderColor: 'background-disabled',
          },
        },
      };
    },
    default: {
      bg: 'transparent',
      color: 'background-action',
      border: '1px solid',
      borderColor: 'border',
      bordeRadius: '4px',
      _hover: {
        bg: 'background-action-hover-weak',
        border: '1px solid',
        borderColor: 'background-action-hover',
        _disabled: {
          bg: 'transparent',
          border: '1px solid',
          borderColor: 'background-disabled',
          color: 'background-disabled',
        },
      },
      _focus: {
        bg: 'background-action-hover-weak',
        border: '2px solid',
        borderColor: 'background-action-hover',
      },
      _active: {
        bg: 'background-action-hover-weak',
        border: '2px solid',
        borderColor: 'background-action-hover',
      },
      _pressed: {
        bg: 'transparent',
        color: 'background-action',
        border: '1px solid',
        borderColor: 'background-action',
      },
      _loading: {
        bg: 'transparent',
        color: 'background-action',
        border: '1px solid',
        borderColor: 'background-action',
      },
      _disabled: {
        bg: 'transparent',
        color: 'background-disabled',
        opacity: 1,
        cursor: 'default',
      },
    },
    text: props => {
      const danger = props.colorScheme === 'danger';
      return {
        bg: 'transparent',
        color: danger ? 'background-danger-strong' : 'background-action',
        border: '1px solid transparent',
        _hover: {
          bg: danger
            ? 'background-danger-weak'
            : 'background-action-hover-weak',
          color: danger
            ? 'background-danger-strong-hover'
            : 'background-action-hover',
          border: '1px solid',
          borderColor: `${danger ? 'transparent' : 'border'}`,
        },
        _focus: {
          boxShadow: 'none',
          bg: danger ? 'red.300' : 'background-action-hover-weak',
          color: danger ? 'white' : 'background-action-hover',
          border: '2px solid',
          borderColor: `${
            danger
              ? 'background-danger-strong-hover'
              : 'background-action-hover'
          }`,
        },
        _active: {
          boxShadow: 'none',
          bg: danger
            ? 'background-danger-weak'
            : 'background-action-hover-weak',
          color: danger
            ? 'background-danger-strong-hover'
            : 'background-action-hover',
          border: '2px solid',
          borderColor: `${
            danger
              ? 'background-danger-strong-hover'
              : 'background-action-hover'
          }`,
        },
        _pressed: {
          bg: 'transparent',
          color: danger ? 'background-danger-strong' : 'background-action',
          border: '1px solid',
          borderColor: `${danger ? 'none' : 'border'}`,
        },
        _loading: {
          bg: 'transparent',
          color: danger ? 'background-danger-strong' : 'background-action',
          border: '1px solid',
          borderColor: `${danger ? 'none' : 'border'}`,
        },
        _disabled: {
          bg: 'transparent',
          color: 'background-disabled',
          opacity: 1,
          cursor: 'default',
          _hover: {
            bg: 'transparent',
            color: 'background-disabled',
            opacity: 1,
            cursor: 'default',
          },
        },
      };
    },
    'text-link': props => {
      const danger = props.colorScheme === 'danger';
      return {
        textDecoration: 'underline',
        fontWeight: '400',
        bg: 'transparent',
        color: danger ? 'background-danger-strong' : 'font',
        border: '1px solid transparent',
        _hover: {
          color: danger
            ? 'background-danger-strong-hover'
            : 'background-selected',
          textDecoration: 'underline',
        },
        _focus: {
          boxShadow: 'none',
          color: danger
            ? 'background-danger-strong-hover'
            : 'background-selected',
          textDecoration: 'underline',
        },
        _active: {
          boxShadow: 'none',
          color: danger
            ? 'background-danger-strong-hover'
            : 'background-selected',
          textDecoration: 'underline',
        },
        _pressed: {
          color: danger ? 'background-danger-strong' : 'background-action',
          textDecoration: 'underline',
        },
        _loading: {
          color: danger ? 'background-danger-strong' : 'background-action',
          textDecoration: 'underline',
        },
        _disabled: {
          color: 'background-disabled',
          opacity: 1,
          cursor: 'default',
          _hover: {
            color: 'background-disabled',
            opacity: 1,
            cursor: 'default',
          },
        },
      };
    },
    link: {
      fontWeight: '400',
      bg: 'transparent',
      textDecoration: 'underline',
      color: 'font-link',
      _hover: {
        color: 'font-link-hover',
        textDecoration: 'underline',
      },
      _focus: {
        color: 'font-link-hover',
        textDecoration: 'underline',
        boxShadow: 'none',
        border: '2px solid font-link',
      },
      _active: {
        color: 'font-link-hover',
        textDecoration: 'underline',
        boxShadow: 'none',
        border: '2px solid font-link',
      },
      _pressed: {
        color: 'font-link-hover',
        textDecoration: 'underline',
      },
      _loading: {
        color: 'font-link-hover',
        textDecoration: 'underline',
      },
      _disabled: {
        bg: 'transparent',
        color: 'background-disabled',
        opacity: 1,
        cursor: 'default',
        _hover: {
          bg: 'transparent',
          color: 'background-disabled',
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
          color: 'font-secondary',
        },
        bgColor: 'transparent',
        color: checked ? 'background-selected' : 'font',
        fontWeight: '400',
        '& .chakra-button__icon': {
          color: checked ? 'background-selected' : 'background-deselected',
          fontWeight: checked ? '500' : '400',
        },
        _hover: {
          bgColor: 'background-action-hover-weak',
        },
        _active: {
          '& .tree-extra-info': {
            color: 'font',
            fontWeight: '400',
          },
          '& .chakra-button__icon': {
            color: 'background-selected',
            fontWeight: checked ? '500' : '400',
          },
          fontWeight: checked ? '500' : '400',
          bgColor: 'background-selected-weak',
          _hover: {
            '& .chakra-button__icon': {
              color: 'white',
            },
            '& .tree-extra-info': {
              color: 'white',
            },
            color: 'white',
            bgColor: 'background-selected-hover',
          },
        },
      };
    },
    accountSelector: {
      fontWeight: '400',
      bgColor: 'transparent',
      color: 'font',
      _hover: {
        bgColor: 'background-secondary!important',
      },
      _active: {
        bgColor: 'background-selected-weak',
        color: 'background-selected',
        fontWeight: '600',
        _hover: {
          bgColor: 'background-secondary',
          color: 'font',
        },
      },
    },
  },
};

export default exoButton;
