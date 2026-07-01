import { Given, Then } from '@badeball/cypress-cucumber-preprocessor';
import { signInWithSimpleRiver } from '../../common/utils/login';

Given('I am signed in as global operator to the app', function () {
  signInWithSimpleRiver({
    login: 'login/login.accounts.admin.only.json',
    token: 'token/token.success.api.global_operator.json',
  });
});

Given('I am signed in as super admin creator in super admins account', function () {
  signInWithSimpleRiver({
    login: 'login/login.accounts.admin.only.json',
    token: 'token/token.success.api.super_admins_account.json',
  });
});

Given('I want to invite a privileged user', () => {
  cy.interceptPostApi1(
    'accounts/*/users/privileged',
    'users/privileged_user_response.json',
  );
});

Then('I see {string} advanced role option is disabled', (role: string) => {
  cy.findByRole('radiogroup', { name: /Advanced Roles for Boomi Users/i }).within(() => {
    cy.findByRole('radio', { name: role }).should('be.disabled');
  });
});
