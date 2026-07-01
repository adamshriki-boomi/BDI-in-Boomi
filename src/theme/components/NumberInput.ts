import { ComponentStyleConfig } from '@chakra-ui/theme';

const sizeBootstrapStyle = {
  paddingInlineStart: 0,
  paddingInlineEnd: 0,
  borderRadius: 'none',
};
const NumberInput: ComponentStyleConfig = {
  baseStyle: {
    field: {
      bgColor: 'transparent',
      color: 'exo-color-font',
      borderBottom: '1px solid',
      borderBottomColor: 'exo-color-border-secondary',
      borderRadius: 'none',

      _placeholder: {
        color: 'exo-color-background-deselected',
        fontSize: 'sm',
      },
      errorBorderColor: 'exo-color-background-danger-strong',
      _invalid: {
        borderBottomColor: 'exo-color-background-danger-strong',
      },
      _disabled: {
        borderBottomColor: 'exo-color-background-disabled',
        opacity: 1,
      },
      _focus: {
        borderBottomColor: 'exo-color-background-selected',
      },
      _focusWithin: {
        borderBottomColor: 'exo-color-background-selected',
      },
      _hover: {
        borderBottomColor: 'exo-color-background-deselected',
      },
    },
  },
  sizes: {
    sm: {
      field: { ...sizeBootstrapStyle, height: 8 },
    },
    md: {
      field: { ...sizeBootstrapStyle, height: 9 },
    },
    lg: {
      field: { ...sizeBootstrapStyle, height: 10 },
    },
  },
  defaultProps: {
    size: 'xs',
  },
  variants: {
    chakra: {
      field: {
        bgColor: 'white',
        color: 'font',
        border: '1px solid',
        borderColor: 'exo-color-border-secondary',
        borderRadius: 'base',

        _placeholder: { color: 'exo-color-background-deselected' },
        errorBorderColor: 'exo-color-background-danger-strong',
        _invalid: {
          borderColor: 'exo-color-background-danger-strong',
          bg: 'exo-color-background-danger-weak',
        },
        _disabled: {
          opacity: 1,
          borderColor: 'exo-color-background-disabled',
          color: 'exo-color-background-disabled',
        },
        _focus: {
          borderColor: 'exo-color-background-selected',
          boxShadow: 'none',
        },
        _focusWithin: {
          borderColor: 'exo-color-background-selected',
        },
      },
    },
  },
};
export default NumberInput;
