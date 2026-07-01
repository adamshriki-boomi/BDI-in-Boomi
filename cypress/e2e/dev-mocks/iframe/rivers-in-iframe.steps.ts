import { Given, Then } from "@badeball/cypress-cucumber-preprocessor";

Given('I want to see rivers of all types', () => {
  cy.interceptRiversGet(
    'rivers.all-types.json',
  );
});

Given('I want to see old river in iframe', () => {
  cy.interceptRiverGet(
    'river.s2t.facebook.json'
  )
})

Then('I see right sidebar', () => {
  cy.findByRole('menu', { name: 'right bar' })
})