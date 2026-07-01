import { ComponentStyleConfig } from '@chakra-ui/react';

const exoTag: ComponentStyleConfig = {
  baseStyle: {
    container: {
      display: 'inline-flex',
      height: '24px',
      padding: '4px 8px',
      alignItems: 'center',
      borderRadius: '4px',
    },
    label: {
      fontSize: '12px',
      fontWeight: 600,
      lineHeight: '20px' /* 166.667% */,
    },
  },
  variants: {
    green: {
      container: {
        bgColor: 'background-success',
      },
      label: {
        color: 'font',
      },
    },
    purple: {
      container: {
        bgColor: 'rgba(114, 57, 194, 0.10)',
      },
      label: {
        color: '#AA87DC',
      },
    },
    'dark-purple': {
      container: {
        bgColor: 'rgba(170, 135, 220, 1)',
      },
      label: {
        color: 'white',
      },
    },
    magenta: {
      container: {
        border: '1px',
        bgColor: 'white',
        borderColor: 'data-solid-coral',
      },
      label: {
        color: 'font',
      },
    },
    yellow: {
      container: {
        border: '1px',
        borderColor: 'border-secondary',
        bgColor: 'background-warning',
      },
      label: {
        color: 'font',
      },
    },
    orange: {
      container: {
        bgColor: 'rgba(239, 126, 50, 0.10)',
        borderColor: '#EF7E32',
      },
      label: {
        color: '#EF7E32',
      },
    },
    white: {
      container: {
        bgColor: 'white',
        border: '1px',
        borderColor: 'border-secondary',
      },
      label: {
        color: 'font',
      },
    },
    blue: {
      container: {
        bgColor: 'background-selected',
        border: '1px',
        borderColor: 'border-secondary',
        borderRadius: '4px',
      },
      label: {
        color: 'font-inverse',
      },
    },
    'contained-blue': {
      container: {
        bgColor: 'background-selected-weak',
        border: '1px',
        borderColor: 'border-secondary',
        borderRadius: '4px',
      },
      label: {
        color: 'font',
      },
    },
    'contained-green': {
      container: {
        bgColor: 'background-success',
        border: '1px',
        borderColor: 'border-secondary',
        borderRadius: '4px',
      },
      label: {
        color: 'font!important',
      },
    },
    'contained-gray': {
      container: {
        bgColor: 'background-tertiary',
        border: '1px',
        borderColor: 'border-secondary',
        borderRadius: '4px',
      },
      label: {
        color: 'font',
      },
    },
    'contained-pink': {
      container: {
        bgColor: 'background-danger-weak',
        border: '1px',
        borderColor: 'border-secondary',
        borderRadius: '4px',
      },
      label: {
        color: 'font',
      },
    },
  },
};

export default exoTag;
