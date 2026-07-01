import { ComponentStyleConfig } from '@chakra-ui/theme';

const Checkbox: ComponentStyleConfig = {
  baseStyle: {
    label: {
      textAlign: 'left !important',
      color: 'font-secondary',
      fontWeight: 400,
      _disabled: {
        color: 'gray.500',
      },
    },
    control: {
      height: '16px',
      width: '16px',
      borderRadius: '2px',
      border: '1px solid #D1D5DB',
      '& > svg': {
        color: 'transparent',
      },
      _focus: {
        boxShadow: 'none',
      },
      _indeterminate: {
        bg: 'var(--chakra-colors-purple-400)!important',
        border: 'none',
      },
      _checked: {
        bg: 'primary',
        border: 'none',
        _hover: {
          bg: 'primary',
        },
        _focus: {
          boxShadow: '0 0 0 2px #C6B8E1',
        },
        '& > svg': {
          color: 'white',
        },
        _disabled: {
          bg: 'gray.200',
          borderRadius: '2px',
          border: '1px solid var(--chakra-colors-gray-300)',
          '& > svg': {
            color: 'gray.600',
          },
        },
      },
      _disabled: {
        bg: 'gray.200',
        borderRadius: '2px',
        border: '1px solid var(--chakra-colors-gray-300)',
      },
    },
  },
};

export default Checkbox;
