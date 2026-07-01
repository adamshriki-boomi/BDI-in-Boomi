import blur from './blur';
import borders from './borders';
import breakpoints from './breakpoints';
import colors from './colors';
import radii from './radius';
import shadows from './shadows';
import sizes from './sizes';
import { spacing } from './spacing';
import transition from './transition';
import typography from './typography';
import zIndices from './z-index';

// When adding new components, component variations, sizes, colors and other theme foundations
// https://chakra-ui.com/docs/styled-system/theming/advanced#theme-typings
// Run ==> npm run gen:theme-typings
const foundations = exo => ({
  breakpoints,
  zIndices,
  radii,
  blur,
  colors: colors(exo),
  ...typography,
  sizes,
  shadows,
  space: spacing,
  borders,
  transition,
});

export default foundations;
