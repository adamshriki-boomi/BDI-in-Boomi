import { Given, Then } from "@badeball/cypress-cucumber-preprocessor";

Given('I want to change my current password', () => {
    cy.interceptPostApiAs('user_management/password', 'password-changed.json', 'password-response' , 200);
  });

Then('I wait for password to change', () => {
    cy.wait('@password-response')
})