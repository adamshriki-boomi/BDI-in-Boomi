import { Given, When } from '@badeball/cypress-cucumber-preprocessor';

// UTILS
const riversList = {
  url: 'rivers/list',
  fixture: 'rivers-list/action-river.json',
};

// STEPS
Given('I want to create action step', () => {
  cy.interceptApi(riversList.url, riversList.fixture);
  // cy.interceptPostApi(postNameVersion, 'versions/name.post.json');
});

When('action rivers have been loaded successfully', () => {
  cy.wait(`@${riversList.url}`);
});
