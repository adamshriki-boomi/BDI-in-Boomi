import { Given, Step, Then, When } from '@badeball/cypress-cucumber-preprocessor';
import { RiverMocks, riverUrls, signInWithSimpleRiver, signToAppWithRiver } from './utils/login';

Given('I am signed in as viewer to the app', function () {
  this.riverMock = RiverMocks.SimpleRiver;
  signInWithSimpleRiver({ token: 'token/token.success.viewer.json' });
});
Given('I am signed in as expired trial user to the app', function () {
  this.riverMock = RiverMocks.SimpleRiver;
  signInWithSimpleRiver({ token: 'token/token.success.api.VIEWER.json' });
});
Given('I am signed in as deployment manager', function () {
  this.riverMock = RiverMocks.SimpleRiver;
  signInWithSimpleRiver({ token: 'token/token.success.api.deployment_admin.json' });
});
Given('I am signed in as blocked by admin trial user to the app', function () {
  this.riverMock = RiverMocks.SimpleRiver;
  signInWithSimpleRiver({ token: 'token/token.success.api.blocked_by_admin.json' });
});

Given('I am signed in as admin user to the app', function () {
  this.riverMock = RiverMocks.SimpleRiver;
  signInWithSimpleRiver({ 
    login: 'login/login.accounts.admin.only.json',
    token: 'token/token.success.api.admin.json'
  });
});

Given('I am signed in as admin user to the app with user invites blocked', function () {
  this.riverMock = RiverMocks.SimpleRiver;
  signInWithSimpleRiver({
    login: 'login/login.accounts.admin.only.json',
    token: 'token/token.success.api.user_sso.json'
  });
});

Given('I am signed in as super admin to the app', function () {
  this.riverMock = RiverMocks.SimpleRiver;
  signInWithSimpleRiver({ 
    login: 'login/login.accounts.admin.only.json',
    token: 'token/token.success.superAdmin.json'
  });
});

Given('I am signed in a pro user to the app', function () {
  this.riverMock = RiverMocks.SimpleRiver;
  signInWithSimpleRiver({ 
    login: 'login/login.accounts.admin.only.json',
    token: 'token/token.success.api.Professional.json'
  });
});



Given('I am signed in as fake user to the app', function () {
  this.riverMock = RiverMocks.SimpleRiver;
  signInWithSimpleRiver();
  cy.window().then(win => {
    cy.stub(win, 'prompt').returns('DISABLED WINDOW PROMPT');
  });
});

Given('I am subscribed to the {string} plan', plan => {
  cy.interceptPostApi('login', 'login/login.valid.json');
  cy.interceptToken(`token/token.success.api.${plan}.json`);
});

Given('I am signed in as fake user to the app without dataframes', function () {
  this.riverMock = RiverMocks.SimpleRiver;
  signInWithSimpleRiver({}, ['dataframes']);
});

Given('I open a valid river', function () {
  this.riverMock = RiverMocks.SimpleValidRiver;
  signToAppWithRiver(RiverMocks.SimpleValidRiver);
});

Given('I open a river with an error', function () {
  this.riverMock = RiverMocks.RiverWithError;
  signToAppWithRiver(this.riverMock);
});

Given('I open a river with an error fallback', function () {
  this.riverMock = RiverMocks.RiverWithErrorFallBack;
  signToAppWithRiver(this.riverMock);
});
Given('I want to open a valid logic river', function () {
  cy.interceptPostApi(RiverMocks.SimpleValidRiver.url, RiverMocks.SimpleValidRiver.fixture,  200);
});

Given('I open a river with an error in variables', function () {
  this.riverMock = RiverMocks.SimpleRiver;
  signToAppWithRiver(this.riverMock);
  cy.interceptGetApiAs(
    'variables*',
    'river-variables/variables.json',
    'rivers/variables',
    500,
    1,
  );
});

Given('I am signed in as fake user to the app with python river', function () {
  this.riverMock = RiverMocks.PythonRiver;
  signToAppWithRiver(RiverMocks.PythonRiver);
});

Given('I want to create an Action step', () => {
  cy.interceptPostApi('rivers/list', 'rivers-list/action.rivers.json');
});

Given('I want to select rivers from a different account', () => {
  cy.interceptPostApi('rivers/list', 'rivers-list/action.rivers.Rivery.json');
  cy.clickChangeAccount();
  cy.interceptTokenRivery();
  cy.sidebar('Data Flows');
});


When('I navigate to rivers table', () => {
  cy.sidebar('Data Flows');
});

When('I navigate to a logic river', () => {
  cy.sidebar('Data Flows');
  cy.clickLink('Simple River Logic Example');
});

When('I wait for action rivers to display', () => {
  cy.waitMany(['rivers/list']);
});

When('logic river page is displayed', function () {
  cy.sidebar('Data Flows');
  cy.waitRiversGet();
  cy.clickLink('Simple River Logic Example');
  Step(this, 'I see button "Run"');
});

When('river page reloaded', function () {
  cy.wait(['@getToken', '@getEnvironments']);
  const { url, fixture } = this.riverMock;
  cy.waitRiverGet();
  cy.waitRiversGet();
  cy.waitMany({ [url]: fixture, ...riverUrls });
});
enum RiverTypesToUrlParamValue {
  'Source To Target' = 'src_to_fz',
  Action = 'action',
}
// const seeEmptyRiverType = type => {
//   cy.getIframeWindow();
//   cy.oldAppLoaded(type);
// };
Then('I see empty river of {string} in old app', (type: RiverTypesToUrlParamValue) => {
  // disabled due to flakiness in ci
  // seeEmptyRiverType(RiverTypesToUrlParamValue[type]);
  cy.seeInUrl(RiverTypesToUrlParamValue[type])
});

When('I switch to a viewer account', function () {
  this.riverMock = RiverMocks.SimpleRiver;
  signInWithSimpleRiver({ token: 'token/token.success.viewer.json' });
  cy.clickChangeAccount()
  cy.clickButton('Rivery');
});


Given('I select source to target river in logic step with variables', function () {
  cy.interceptGetApiAs(
    '/variables*',
    'river-variables/variables.json',
    'rivers/variables',
    200,
    1,
  );
});

