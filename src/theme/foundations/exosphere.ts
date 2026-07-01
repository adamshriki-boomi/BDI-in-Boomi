import theme from '@boomi/exosphere/dist/css-theme-variables.json';
const variables = theme['lightTheme'];

export const mapExosphereTokens = () => {
  return {
    tokens: {
      'exo-color-body': variables['--exo-color-body'],
      'exo-color-page': variables['--exo-color-page'],
      'exo-color-background': variables['--exo-color-background'],
      'exo-color-background-secondary':
        variables['--exo-color-background-secondary'],
      'exo-color-background-tertiary':
        variables['--exo-color-background-tertiary'],
      'exo-color-background-disabled':
        variables['--exo-color-background-disabled'],
      'exo-color-background-brand': variables['--exo-color-background-brand'],
      'exo-color-background-selected':
        variables['--exo-color-background-selected'],
      'exo-color-background-secondary-selected-weak':
        variables['--exo-color-background-secondary-selected-weak'],
      'exo-color-background-tertiary-selected-weak':
        variables['--exo-color-background-tertiary-selected-weak'],
      'exo-color-background-selected-hover':
        variables['--exo-color-background-selected-hover'],
      'exo-color-background-deselected':
        variables['--exo-color-background-deselected'],
      'exo-color-background-deselected-hover':
        variables['--exo-color-background-deselected-hover'],
      'exo-color-background-action': variables['--exo-color-background-action'],
      'exo-color-background-action-hover':
        variables['--exo-color-background-action-hover'],
      'exo-color-background-action-secondary':
        variables['--exo-color-background-action-secondary'],
      'exo-color-background-action-secondary-hover':
        variables['--exo-color-background-action-secondary-hover'],
      'exo-color-background-action-tertiary-hover':
        variables['--exo-color-background-action-tertiary-hover'],
      'exo-color-background-action-inverse':
        variables['--exo-color-background-action-inverse'],
      'exo-color-background-action-inverse-hover':
        variables['--exo-color-background-action-inverse-hover'],
      'exo-color-background-highlight':
        variables['--exo-color-background-highlight'],
      'exo-color-background-highlight-inverse':
        variables['--exo-color-background-highlight-inverse'],
      'exo-color-background-success':
        variables['--exo-color-background-success'],
      'exo-color-background-success-strong':
        variables['--exo-color-background-success-strong'],
      'exo-color-background-success-strong-hover':
        variables['--exo-color-background-success-strong-hover'],
      'exo-color-background-info': variables['--exo-color-background-info'],
      'exo-color-background-info-strong':
        variables['--exo-color-background-info-strong'],
      'exo-color-background-warning':
        variables['--exo-color-background-warning'],
      'exo-color-background-warning-strong':
        variables['--exo-color-background-warning-strong'],
      'exo-color-background-danger-weak':
        variables['--exo-color-background-danger-weak'],
      'exo-color-background-danger-strong':
        variables['--exo-color-background-danger-strong'],
      'exo-color-background-danger-strong-hover':
        variables['--exo-color-background-danger-strong-hover'],
      'exo-color-background-danger-extreme':
        variables['--exo-color-background-danger-extreme'],
      'exo-color-background-selected-weak':
        variables['--exo-color-background-selected-weak'],
      'exo-color-background-action-hover-weak':
        variables['--exo-color-background-action-hover-weak'],
      'exo-color-surface-ai-action': variables['--exo-color-surface-ai-action'],
      'exo-color-surface-ai-action-hover':
        variables['--exo-color-surface-ai-action-hover'],
      'exo-color-font': variables['--exo-color-font'],
      'exo-color-font-secondary': variables['--exo-color-font-secondary'],
      'exo-color-font-tertiary': variables['--exo-color-font-tertiary'],
      'exo-color-font-link': variables['--exo-color-font-link'],
      'exo-color-font-link-hover': variables['--exo-color-font-link-hover'],
      'exo-color-font-link-secondary':
        variables['--exo-color-font-link-secondary'],
      'exo-color-font-link-secondary-hover':
        variables['--exo-color-font-link-secondary-hover'],
      'exo-color-font-success': variables['--exo-color-font-success'],
      'exo-color-font-disabled': variables['--exo-color-font-disabled'],
      'exo-color-font-inverse': variables['--exo-color-font-inverse'],
      'exo-color-font-danger': variables['--exo-color-font-danger'],
      'exo-color-font-code': variables['--exo-color-font-code'],
      'exo-color-icon': variables['--exo-color-icon'],
      'exo-color-icon-secondary': variables['--exo-color-icon-secondary'],
      'exo-color-icon-tertiary': variables['--exo-color-icon-tertiary'],
      'exo-color-icon-inverse': variables['--exo-color-icon-inverse'],
      'exo-color-icon-disabled': variables['--exo-color-icon-disabled'],
      'exo-color-icon-danger': variables['--exo-color-icon-danger'],
      'exo-color-border': variables['--exo-color-border'],
      'exo-color-border-secondary': variables['--exo-color-border-secondary'],
      'exo-color-border-tertiary': variables['--exo-color-border-tertiary'],
      'exo-color-border-selected': variables['--exo-color-border-selected'],
      'exo-color-border-highlight': variables['--exo-color-border-highlight'],
      'exo-color-border-action': variables['--exo-color-border-action'],
      'exo-color-border-action-hover':
        variables['--exo-color-border-action-hover'],
      'exo-color-border-danger-weak':
        variables['--exo-color-border-danger-weak'],
      'exo-color-border-danger-strong':
        variables['--exo-color-border-danger-strong'],
      'exo-color-border-danger-extreme':
        variables['--exo-color-border-danger-extreme'],
      'exo-color-border-inverse': variables['--exo-color-border-inverse'],
      'exo-color-border-contrast': variables['--exo-color-border-contrast'],
      'exo-color-foreground': variables['--exo-color-foreground'],
      'exo-color-outline-weak': variables['--exo-color-outline-weak'],
      'exo-color-outline-moderate': variables['--exo-color-outline-moderate'],
      'exo-color-outline-strong': variables['--exo-color-outline-strong'],
      'exo-color-outline-extreme': variables['--exo-color-outline-extreme'],
      'exo-color-outline-inverse': variables['--exo-color-outline-inverse'],
      'exo-color-scrim': variables['--exo-color-scrim'],
      'exo-color-shadow-weak': variables['--exo-color-shadow-weak'],
      'exo-color-shadow-moderate': variables['--exo-color-shadow-moderate'],
      'exo-color-shadow-strong': variables['--exo-color-shadow-strong'],
      'exo-color-set-1-1': variables['--exo-color-set-1-1'],
      'exo-color-set-1-2': variables['--exo-color-set-1-2'],
      'exo-color-set-1-3': variables['--exo-color-set-1-3'],
      'exo-color-set-1-4': variables['--exo-color-set-1-4'],
      'exo-color-set-1-5': variables['--exo-color-set-1-5'],
      'exo-color-set-2-1': variables['--exo-color-set-2-1'],
      'exo-color-set-2-2': variables['--exo-color-set-2-2'],
      'exo-color-set-2-3': variables['--exo-color-set-2-3'],
      'exo-color-set-3-1': variables['--exo-color-set-3-1'],
      'exo-color-set-3-2': variables['--exo-color-set-3-2'],
      'exo-color-set-3-3': variables['--exo-color-set-3-3'],
      'exo-color-set-3-4': variables['--exo-color-set-3-4'],
      'exo-color-set-3-5': variables['--exo-color-set-3-5'],
      'exo-color-set-3-6': variables['--exo-color-set-3-6'],
      'exo-color-set-3-7': variables['--exo-color-set-3-7'],
      'exo-color-set-3-8': variables['--exo-color-set-3-8'],
      'exo-color-data-solid-navy': variables['--exo-color-data-solid-navy'],
      'exo-color-data-solid-coral': variables['--exo-color-data-solid-coral'],
      'exo-color-data-solid-purple': variables['--exo-color-data-solid-purple'],
      'exo-color-data-solid-periwinkle':
        variables['--exo-color-data-solid-periwinkle'],
      'exo-color-data-solid-green': variables['--exo-color-data-solid-green'],
      'exo-color-data-solid-blue': variables['--exo-color-data-solid-blue'],
      'exo-color-data-solid-gray': variables['--exo-color-data-solid-gray'],
      'exo-color-data-solid-background-gray':
        variables['--exo-color-data-solid-background-gray'],
    },
    colors: {
      // Palette colors
      'exo-white': 'var(--exo-palette-white)',
      'exo-brand': 'var(--exo-palette-brand)',
      'exo-black': 'var(--exo-palette-black)',
      'exo-navy-10': 'var(--exo-palette-navy-10)',
      'exo-navy-20': 'var(--exo-palette-navy-20)',
      'exo-navy-30': 'var(--exo-palette-navy-30)',
      'exo-navy-40': 'var(--exo-palette-navy-40)',
      'exo-navy-50': 'var(--exo-palette-navy-50)',
      'exo-navy-60': 'var(--exo-palette-navy-60)',
      'exo-navy-70': 'var(--exo-palette-navy-70)',
      'exo-navy-80': 'var(--exo-palette-navy-80)',
      'exo-red-10': 'var(--exo-palette-red-10)',
      'exo-red-20': 'var(--exo-palette-red-20)',
      'exo-red-30': 'var(--exo-palette-red-30)',
      'exo-red-40': 'var(--exo-palette-red-40)',
      'exo-red-50': 'var(--exo-palette-red-50)',
      'exo-red-60': 'var(--exo-palette-red-60)',
      'exo-red-70': 'var(--exo-palette-red-70)',
      'exo-red-80': 'var(--exo-palette-red-80)',
      'exo-red-90': 'var(--exo-palette-red-90)',
      'exo-coral-10': 'var(--exo-palette-coral-10)',
      'exo-coral-20': 'var(--exo-palette-coral-20)',
      'exo-coral-30': 'var(--exo-palette-coral-30)',
      'exo-coral-40': 'var(--exo-palette-coral-40)',
      'exo-coral-50': 'var(--exo-palette-coral-50)',
      'exo-coral-60': 'var(--exo-palette-coral-60)',
      'exo-coral-70': 'var(--exo-palette-coral-70)',
      'exo-coral-80': 'var(--exo-palette-coral-80)',
      'exo-coral-90': 'var(--exo-palette-coral-90)',
      'exo-yellow-10': 'var(--exo-palette-yellow-10)',
      'exo-yellow-20': 'var(--exo-palette-yellow-20)',
      'exo-yellow-30': 'var(--exo-palette-yellow-30)',
      'exo-yellow-40': 'var(--exo-palette-yellow-40)',
      'exo-yellow-50': 'var(--exo-palette-yellow-50)',
      'exo-yellow-60': 'var(--exo-palette-yellow-60)',
      'exo-yellow-70': 'var(--exo-palette-yellow-70)',
      'exo-yellow-80': 'var(--exo-palette-yellow-80)',
      'exo-green-10': 'var(--exo-palette-green-10)',
      'exo-green-20': 'var(--exo-palette-green-20)',
      'exo-green-30': 'var(--exo-palette-green-30)',
      'exo-green-40': 'var(--exo-palette-green-40)',
      'exo-green-50': 'var(--exo-palette-green-50)',
      'exo-green-60': 'var(--exo-palette-green-60)',
      'exo-green-70': 'var(--exo-palette-green-70)',
      'exo-green-80': 'var(--exo-palette-green-80)',
      'exo-green-90': 'var(--exo-palette-green-90)',
      'exo-blue-10': 'var(--exo-palette-blue-10)',
      'exo-blue-20': 'var(--exo-palette-blue-20)',
      'exo-blue-30': 'var(--exo-palette-blue-30)',
      'exo-blue-40': 'var(--exo-palette-blue-40)',
      'exo-blue-50': 'var(--exo-palette-blue-50)',
      'exo-blue-60': 'var(--exo-palette-blue-60)',
      'exo-blue-70': 'var(--exo-palette-blue-70)',
      'exo-blue-80': 'var(--exo-palette-blue-80)',
      'exo-purple-10': 'var(--exo-palette-purple-10)',
      'exo-purple-20': 'var(--exo-palette-purple-20)',
      'exo-purple-30': 'var(--exo-palette-purple-30)',
      'exo-purple-40': 'var(--exo-palette-purple-40)',
      'exo-purple-50': 'var(--exo-palette-purple-50)',
      'exo-purple-60': 'var(--exo-palette-purple-60)',
      'exo-purple-70': 'var(--exo-palette-purple-70)',
      'exo-periwinkle-10': 'var(--exo-palette-periwinkle-10)',
      'exo-periwinkle-20': 'var(--exo-palette-periwinkle-20)',
      'exo-periwinkle-30': 'var(--exo-palette-periwinkle-30)',
      'exo-periwinkle-40': 'var(--exo-palette-periwinkle-40)',
      'exo-periwinkle-50': 'var(--exo-palette-periwinkle-50)',
      'exo-periwinkle-60': 'var(--exo-palette-periwinkle-60)',
      'exo-periwinkle-70': 'var(--exo-palette-periwinkle-70)',
      'exo-gray-10': 'var(--exo-palette-gray-10)',
      'exo-gray-20': 'var(--exo-palette-gray-20)',
      'exo-gray-30': 'var(--exo-palette-gray-30)',
      'exo-gray-40': 'var(--exo-palette-gray-40)',
      'exo-gray-50': 'var(--exo-palette-gray-50)',
      'exo-gray-60': 'var(--exo-palette-gray-60)',
      'exo-gray-70': 'var(--exo-palette-gray-70)',
      'exo-gray-80': 'var(--exo-palette-gray-80)',
      'exo-gray-90': 'var(--exo-palette-gray-90)',
      'exo-gray-100': 'var(--exo-palette-gray-100)',
    },
  };
};
