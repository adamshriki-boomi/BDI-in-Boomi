import { Before, Step, When, Given } from '@badeball/cypress-cucumber-preprocessor';

Given('I want to test Logic River', () => {
    Step(this, 'I click sidebar "Data Flows"');
    Step(this, 'I click button "New Data Flow"')
    Step(this, 'I see link "logic"')
    Step(this, 'I click link "logic"')
    Step(this, 'I want to view logic River')
    Step(this,'I see text "Logic Steps"')
})

When('I want to view logic River', () => {
  cy.intercept('GET', 'containers/River/components/RiverBox-*.tsx').as('loadRiverChunk')
  cy.intercept('GET', 'containers/River/River-*.tsx').as('loadRiverBoxChunk')
})

