export * as rtl from '@testing-library/cypress/add-commands';
declare global {
  namespace Cypress {
    interface Chainable {
    interceptMany: typeof interceptMany;
    waitMany: typeof waitMany;
    waitApi: typeof waitApi;
    mockLoginSuperAdminApis: typeof mockLoginSuperAdminApis;
    /**
     * mocks apis for single accoutn with faked-env-1
     */
    mockAccounts: typeof mockAccounts;
    mockFakeLoginSingleAccount: typeof mockFakeLoginSingleAccount;
    mockFakeLoginNoAccounts: typeof mockFakeLoginNoAccounts;
    interceptLogin: typeof interceptLogin;
    interceptToken: typeof interceptToken;
    interceptTokenRivery: typeof interceptTokenRivery;
    interceptEnvironments: typeof interceptEnvironments;
    interceptApi: typeof interceptApi;
    interceptApiBody: typeof interceptApiBody;
    interceptApiAs: typeof interceptApiAs;
    interceptGetApi: typeof interceptGetApi;
    interceptGetApi1: typeof interceptGetApi1;
    interceptPostApi1: typeof interceptPostApi1;
    interceptPutApi1: typeof interceptPutApi1;
    interceptDeleteApi1: typeof interceptDeleteApi1;
    interceptGetApiAs: typeof interceptGetApiAs;
    interceptPostApi: typeof interceptPostApi;
    interceptPostApiAs: typeof interceptPostApiAs;
    interceptPutApi: typeof interceptPutApi;
    interceptPutApiAs: typeof interceptPutApiAs;
    interceptPatchApi: typeof interceptPatchApi;
    interceptPatchApiAs: typeof interceptPatchApiAs;
    interceptDeleteApi: typeof interceptDeleteApi;
    interceptDeleteApiAs: typeof interceptDeleteApiAs;
    interceptApi1BodyAs: typeof interceptApi1BodyAs;
    interceptUsage: typeof interceptUsage;
    interceptAPITokens: typeof interceptAPITokens;
    }
  }
}
const API_PREFIX = '**/api/';
const API_PREFIX_V1 = `${Cypress.env('v1_path')}/`;
const getPath = (apiVersion, url) => {
  const prefix = url.startsWith('http')
    ? ''
    : apiVersion !== 0
    ? API_PREFIX_V1
    : API_PREFIX;
  return `${prefix}${url}`;
};
const interceptLogin = (
  fixture = 'login.with.accounts.json',
  statusCode = 200,
  accounts = null,
) => {
  cy.intercept('**/api/login*', {
    statusCode,
    fixture,
  }).as('postLogin');
  if (accounts) {
    cy.mockAccounts(accounts);
  }
};
Cypress.Commands.add('interceptLogin', interceptLogin);

const interceptUsage = (fixture = 'monthly_usage.json') => {
  cy.interceptGetApi('dashboard/totals?*', fixture);
};
Cypress.Commands.add('interceptUsage', interceptUsage);

const interceptAPITokens = () => {
  cy.interceptGetApi('admin/list_tokens', 'api_tokens.get.json');
};
Cypress.Commands.add('interceptAPITokens', interceptAPITokens);

const interceptToken = (
  fixture = 'token/token.single.account.after.signup-env1.json',
) => {
  cy.interceptPostApi('token*', fixture);
};
Cypress.Commands.add('interceptToken', interceptToken);

const interceptTokenRivery = () => {
  interceptToken('token/token.single.account.Rivery.json');
};
Cypress.Commands.add('interceptTokenRivery', interceptTokenRivery);

const interceptEnvironments = (
  fixture = 'environments/environments.get.json',
) => {
  cy.interceptGetApi1('*environments?*', fixture, 200, 'getEnvironments');
};
Cypress.Commands.add('interceptEnvironments', interceptEnvironments);

// Multiple Api Calls
const mockLoginSuperAdminApis = () => {
  cy.interceptLogin();
  cy.interceptLogin('token/token.success.superAdmin.json');
  cy.interceptEnvironments();
};
Cypress.Commands.add('mockLoginSuperAdminApis', mockLoginSuperAdminApis);

const mockFakeLoginSingleAccount = (fixtures = undefined) => {
  cy.interceptLogin(fixtures?.login);
  cy.mockAccounts();
  cy.interceptToken(fixtures?.token);
  cy.interceptAPITokens()
  cy.interceptUsage(fixtures?.usage);
  cy.interceptEnvironments();
};
Cypress.Commands.add('mockFakeLoginSingleAccount', mockFakeLoginSingleAccount);

const mockAccounts = (fixture = 'accounts.admin.only.json') => {
  cy.interceptGetApiAs('accounts?*', `accounts/${fixture}`, 'accounts', 200, 1);
};
Cypress.Commands.add('mockAccounts', mockAccounts);

const mockFakeLoginNoAccounts = () => {
  cy.interceptLogin(
    'login.new.user.without.account.json',
    200,
    'accounts.admin.only.json',
  );
  cy.interceptEnvironments();
};
Cypress.Commands.add('mockFakeLoginNoAccounts', mockFakeLoginNoAccounts);

const interceptMany = (fixtures: Record<string, string>) => {
  Object.entries(fixtures).forEach(([url, fixture]) => {
    cy.intercept(`**/api/${url}`, {
      statusCode: 200,
      fixture,
    }).as(url);
  });
};
Cypress.Commands.add('interceptMany', interceptMany);

/**
 * intercepts the app's api
 * `url` is attached as the alias
 */
const interceptApiAs = (
  url: string,
  fixture: string,
  alias: string,
  statusCode = 200,
) => {
  return cy
    .intercept(`${API_PREFIX}/${url}`, {
      statusCode,
      fixture,
    })
    .as(alias);
};
Cypress.Commands.add('interceptApiAs', interceptApiAs);

