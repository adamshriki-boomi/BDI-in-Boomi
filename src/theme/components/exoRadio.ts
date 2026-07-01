import { ComponentStyleConfig } from '@chakra-ui/theme';

const exoRadio: ComponentStyleConfig = {
  baseStyle: {
    fontSize: '14px',
    control: {
      bg: 'white',
      border: '1.5px solid',
      borderColor: 'exo-color-background-deselected',
      _disabled: {
        borderColor: 'exo-color-background-disabled',
      },
      _checked: {
        bg: 'white !important',
        borderColor: 'exo-color-background-selected',
        color: 'exo-color-background-selected',
        _focus: {
          backgroundColor: 'exo-color-background-selected-weak!important',
          color: 'exo-color-background-selected-hover',
          borderColor: 'exo-color-background-selected-hover',
        },
        _disabled: {
          borderColor: 'exo-color-background-disabled',
          color: 'exo-color-background-disabled',
        },
      },
    },
    label: {
      w: 'full',
      color: 'exo-color-font',
      '& .radio-description': {
        color: 'exo-color-font',
      },
      _disabled: {
        color: 'exo-color-font-disabled',
        '& .radio-description': {
          color: 'exo-color-font-disabled',
        },
      },
      _checked: {
        '& .radio-description': {
          color: 'exo-color-font',
        },
        color: 'exo-color-font',
        fontSize: '14px!important',
        fontWeight: '600',
        _disabled: {
          color: 'exo-color-font-disabled',
          '& .radio-description': {
            color: 'exo-color-font-disabled',
          },
        },
      },
    },
  },
};

export default exoRadio;
