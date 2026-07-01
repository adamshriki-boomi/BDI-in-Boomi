import { mapExosphereTokens } from './exosphere';

/**
 * @deprecated
 * You can derive the Colors type from the DefaultChakraTheme:
 *
 * type Colors = DefaultChakraTheme["colors"]
 */
export type Colors = typeof colors;

const colors = exo => ({
  // Rivery Tokens
  nebula: {
    50: '#c3cae8',
    100: '#b2b9ff',
    200: '#a0a8ff',
  },
  // Chakra tokens
  transparent: 'transparent',
  current: 'currentColor',
  black: '#000000',
  white: '#FFFFFF',

  whiteAlpha: {
    300: 'rgba(255, 255, 255, 0.16)',
    400: 'rgba(255, 255, 255, 0.24)',
    900: 'rgba(255, 255, 255, 0.92)',
  },

  blackAlpha: {
    600: 'rgba(0, 0, 0, 0.48)',
  },

  gray: {
    50: '#FFFFFF',
    100: '#F9FAFB',
    150: '#EAECEF',
    200: exo
      ? mapExosphereTokens().tokens['exo-color-background-action-hover-weak']
      : '#E5E7EB',
    300: exo ? mapExosphereTokens().tokens['exo-color-border'] : '#D1D5DB',
    350: '#d4cfdb',
    400: '#CED4DA',
    500: '#ADB5BD',
    600: exo
      ? mapExosphereTokens().tokens['exo-color-border-contrast']
      : '#9A9EA3',
    700: '#6B7280',
    800: '#485159',
    900: '#000000',
  },

  red: {
    50: '#FEB8AE',
    100: '#F32002',
    200: '#E02424',
    300: '#C81D04',
    400: '#A61703',
    500: mapExosphereTokens().tokens['exo-color-background-danger-strong'],
    600: '#FFEAE7',
  },

  orange: {
    50: '#FFFAF0',
    100: '#FEEBC8',
    200: '#FBD38D',
    300: '#F6AD55',
    400: '#ED8936',
    500: '#DD6B20',
    600: '#C05621',
    700: '#9C4221',
    800: '#7B341E',
    900: '#652B19',
  },

  yellow: {
    50: '#FFF9DE',
    100: '#FFE87A',
    200: exo ? mapExosphereTokens().colors['exo-coral-40'] : '#FFDE40',
    300: '#F8CE04',
    400: '#DCB701',
    500: exo
      ? mapExosphereTokens().tokens['exo-color-background-warning-strong']
      : '#F8CE04',
  },

  green: {
    50: '#BCF0DA',
    100: '#0FCC9F',
    200: '#07B68C',
    300: '#058969',
    400: '#045B46',
  },

  teal: {
    50: '#E6FFFA',
    100: '#B2F5EA',
    200: '#81E6D9',
    300: '#4FD1C5',
    400: '#38B2AC',
    500: '#319795',
    600: '#2C7A7B',
    700: '#285E61',
    800: '#234E52',
    900: '#1D4044',
  },

  blue: {
    200: '#4167EE',
    300: '#2848B8',
    500: mapExosphereTokens().tokens['exo-color-background-selected'],
  },

  cyan: {
    50: '#EDFDFD',
    100: '#C4F1F9',
    200: '#9DECF9',
    300: '#76E4F7',
    400: '#0BC5EA',
    500: '#00B5D8',
    600: '#00A3C4',
    700: '#0987A0',
    800: '#086F83',
    900: '#065666',
  },

  purpleAlpha: {
    50: 'rgba(198, 184, 225, 0.3)',
  },

  purple: {
    10: exo
      ? mapExosphereTokens().tokens['exo-color-background-selected-weak']
      : '#EBE9F5',
    50: exo
      ? mapExosphereTokens().tokens['exo-color-background-selected-weak']
      : '#BDB7DE',
    100: exo ? mapExosphereTokens().colors['exo-navy-40'] : '#9087C8',
    200: exo ? mapExosphereTokens().colors['exo-navy-50'] : '#7A6FBD',
    300: exo ? mapExosphereTokens().colors['exo-navy-60'] : '#6254B8',
    400: exo ? mapExosphereTokens().colors['exo-brand'] : '#54489D',
    500: exo
      ? mapExosphereTokens().tokens['exo-color-background-action-hover']
      : '#4F387D',
    600: exo ? mapExosphereTokens().colors['exo-navy-80'] : '#3D327A',
    700: exo ? mapExosphereTokens().colors['exo-brand'] : '#26114D',
    800: exo
      ? mapExosphereTokens().tokens['exo-color-background-selected']
      : '#514171',
  },

  pink: {
    50: '#FFF5F7',
    100: '#FED7E2',
    200: '#FBB6CE',
    300: '#F687B3',
    400: '#ED64A6',
    500: '#D53F8C',
    600: '#B83280',
    700: '#97266D',
    800: '#702459',
    900: '#521B41',
  },
  ...mapExosphereTokens().colors,
});

