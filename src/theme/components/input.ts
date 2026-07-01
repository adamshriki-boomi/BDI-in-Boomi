import { ComponentStyleConfig } from '@chakra-ui/theme';

const sizeBootstrapStyle = {
  paddingInlineStart: 0,
  paddingInlineEnd: 0,
  borderRadius: 'none',
};
const Input: ComponentStyleConfig = {
  baseStyle: {
    field: {
      bgColor: 'transparent',
      color: 'font',
      borderBottom: '1px solid',
      borderBottomColor: 'gray.200',
      borderRadius: 'none',

      _placeholder: { color: 'font-secondary', fontSize: 'sm' },
      errorBorderColor: 'red.200',
      _invalid: {
        borderBottomColor: 'red.200',
      },
      _disabled: {
        borderBottomColor: 'gray.300',
        bgColor: 'gray.150',
        opacity: 1,
      },
      _focus: {
        borderBottomColor: 'purple.400',
      },
      _focusWithin: {
        borderBottomColor: 'purple.400',
      },
      _hover: {
        borderBottomColor: 'gray.200',
      },
    },
  },
  sizes: {
    xs: {
      field: { ...sizeBootstrapStyle, height: '28px' },
    },
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
    size: 'md',
  },
  variants: {
    chakra: {
      field: {
        bgColor: 'gray.100',
        color: 'font',
        border: '1px solid',
        borderColor: 'gray.200',
        borderRadius: 'base',
        paddingInlineStart: 3,
        paddingInlineEnd: 3,

        _placeholder: { color: 'font-secondary' },
        errorBorderColor: 'red.200',
        _invalid: {
          borderColor: 'red.200',
          boxShadow: '0px 0px 3px #FEB8AE',
          bg: '#FEB8AE',
        },
        _disabled: {
          opacity: 1,
          borderColor: 'gray.300',
          bgColor: 'gray.150',
          color: 'gray.700',
        },

        _focus: {
          boxShadow: '0px 0px 4px #C6B8E1',
          borderColor: 'purple.400',
        },
        _focusWithin: {
          boxShadow: '0px 0px 4px #C6B8E1',
          borderColor: 'purple.400',
        },
        _hover: {
          borderColor: 'gray.700',
        },
      },
    },
  },
};
export default Input;
