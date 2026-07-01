// import '!style-loader!css-loader!sass-loader!../src/styles/index.scss';
import '../src/styles/index.scss';
// custom fonts are requried to be loaded here in order ot be displayed in storybook
// otherwise - storybook loads, but fonts won't be shown
// import '!style-loader!css-loader!sass-loader!../src/fonts/index.scss';
// import '!style-loader!css-loader!sass-loader!./custom.scss';
import { theme } from '../src/theme'
import { initialize, mswDecorator } from 'msw-storybook-addon';

// import { addDecorator } from '@storybook/react';
// import { initializeWorker, mswDecorator } from 'msw-storybook-addon';

initialize();
// initializeWorker();
// addDecorator(mswDecorator);

export const decorators = [mswDecorator];

export const parameters = {
  chakra: {
    theme,
  },
  actions: { argTypesRegex: '^on[A-Z].*' },
  backgrounds: {
    default: 'light',
    values: [
      {
        name: 'light',
        value: '#f8f8f8',
      },
      {
        name: 'dark',
        value: '#343a40',
      },
      {
        name: 'white',
        value: '#fff',
      },
    ],
  },
};
