import { Then, When } from '@badeball/cypress-cucumber-preprocessor';

When('I spy action {string}', (actionType:string) =>
  cy
    .window()
    .its('store')
    .then(v => {
      cy.spy(v, 'dispatch')
        .withArgs(Cypress.sinon.match.has('type', actionType))
        .as(actionType);
    }),
);

Then('I saw action {string} {int} times', (actionType, count) => {
  cy.get(`@${actionType}`).should('have.callCount', count);
});

When('I pause', () => cy.pause());
When('I wait {int}', (duration:number) => cy.wait(duration));
