import { Given } from '@badeball/cypress-cucumber-preprocessor';

Given('I want to switch an account', () => {
  cy.interceptRiversGet('paginated-rivers-list-2.get');
});

Given('I want to switch an environment', () => {
  cy.interceptRiversGet('paginated-rivers-list-2.get');
  cy.interceptToken('token/token.single.account.after.signup.json');
});

Given('I want to see the same river in that environment', () => {
  cy.interceptToken('token/token.single.account.after.signup.json');
});
