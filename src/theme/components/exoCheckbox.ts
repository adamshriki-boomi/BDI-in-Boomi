import { ComponentStyleConfig } from '@chakra-ui/theme';

const exoCheckbox: ComponentStyleConfig = {
  baseStyle: {
    label: {
      textAlign: 'left !important',
      color: 'exo-color-font',
      fontWeight: 400,
      _disabled: {
        color: 'exo-color-font-secondary',
      },
    },
    control: {
      height: '16px',
      width: '16px',
      borderRadius: '2px',
      border: '1px solid',
      borderColor: 'exo-color-background-deselected',
      '& > svg': {
        color: 'transparent',
      },
      _focus: {
        boxShadow: 'none',
      },
      _indeterminate: {
        bg: 'exo-color-background-selected !important',
        borderColor: 'exo-color-background-selected !important',
        border: 'none !important',
        '& > svg': {
          color: 'white !important',
        },
        _hover: {
          bg: 'exo-color-background-selected !important',
        },
        _disabled: {
          bg: 'exo-color-background-disabled !important',
          borderColor: 'exo-color-background-disabled !important',
        },
      },
      _checked: {
        bg: 'exo-color-background-selected',
        border: 'none',
        _hover: {
          bg: 'exo-color-background-selected',
        },
        _focus: {
          boxShadow: '0 0 0 2px var(--exo-color-background-selected-weak)',
        },
        '& > svg': {
          color: 'white',
        },
        _disabled: {
          bg: 'exo-color-background-disabled',
          borderRadius: '2px',
          border: '1px solid',
          borderColor: 'exo-color-border-secondary!important',
          '& > svg': {
            color: 'white',
          },
        },
      },
      _disabled: {
        bg: 'transparent',
        borderRadius: '2px',
        border: '1px solid',
        borderColor: 'exo-color-border-secondary!important',
      },
    },
  },
};

export default exoCheckbox;