export default colors;
export const semanticTokensColors = exo => ({
  ///EXO TOKENS///
  body: { default: mapExosphereTokens().tokens['exo-color-body'] },
  page: { default: mapExosphereTokens().tokens['exo-color-page'] },
  background: { default: mapExosphereTokens().tokens['exo-color-background'] },
  'background-secondary': {
    default: mapExosphereTokens().tokens['exo-color-background-secondary'],
  },
  'background-tertiary': {
    default: mapExosphereTokens().tokens['exo-color-background-tertiary'],
  },
  'background-disabled': {
    default: mapExosphereTokens().tokens['exo-color-background-disabled'],
  },
  'background-brand': {
    default: exo
      ? mapExosphereTokens().tokens['exo-color-background-brand']
      : 'purple.300',
  },
  'background-selected': {
    default: exo
      ? mapExosphereTokens().tokens['exo-color-background-selected']
      : 'purple.500',
  },
  'background-secondary-selected-weak': {
    default:
      mapExosphereTokens().tokens[
        'exo-color-background-secondary-selected-weak'
      ],
  },
  'background-tertiary-selected-weak': {
    default:
      mapExosphereTokens().tokens[
        'exo-color-background-tertiary-selected-weak'
      ],
  },
  'background-selected-hover': {
    default: mapExosphereTokens().tokens['exo-color-background-selected-hover'],
  },
  'background-deselected': {
    default: exo
      ? mapExosphereTokens().tokens['exo-color-background-deselected']
      : 'gray.700',
  },
  'background-deselected-hover': {
    default: exo
      ? mapExosphereTokens().tokens['exo-color-background-deselected-hover']
      : 'gray.800',
  },
  'background-action': {
    default: exo
      ? mapExosphereTokens().tokens['exo-color-background-action']
      : 'gray.700',
  },
  'background-action-hover': {
    default: exo
      ? mapExosphereTokens().tokens['exo-color-background-action-hover']
      : 'gray.800',
  },
  'background-action-secondary': {
    default:
      mapExosphereTokens().tokens['exo-color-background-action-secondary'],
  },
  'background-action-secondary-hover': {
    default:
      mapExosphereTokens().tokens[
        'exo-color-background-action-secondary-hover'
      ],
  },
  'background-action-tertiary-hover': {
    default:
      mapExosphereTokens().tokens['exo-color-background-action-tertiary-hover'],
  },
  'background-action-inverse': {
    default: mapExosphereTokens().tokens['exo-color-background-action-inverse'],
  },
  'background-action-inverse-hover': {
    default:
      mapExosphereTokens().tokens['exo-color-background-action-inverse-hover'],
  },
  'background-highlight': {
    default: mapExosphereTokens().tokens['exo-color-background-highlight'],
  },
  'background-highlight-inverse': {
    default:
      mapExosphereTokens().tokens['exo-color-background-highlight-inverse'],
  },
  'background-success': {
    default: mapExosphereTokens().tokens['exo-color-background-success'],
  },
  'background-success-strong': {
    default: mapExosphereTokens().tokens['exo-color-background-success-strong'],
  },
  'background-success-strong-hover': {
    default:
      mapExosphereTokens().tokens['exo-color-background-success-strong-hover'],
  },
  'background-info': {
    default: mapExosphereTokens().tokens['exo-color-background-info'],
  },
  'background-info-strong': {
    default: mapExosphereTokens().tokens['exo-color-background-info-strong'],
  },
  'background-warning': {
    default: mapExosphereTokens().tokens['exo-color-background-warning'],
  },
  'background-warning-strong': {
    default: mapExosphereTokens().tokens['exo-color-background-warning-strong'],
  },
  'background-danger-weak': {
    default: mapExosphereTokens().tokens['exo-color-background-danger-weak'],
  },
  'background-danger-strong': {
    default: exo
      ? mapExosphereTokens().tokens['exo-color-background-danger-strong']
      : 'red.100',
  },
  'background-danger-strong-hover': {
    default:
      mapExosphereTokens().tokens['exo-color-background-danger-strong-hover'],
  },
  'background-danger-extreme': {
    default: mapExosphereTokens().tokens['exo-color-background-danger-extreme'],
  },
  'background-selected-weak': {
    default: exo
      ? mapExosphereTokens().tokens['exo-color-background-selected-weak']
      : '#EFEDF7',
  },
  'background-action-hover-weak': {
    default:
      mapExosphereTokens().tokens['exo-color-background-action-hover-weak'],
  },
  'surface-ai-action': {
    default: mapExosphereTokens().tokens['exo-color-surface-ai-action'],
  },
  'surface-ai-action-hover': {
    default: mapExosphereTokens().tokens['exo-color-surface-ai-action-hover'],
  },
  font: {
    default: exo ? mapExosphereTokens().tokens['exo-color-font'] : 'gray.800',
  },
  'font-secondary': {
    default: exo
      ? mapExosphereTokens().tokens['exo-color-font-secondary']
      : 'gray.600',
  },
  'font-tertiary': {
    default: mapExosphereTokens().tokens['exo-color-font-tertiary'],
  },
  'font-link': {
    default: exo
      ? mapExosphereTokens().tokens['exo-color-font-link']
      : 'gray.800',
  },
  'font-link-hover': {
    default: exo
      ? mapExosphereTokens().tokens['exo-color-font-link-hover']
      : 'purple.500',
  },
  'font-link-secondary': {
    default: mapExosphereTokens().tokens['exo-color-font-link-secondary'],
  },
  'font-link-secondary-hover': {
    default: mapExosphereTokens().tokens['exo-color-font-link-secondary-hover'],
  },
  'font-success': {
    default: mapExosphereTokens().tokens['exo-color-font-success'],
  },
  'font-disabled': {
    default: exo
      ? mapExosphereTokens().tokens['exo-color-font-disabled']
      : 'gray.500',
  },
  'font-inverse': {
    default: mapExosphereTokens().tokens['exo-color-font-inverse'],
  },
  'font-danger': {
    default: mapExosphereTokens().tokens['exo-color-font-danger'],
  },
  'font-code': { default: mapExosphereTokens().tokens['exo-color-font-code'] },
  icon: { default: mapExosphereTokens().tokens['exo-color-icon'] },
  'icon-secondary': {
    default: mapExosphereTokens().tokens['exo-color-icon-secondary'],
  },
  'icon-tertiary': {
    default: mapExosphereTokens().tokens['exo-color-icon-tertiary'],
  },
  'icon-inverse': {
    default: mapExosphereTokens().tokens['exo-color-icon-inverse'],
  },
  'icon-disabled': {
    default: mapExosphereTokens().tokens['exo-color-icon-disabled'],
  },
  'icon-danger': {
    default: mapExosphereTokens().tokens['exo-color-icon-danger'],
  },
  border: { default: mapExosphereTokens().tokens['exo-color-border'] },
  'border-secondary': {
    default: mapExosphereTokens().tokens['exo-color-border-secondary'],
  },
  'border-tertiary': {
    default: mapExosphereTokens().tokens['exo-color-border-tertiary'],
  },
  'border-selected': {
    default: mapExosphereTokens().tokens['exo-color-border-selected'],
  },
  'border-highlight': {
    default: mapExosphereTokens().tokens['exo-color-border-highlight'],
  },
  'border-action': {
    default: mapExosphereTokens().tokens['exo-color-border-action'],
  },
  'border-action-hover': {
    default: mapExosphereTokens().tokens['exo-color-border-action-hover'],
  },
  'border-danger-weak': {
    default: mapExosphereTokens().tokens['exo-color-border-danger-weak'],
  },
  'border-danger-strong': {
    default: mapExosphereTokens().tokens['exo-color-border-danger-strong'],
  },
  'border-danger-extreme': {
    default: mapExosphereTokens().tokens['exo-color-border-danger-extreme'],
  },
  'border-inverse': {
    default: mapExosphereTokens().tokens['exo-color-border-inverse'],
  },
  'border-contrast': {
    default: exo
      ? mapExosphereTokens().tokens['exo-color-border-contrast']
      : 'gray.300',
  },
  foreground: { default: mapExosphereTokens().tokens['exo-color-foreground'] },
  'outline-weak': {
    default: mapExosphereTokens().tokens['exo-color-outline-weak'],
  },
  'outline-moderate': {
    default: mapExosphereTokens().tokens['exo-color-outline-moderate'],
  },
  'outline-strong': {
    default: mapExosphereTokens().tokens['exo-color-outline-strong'],
  },
  'outline-extreme': {
    default: mapExosphereTokens().tokens['exo-color-outline-extreme'],
  },
  'outline-inverse': {
    default: mapExosphereTokens().tokens['exo-color-outline-inverse'],
  },
  scrim: { default: mapExosphereTokens().tokens['exo-color-scrim'] },
  'shadow-weak': {
    default: mapExosphereTokens().tokens['exo-color-shadow-weak'],
  },
  'shadow-moderate': {
    default: mapExosphereTokens().tokens['exo-color-shadow-moderate'],
  },
  'shadow-strong': {
    default: mapExosphereTokens().tokens['exo-color-shadow-strong'],
  },
  'set-1-1': { default: mapExosphereTokens().tokens['exo-color-set-1-1'] },
  'set-1-2': { default: mapExosphereTokens().tokens['exo-color-set-1-2'] },
  'set-1-3': { default: mapExosphereTokens().tokens['exo-color-set-1-3'] },
  'set-1-4': { default: mapExosphereTokens().tokens['exo-color-set-1-4'] },
  'set-1-5': { default: mapExosphereTokens().tokens['exo-color-set-1-5'] },
  'set-2-1': { default: mapExosphereTokens().tokens['exo-color-set-2-1'] },
  'set-2-2': { default: mapExosphereTokens().tokens['exo-color-set-2-2'] },
  'set-2-3': { default: mapExosphereTokens().tokens['exo-color-set-2-3'] },
  'set-3-1': { default: mapExosphereTokens().tokens['exo-color-set-3-1'] },
  'set-3-2': { default: mapExosphereTokens().tokens['exo-color-set-3-2'] },
  'set-3-3': { default: mapExosphereTokens().tokens['exo-color-set-3-3'] },
  'set-3-4': { default: mapExosphereTokens().tokens['exo-color-set-3-4'] },
  'set-3-5': { default: mapExosphereTokens().tokens['exo-color-set-3-5'] },
  'set-3-6': { default: mapExosphereTokens().tokens['exo-color-set-3-6'] },
  'set-3-7': { default: mapExosphereTokens().tokens['exo-color-set-3-7'] },
  'set-3-8': { default: mapExosphereTokens().tokens['exo-color-set-3-8'] },
  'data-solid-navy': {
    default: mapExosphereTokens().tokens['exo-color-data-solid-navy'],
  },
  'data-solid-coral': {
    default: mapExosphereTokens().tokens['exo-color-data-solid-coral'],
  },
  'data-solid-purple': {
    default: mapExosphereTokens().tokens['exo-color-data-solid-purple'],
  },
  'data-solid-periwinkle': {
    default: mapExosphereTokens().tokens['exo-color-data-solid-periwinkle'],
  },
  'data-solid-green': {
    default: mapExosphereTokens().tokens['exo-color-data-solid-green'],
  },
  'data-solid-blue': {
    default: mapExosphereTokens().tokens['exo-color-data-solid-blue'],
  },
  'data-solid-gray': {
    default: mapExosphereTokens().tokens['exo-color-data-solid-gray'],
  },
  'data-solid-background-gray': {
    default:
      mapExosphereTokens().tokens['exo-color-data-solid-background-gray'],
  },
  brand: { default: 'purple.700' },
  primary: { default: 'purple.400' },
  primaryLight: { default: 'purple.300' },
  primaryLighter: { default: 'purple.200' },
  primaryBright: { default: 'purple.50' },
  purpleOpacity: { default: '#EFEDF7' },
  secondary: { default: 'gray.200' },
  success: {
    default: exo
      ? mapExosphereTokens().tokens['exo-color-background-selected']
      : 'green.200',
  },
  successLight: { default: 'green.50' },
  warning: { default: 'yellow.500' },
  link: { default: 'blue.200' },
  dropzone: { default: '#eff6ff' },
  dropzoneBorder: { default: '#eaeced' },
  tagGreen: {
    default: exo ? mapExosphereTokens().colors['exo-green-60'] : '#45CE31',
    background: mapExosphereTokens().colors['exo-green-20'],
    hover: mapExosphereTokens().colors['exo-green-30'],
  },
  tagCyan: {
    default: exo ? mapExosphereTokens().colors['exo-blue-40'] : '#1AC9E6',
    background: mapExosphereTokens().colors['exo-blue-10'],
    hover: mapExosphereTokens().colors['exo-blue-30'],
  },
  tagGeekBlue: {
    default: exo ? mapExosphereTokens().colors['exo-periwinkle-40'] : '#2B6BCB',
    background: mapExosphereTokens().colors['exo-periwinkle-10'],
    hover: mapExosphereTokens().colors['exo-periwinkle-20'],
  },
  tagPurple: {
    default: exo ? mapExosphereTokens().colors['exo-purple-30'] : '#AA87DC',
    background: mapExosphereTokens().colors['exo-purple-10'],
    hover: mapExosphereTokens().colors['exo-purple-20'],
  },
  tagMagenta: {
    default: exo ? mapExosphereTokens().colors['exo-red-40'] : '#DB4CB2',
    background: mapExosphereTokens().colors['exo-red-10'],
    hover: mapExosphereTokens().colors['exo-red-20'],
  },
  tagOrange: {
    default: exo ? mapExosphereTokens().colors['exo-yellow-40'] : '#EF7E32',
    background: mapExosphereTokens().colors['exo-yellow-20'],
  },
  cBlues: {
    default: exo ? mapExosphereTokens().colors['exo-green-40'] : '#1DE4BD',
    background: mapExosphereTokens().colors['exo-green-10'],
    hover: mapExosphereTokens().colors['exo-green-20'],
  },
  cPurples: {
    default: exo ? mapExosphereTokens().colors['exo-purple-40'] : '#AF4BCE',
    background: mapExosphereTokens().colors['exo-purple-20'],
    hover: mapExosphereTokens().colors['exo-purple-30'],
  },
  cOranges: {
    default: exo ? mapExosphereTokens().colors['exo-yellow-50'] : '#DE542C',
    background: mapExosphereTokens().colors['exo-yellow-10'],
    hover: mapExosphereTokens().colors['exo-yellow-20'],
  },
  lightCoral: {
    default: mapExosphereTokens().colors['exo-coral-10'],
    hover: mapExosphereTokens().colors['exo-coral-20'],
  },
  disabledTableRow: { default: '#edeef0' },
});
