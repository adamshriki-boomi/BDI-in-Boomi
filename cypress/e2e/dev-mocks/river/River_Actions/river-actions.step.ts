import { When } from '@badeball/cypress-cucumber-preprocessor';

When('I type {string} in Connection Name of {string}', (text, stepName) => {
  cy.get(`[aria-label="${stepName} content"]`).within(() => {
    cy.findByLabelText('Connection Name').type(`${text}{enter}`);
  });
  //**Focus out of input */
  cy.get('body').click();
});

When('I see value {string} in Connection Name', value => {
  cy.findByLabelText('Connection Name').should('have.value', value);
});

When('I click clear in Connection Name of {string}', stepName => {
  cy.get(`[aria-label="${stepName} content"]`).within(() => {
    cy.get('[aria-label="Connection Name-clear-indicator"]').click({force: true});
  });
  //**Focus out of input */
  cy.get('body').click();
});
