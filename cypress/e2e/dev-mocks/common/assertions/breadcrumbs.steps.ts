import { Then } from "@badeball/cypress-cucumber-preprocessor";

Then('I see breadcrumbs with {string}', (breadcrumb:string) => {
  cy.findByRole('navigation', { name: 'breadcrumb'}).within(() => {
    cy.findByText(breadcrumb);
  })
})