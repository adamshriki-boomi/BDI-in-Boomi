import { Given } from '@badeball/cypress-cucumber-preprocessor';

const url = `/#/?inviteUser&token=fakeToken`;

Given('I open an email invite', () => {
  cy.intercept('**/api/login*', {
    statusCode: 401,
    fixure: 'login/login.invalid.json',
  });
  cy.rivery(url);
});

Given('I want to set a valid password', () => {
  cy.interceptPostApi(
    'login/password/reset/*',
    'login/password.reset.200.json',
  );
});

Given('I want to set an invalid password', () => {
  cy.interceptPostApi(
    'login/password/reset/*',
    'login/password.reset.401.json',
    401,
  );
});
