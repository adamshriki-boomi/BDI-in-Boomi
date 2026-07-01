import { defineStyleConfig } from '@chakra-ui/react';

const exoFormLabel = defineStyleConfig({
  baseStyle: {
    color: 'exo-color-font',
    fontSize: 'xs',
    fontWeight: 'normal',
    marginInlineEnd: 0,
    '& .optional-label': {
      color: 'exo-color-font-secondary',
    },
    '& .chakra-form__required-indicator': {
      color: 'exo-color-background-danger-strong',
    },
    ':is([required], [aria-required="true"])': {
      display: 'flex',
      flexDirection: 'row-reverse',
      alignItems: 'center',
      justifyContent: 'left',
      gap: '1',
    },
  },
  sizes: {},
  variants: {
    semibold: {
      fontSize: '16px!important',
      fontWeight: 'medium!important',
      mb: 0,
    },
  },
});

export default exoFormLabel;
