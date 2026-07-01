import { Given, When } from '@badeball/cypress-cucumber-preprocessor';

// UTILS
const getFixture = (name: string) => `connections/${name}`;
const fzSnowflakeUrl = 'target_ids/fz/snowflake*';
const getConnectionsUrl = 'connections?*';

// STEPS
Given('I want to select a custom file zone', () => {
  cy.interceptApi(fzSnowflakeUrl, getFixture('fz.snowflake.get.json'));
  cy.interceptApi(getConnectionsUrl, getFixture('connections.type.aws.json'));
});
// Then('the new connection is saved successfully', () => {
//   cy.wait(`@${createConnectionUrl}`);
// });
When('file zone list has loaded', () => {
  cy.wait(`@${fzSnowflakeUrl}`);
});

const bucketApi = 'pull/buckets*';
const pollApi = 'pull*';

When('I want fetch buckets to succeed', () => {
  cy.interceptApi(pollApi, 'metadata/bucket.D.json');
});

When('buckets request was sent', () => {
  cy.waitMany([bucketApi, pollApi]);
});
