const { defineConfig } = require('cypress');
const createEsbuildPlugin =
  require('@badeball/cypress-cucumber-preprocessor/esbuild').createEsbuildPlugin;
const createBundlerPlugin = require('@bahmutov/cypress-esbuild-preprocessor');
const cucumber = require('@badeball/cypress-cucumber-preprocessor');
require('dotenv').config({ path: '.env.development.local' });

async function setupNodeEvents(on, config) {
  // Create esbuild plugin for Cucumber
  const esbuildPlugin = await createEsbuildPlugin(config);

  // Configure the bundler with Cucumber support
  const bundler = createBundlerPlugin({
    plugins: [esbuildPlugin],
    define: {
      // This handles the async/await transforms
      global: 'window',
    },
  });

  // Register the bundler as preprocessor
  on('file:preprocessor', bundler);

  // Register Cucumber
  await cucumber.addCucumberPreprocessorPlugin(on, config);

  return config;
}

export default defineConfig({
  projectId: 'tyb17e',

  retries: {
    openMode: 0,
    runMode: 2,
  },

  viewportWidth: 1200,
  viewportHeight: 800,
  chromeWebSecurity: false,

  env: {
    v1_path: `https://api.dev.rivery.in/v1/**`,
    account_name: 'Rivery',
    _TAGS: '(not @ignore and not @demo) and @focus',
    iframeOldAppUrl: 'https://console.dev.rivery.in/ng/',
    EMAIL: process.env.CYPRESS_EMAIL,
    PASSWORD: process.env.CYPRESS_PASSWORD,
    USER_TYPE: process.env.CYPRESS_USER_TYPE,
    ENVIRONMENT: process.env.ENVIRONMENT,
  },

  responseTimeout: 10000,
  pageLoadTimeout: 600000,
  requestTimeout: 10000,
  defaultCommandTimeout: 15000,
  experimentalStudio: false,
  videoCompression: 32,
  video: false,
  screenshotOnRunFailure: true,
  animationDistanceThreshold: 2,
  modifyObstructiveCode: false,

  e2e: {
    specPattern: [
      'cypress/e2e/prod/**/*.feature',
      'cypress/e2e/dev-mocks/**/*.feature',
    ],
    baseUrl: 'http://localhost:4000',
    excludeSpecPattern: ['**/*.steps*'],
    setupNodeEvents,
  },

  component: {
    setupNodeEvents(on, config) {
      return config;
    },
    viewportWidth: 1000,
    viewportHeight: 800,
    specPattern: ['**/*.spec.ts*'],
    excludeSpecPattern: ['**/*.steps*'],
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
  },
});
