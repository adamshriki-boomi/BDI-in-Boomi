import { Given, When } from '@badeball/cypress-cucumber-preprocessor';
import {
  loginMocks,
  RiverMocks,
  signInWithSimpleRiver,
  signToAppWithRiver,
} from '../../common/utils/login';

Given('I want to test error fallback', function () {
  // this is required for cypress to not suppress the error
  cy.on('uncaught:exception', () => false);
});
Given('I visit a non existing page {string}', (route: string) => {
  signInWithSimpleRiver();
  cy.rivery(route);
});
Given('I have no permissions', () => {
  cy.interceptApi(
    loginMocks.riverTypesList.url,
    loginMocks.riverTypesList.fixture,
    403,
  );
});
Given('session has expired', () => {
  cy.interceptApi(
    loginMocks.riverTypesList.url,
    loginMocks.riverTypesList.fixture,
    401,
  );
  cy.interceptPostApi('logout', 'signout.json');
});
Given('I visit a non existing angular river', () => {
  signToAppWithRiver(RiverMocks.NonVersionMode);
  cy.rivery('river/fake1/fake2/river/not-found');
});

Given('I visit a non existing river', () => {
  signToAppWithRiver(RiverMocks.NonVersionMode);
  cy.rivery('rivers/fake1/fake2/not-found');
});

When('I wait for mocks to complete loading', () => {
  cy.waitRiverGet();
});
When('rivers list completed loading', () => {
  cy.waitRiversGet();
});

Given('I visit to a non existing river with a 500 error', () => {
  signToAppWithRiver(RiverMocks.NonVersionMode);
  cy.interceptApi('rivers/list', 'empty.response.json', 500);
  cy.rivery('rivers/fake1/fake2/not-found');
});

