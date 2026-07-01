import { Before, Given, When, Step } from '@badeball/cypress-cucumber-preprocessor';


Before(() => {
  //For each folder of tests a different session is initiated
  // const isE2ETest = Cypress.spec.relative.includes('prod');
  const isFixtureTest = Cypress.spec.relative.includes('dev');
  // if(isE2ETest) {
  //   if(Cypress.env('USER_TYPE') === 'super_admin') {
  //     Step(this, 'I sign in as real super admin to the app')
  //   }

  //   else if(Cypress.env('USER_TYPE') === 'user') {
  //     Step(this, 'I sign in as real user to the app')
  //   }

  //   else{
  //     Step(this, 'I sign in as real admin to the app')
  //   }
  // }
  if(isFixtureTest) {
    Step(this, 'I am signed in as fake user to the app')
  }
})

function extractAccountIdFromSession() {
  cy.window().then((win) => {
    const accountId = win.sessionStorage.getItem('selectedAccountId');
    cy.visit(`/dashboard/${accountId}/default_env`)
  });
}


Given('I sign in as real super admin to the app', function () {
  cy.signInRealWithSuperAdmin();
  cy.window().then((win) => {
    const accountId = win.sessionStorage.getItem('selectedAccountId');
    cy.visit(`/dashboard/${accountId}/default_env`)
  });
});


When('I sign in as real admin to the app', function () {
  cy.signInRealWithAdmin();
  extractAccountIdFromSession();
});


// Given('I sign in as real admin to the app', function () {
//   cy.signInRealWithAdmin();
//   extractAccountIdFromSession();
// });

Given('I sign in as real user to the app', function () {
  cy.signInRealWithDifferentRoles();
  cy.window().then((win) => {
    const accountId = win.sessionStorage.getItem('selectedAccountId');
    cy.visit(`/dashboard/${accountId}/default_env`)
  });
});

Given(/^I( a|')m on the dashboard page$/i, () => {
  cy.rivery();
});

When('I navigate to the {string} page', (page: string) => {
  cy.sidebar(page).click();
});

Given('I want to test with dataset support', () => {
  cy.interceptApi('pull/datasets', 'datasets/dataset.D.json');
});
Given('I want to test with databases support', () => {
  cy.interceptApi('pull/databases', 'datasets/dataset.D.json');
});

