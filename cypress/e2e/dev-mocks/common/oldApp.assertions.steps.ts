import { Then } from '@badeball/cypress-cucumber-preprocessor';
import { findTextsDataTablesInIframe } from './utils';

Then('I see labels in old app:', findTextsDataTablesInIframe());

Then('I see {string} in old app', text => {
  cy.getIframeBody().should('contain.text', text);
});
