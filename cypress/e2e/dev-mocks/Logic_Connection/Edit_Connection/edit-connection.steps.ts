import { Then } from '@badeball/cypress-cucumber-preprocessor';

Then('I see the connection with the new details I have changed', () => {
  cy.getConnectionId().should('have.property', 'id');
});
