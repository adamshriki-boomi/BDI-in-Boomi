import { Given } from '@badeball/cypress-cucumber-preprocessor';

Given('I sign in with a blocked account', () => {
  cy.interceptToken('token/token.success.api.BLOCKED.json');
});

Given('I sign in with a viewer account', () => {
  cy.interceptToken('token/token.success.viewer.json');
});
