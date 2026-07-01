const { resolve } = require('path');
const { mergeConfig } = require('vite');
const svgrPlugin = require('vite-plugin-svgr')
const tsconfigPaths = require('vite-tsconfig-paths').default;

module.exports = {
  stories: ["../src/**/*.stories.mdx", "../src/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials", 
    "@storybook/addon-interactions",
    '@storybook/preset-scss',
    '@chakra-ui/storybook-addon'
  ],
  refs: {
    '@chakra-ui/react': {
      disable: true,
    },
  },
  features: {
    emotionAlias: false
  },

  framework: "@storybook/react",
  core: {
    builder: "@storybook/builder-vite"
  },
  async viteFinal(config, { configType }) {
    // return the customized config
    return mergeConfig(config, {
      base: './',
      plugins: [
        tsconfigPaths(),
        svgrPlugin({
          svgrOptions: {
            icon: true,
          },
        }),
      ],
      // customize the Vite config here
      resolve: {
        alias: { 
          src: resolve(__dirname, '../src/'),
          containers: resolve(__dirname, '../src/containers'),
          modules: resolve(__dirname, '../src/modules'),
          components: resolve(__dirname, '../src/components' ),
          utils: resolve(__dirname, '../src/utils' ),
          store: resolve(__dirname, '../src/store' ),
          api: resolve(__dirname, '../src/api' ),
          app: resolve(__dirname, '../src/app' ),
          theme: resolve(__dirname, '../src/theme' ),
          hooks: resolve(__dirname, '../src/hooks' ),
          '~bootstrap': resolve(__dirname, '../node_modules/bootstrap' ),
        },
      },
    });
  },
};