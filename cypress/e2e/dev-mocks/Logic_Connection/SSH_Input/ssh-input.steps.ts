import { Given, Then, When } from '@badeball/cypress-cucumber-preprocessor';

// UTILS
const keyPairUrl = 'connections/key_pair*';
const keyPairsUrl = 'connections/key_pairs*';

  // STEPS
  Given('I want to edit key pairs', () => {
    cy.interceptGetApi(keyPairUrl, 'connections/key_pair.get');
    cy.interceptGetApi(keyPairsUrl, 'connections/key_pairs.get');
  });

Given('I want to create a key pair', () => {
  cy.interceptPostApi(
    'connections/key_pair*',
    'connections/key_pair.post.json',
  );
});

const keyPairApis = () => {
  cy.waitApi(keyPairUrl);
  cy.waitApi(keyPairsUrl);
}
When('key pairs have been loaded successfully', keyPairApis);
Then('new key pair should be created and selected', keyPairApis);
