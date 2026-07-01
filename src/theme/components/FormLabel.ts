import { ComponentStyleConfig } from '@chakra-ui/theme';

const FormLabel: ComponentStyleConfig = {
  baseStyle: {
    fontSize: 'xs',
    fontWeight: 'normal!important',
    lineHeight: 'base',
    textTransform: 'capitalize',
    color: 'font',
    '& .optional-label': {
      color: 'font-secondary',
    },
    '& .chakra-form__required-indicator': {
      color: 'tagMagenta',
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
  defaultProps: {},
};
export default FormLabel;
