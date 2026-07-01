import { When } from '@badeball/cypress-cucumber-preprocessor';

const pollApi = 'pull*';

When('I want fetch datasets to succeed', () => {
  cy.interceptApi(pollApi, 'metadata/dataset.D.json');
});

When('I want fetch datasets to fail', () => {
  cy.interceptApi(pollApi, 'metadata/metadata.E.json');
});
