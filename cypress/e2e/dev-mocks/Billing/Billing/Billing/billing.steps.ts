
import { Given, Step, When, Then } from '@badeball/cypress-cucumber-preprocessor';

Given('I want to subscribe to the On Demand plan', () => {
  cy.interceptPostApi(
    'subscription/checkout_page',
    'billing/checkout_page.json',
  );
});
Given('I want to see usage for plan', () => {
  cy.interceptApi('*/totals?timeRange=this_month', 'usage/usage.this_month',)
  cy.interceptApi('*/totals?timeRange=last_month', 'usage/usage.last_month')
  cy.interceptApiAs('*/totals?timeRange=custom*', 'usage/usage.custom', 'lastUsageCall')
  // cy.wait('@lastUsageCall')
})
Given('I open Subscription & Billing page', () => {
  Step(this, 'I click "Plans & Billing" menu item in "Settings" menu')
});

Given('I am subscribed to the {string} plan via aws', plan => {
  cy.interceptToken(`token/token.success.api.${plan}.aws.json`);
});
When('plans have been loaded', () => {
  cy.waitPlans();
  // cy.wait('@logicode_template')
  // cy.wait('@getEnvironments')
});
When('logicode have been loaded', () => {
  // cy.wait('@logicode_template')
  cy.wait('@getEnvironments');
});
When('checkout is completed', () => {
  cy.waitApi('subscription/checkout_page');
});

When('I see {string} account banner', (type: string) => {
  cy.findByRole('banner')
  cy.get(`[aria-label=${type}-account-banner]`).should('exist')
})

When("I don't see Trial account banner", () => {
  cy.get('[aria-label=trial-account-banner]').should('not.exist')
})

Then('I see chip {string} within {string}', (text: string, parent: string) => {
  cy.findByLabelText(parent).within(() => {
    cy.findByRole('status').within(() => {
      cy.findByText(new RegExp(text, 'i')).should('exist')
    })
  });
});