const interceptApi = (url: string, fixture: string, statusCode = 200) => {
  return cy.interceptApiAs(url, fixture, url, statusCode);
};
Cypress.Commands.add('interceptApi', interceptApi);

const interceptApiBody = (url: string, body, statusCode = 200, alias = url) => {
  return cy
    .intercept(`${API_PREFIX}/${url}`, {
      statusCode,
      body,
    })
    .as(alias);
};
Cypress.Commands.add('interceptApiBody', interceptApiBody);

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE';

const interceptGetApiAs = (
  url: string,
  fixture: string,
  alias = url,
  statusCode = 200,
  apiVersion = 0,
  method: Method = 'GET',
) => {
  const path = getPath(apiVersion, url);
  cy.intercept(method, path,{
    statusCode,
    fixture,
  }).as(alias);
};
Cypress.Commands.add('interceptGetApiAs', interceptGetApiAs);

const interceptApi1BodyAs = (
  url: string,
  body,
  alias = url,
  statusCode = 200,
  method: Method = 'GET',
  apiVersion = 1,
) => {
  const path = getPath(apiVersion, url);
  cy.intercept(method, path, {
    statusCode,
    body,
  }).as(alias);
};
Cypress.Commands.add('interceptApi1BodyAs', interceptApi1BodyAs);

const interceptApi1 =
  method =>
  (url: string, fixture: string, statusCode = 200, alias = undefined) => {
    cy.interceptGetApiAs(url, fixture, alias ?? url, statusCode, 1, method);
  };
const interceptGetApi1 = interceptApi1('GET');
const interceptPostApi1 = interceptApi1('POST');
const interceptPutApi1 = interceptApi1('PUT');
const interceptDeleteApi1 = interceptApi1('DELETE');

Cypress.Commands.add('interceptGetApi1', interceptGetApi1);
Cypress.Commands.add('interceptPostApi1', interceptPostApi1);
Cypress.Commands.add('interceptPutApi1', interceptPutApi1);
Cypress.Commands.add('interceptDeleteApi1', interceptDeleteApi1);

const interceptGetApi = (
  url: string,
  fixture: string,
  { statusCode, apiVersion } = { statusCode: 200, apiVersion: 0 },
) => {
  cy.interceptGetApiAs(url, fixture, url, statusCode || 200, apiVersion || 0);
};
Cypress.Commands.add('interceptGetApi', interceptGetApi);

const interceptPostApiAs = (
  url: string,
  fixture: string,
  alias = url,
  statusCode = 200,
  config = {},
) => {
  cy.intercept('POST', `**/api/${url}`, {
    statusCode,
    fixture,
    ...config,
  }).as(alias);
};
Cypress.Commands.add('interceptPostApiAs', interceptPostApiAs);

const interceptPostApi = (
  url: string,
  fixture: string,
  statusCode = 200,
  config = {},
) => {
  cy.interceptPostApiAs(url, fixture, url, statusCode, config);
};
Cypress.Commands.add('interceptPostApi', interceptPostApi);

const interceptPutApiAs = (
  url: string,
  fixture: string,
  alias = url,
  statusCode = 200,
): Cypress.Chainable => {
  return cy
    .intercept('PUT', `**/api/${url}`, {
      statusCode,
      fixture,
    })
    .as(alias);
};
Cypress.Commands.add('interceptPutApiAs', interceptPutApiAs);

const interceptPutApi = (
  url: string,
  fixture: string,
  statusCode = 200,
): Cypress.Chainable => {
  return cy.interceptPutApiAs(url, fixture, url, statusCode);
};
Cypress.Commands.add('interceptPutApi', interceptPutApi);

const interceptPatchApiAs = (
  url: string,
  fixture: string,
  alias: string,
  statusCode = 200,
) => {
  cy.intercept('PATCH', `**/api/${url}`, {
    statusCode,
    fixture,
  }).as(alias);
};
Cypress.Commands.add('interceptPatchApiAs', interceptPatchApiAs);

const interceptPatchApi = (url: string, fixture: string, statusCode = 200) => {
  cy.interceptPatchApiAs(url, fixture, url, statusCode);
};
Cypress.Commands.add('interceptPatchApi', interceptPatchApi);

const interceptDeleteApiAs = (
  url: string,
  fixture: string,
  alias: string,
  statusCode = 200,
) => {
  cy.intercept('DELETE', `**/api/${url}`, {
    statusCode,
    fixture,
  }).as(alias);
};
Cypress.Commands.add('interceptDeleteApiAs', interceptDeleteApiAs);

const interceptDeleteApi = (url: string, fixture: string, statusCode = 200) => {
  cy.interceptDeleteApiAs(url, fixture, url, statusCode);
};
Cypress.Commands.add('interceptDeleteApi', interceptDeleteApi);

/**
 * awaits for multiple urls to complete
 * expects a map of urls and fixtures
 * @param fixtures - map of { url-regex: fixture-path }
 * DEPRECATED (causes flaky behavior..)
 */
const waitMany = (fixtures: Record<string, string> | string[]) => {
  const entries = Array.isArray(fixtures)
    ? fixtures
    : Object.entries(fixtures).map(([url]) => url);
  cy.wait(
    entries.map(url => {
      return `@${url}`;
    }),
  );
};
Cypress.Commands.add('waitMany', waitMany);

/**
 * awaits for multiple urls to complete
 * expects a map of urls and fixtures
 * @param fixtures - map of { url-regex: fixture-path }
 */
const waitApi = (alias: string) => {
  return cy.wait(`@${alias}`);
};
Cypress.Commands.add('waitApi', waitApi);
