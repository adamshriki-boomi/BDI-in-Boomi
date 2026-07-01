import { mode } from '@chakra-ui/theme-tools';

const exoTheme = import.meta.env.VITE_EXO_THEME === 'true';
const global = props => ({
  body: {
    fontFamily: exoTheme ? null : '"Roboto", sans-serif',
    fontSize: 'sm',
    color: mode('font', 'whiteAlpha.900')(props),
    bg: mode('#ffffff', 'font')(props),
    transitionProperty: 'background-color',
    transitionDuration: 'normal',
    lineHeight: 'base',
  },
  '*::placeholder': {
    color: mode('gray.400', 'whiteAlpha.400')(props),
  },
  '*, *::before, &::after': {
    wordWrap: 'break-word',
  },
  '#root': {
    display: 'grid',
    gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
  },
  'input[type="search"]::-webkit-search-cancel-button': {
    appearance: 'none',
    cursor: 'pointer',
    display: 'inline-block',
    width: '8px',
    height: '8px',
    background: `linear-gradient(45deg, rgba(0,0,0,0) 0%,rgba(0,0,0,0) 43%,#000 45%,#000 55%,rgba(0,0,0,0) 57%,rgba(0,0,0,0) 100%),
    linear-gradient(135deg, transparent 0%,transparent 43%,#000 45%,#000 55%,transparent 57%,transparent 100%)`,
  },
  '.chakra-form__helper-text': {
    color: 'exo-color-font-secondary!important',
    fontSize: '12px!important',
    mt: '0px!important',
    lineHeight: '20px',
  },
  '.brand-title': {
    fontFamily: exoTheme ? 'var(--exo-font-brand)' : null,
  },
});

export default global;
