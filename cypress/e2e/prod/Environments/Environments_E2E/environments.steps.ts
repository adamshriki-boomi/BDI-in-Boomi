import { Given,When, Step } from "@badeball/cypress-cucumber-preprocessor";

Given('I want to test Environments visibility', () => {
    Step(this, 'I click label "environment account selector"');
})

When('The selected environment has loaded', () => {
    cy.intercept('POST', '*/token').as('token');
    cy.wait('@token');
})
