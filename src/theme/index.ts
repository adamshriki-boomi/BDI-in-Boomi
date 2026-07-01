import { extendTheme, type ThemeConfig } from '@chakra-ui/react';
import { semanticTokensColors } from 'theme/foundations/colors';
import components from './components';
import foundations from './foundations';
import { mapExosphereTokens } from './foundations/exosphere';
import global from './global';
import layerStyles from './layerStyles';
import textStyles from './textStyles';
import exoComponents from './components/exoComponents';

export * as animations from './animations';

const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false,
};
export const theme = exo => {
  return extendTheme({
    global,
    ...foundations(exo),
    styles: {
      global,
    },
    components: exo ? exoComponents : components,
    config,
    layerStyles,
    textStyles,
    semanticTokens: {
      colors: {
        ...semanticTokensColors(exo),
        ...mapExosphereTokens().tokens,
      },
    },
  });
};
