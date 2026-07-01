import { ComponentStyleConfig } from '@chakra-ui/theme';

const Radio: ComponentStyleConfig = {
  baseStyle: {
    fontSize: '14px',

    control: {
      bg: 'background-secondary',
      borderColor: 'var(--chakra-colors-gray-300) !important',
      _checked: {
        bg: 'white !important',
        borderColor: 'var(--chakra-colors-purple-400) !important',
        color: 'var(--chakra-colors-purple-400) !important',
        _focus: {
          boxShadow: '0 0 0 3px var(--chakra-colors-purple-50)',
        },
      },
    },
    label: {
      w: 'full',
      color: '#9A9EA3',
      _checked: {
        color: '#485159',
        fontSize: '14px!important',
        fontWeight: 'medium',
      },
    },
  },
};

export default Radio;
