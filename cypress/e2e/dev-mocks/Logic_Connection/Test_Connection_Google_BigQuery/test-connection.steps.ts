import { Given, Then, When } from '@badeball/cypress-cucumber-preprocessor';

// UTILS
const getFixture = (name: string) => `connections/${name}`;
const pullTestConnection = 'pull_test_connection?*';
const testConnectionsOld = '*connections/test';
const testConnectionsNew = '*connections/test?*';
const stopTestConnection = '*/cancel_run';

const waitPullTest = () => {
  return cy
    .wait(`@${pullTestConnection}`)
    .its('request.url')
    .should('contain', 'id=');
};
const interceptPullTestApi = (fixture: string) => {
  cy.interceptApi(pullTestConnection, getFixture(fixture));
};
const waitTestConnections = () => cy.wait(`@${testConnectionsOld}`);
const awaitIntercept = (fixture: string) => {
  interceptPullTestApi(fixture);
  waitTestConnections().its('request.body').should('not.be.empty');
  waitPullTest();
};

// STEPS
Given('I want to test connection', () => {
  cy.interceptPostApi(testConnectionsOld, getFixture('test.json'));
  interceptPullTestApi('pull_test_connection.W.json');
});

Given('I want to test source connection', () => {
  cy.interceptGetApi(testConnectionsNew, getFixture('test.json'));
  interceptPullTestApi('pull_test_connection.W.json');
});

Given('I want to see status {string} for test connection pull request', (status) =>
  interceptPullTestApi(`pull_test_connection.${status}.json`
));

Given('I want to cancel connection testing', () => {
  cy.interceptPostApi1(stopTestConnection, getFixture('test.json'));
});

When('test connection completed successfully', () => {
  awaitIntercept('pull_test_connection.Done.json');
});

When('test connection fails', () => {
  awaitIntercept('pull_test_connection.Error.json');
});

Then('I see data has been sent properly', () => {
  interceptPullTestApi('pull_test_connection.Done.json');
  waitTestConnections().then(({ request }) => {
    const content = request.body;
    Object.entries({
      connection_type: 'gcloud',
      doc_url: 'https://docs.rivery.io/docs/bq',
      file_type: 'json',
      is_fz_connection: true,
      is_test_connection: true,
      project_id: 'motherbrain',
    }).forEach(([key, value]) => expect(content).to.have.property(key, value));
  });
  waitPullTest();
});
