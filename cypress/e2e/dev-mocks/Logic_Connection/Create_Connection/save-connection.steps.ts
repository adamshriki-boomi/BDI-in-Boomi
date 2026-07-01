import { Then, When } from '@badeball/cypress-cucumber-preprocessor';

// UTILS
const getFixture = (name: string) => `connections/${name}`;
export const createConnectionUrl = 'connections/create/data*';
const getConnectionsUrl = 'connections?*';

// STEPS
When('I want to save a new connection', () => {
  cy.interceptPutApi(
    createConnectionUrl,
    getFixture('create-connection.success.json'),
  );
  cy.interceptApi(getConnectionsUrl, getFixture('connections.type.aws.json'));
});


When('I want to open popup modal for oauth2', () => {
  cy.interceptPostApi(
    'oauth2request',
    'connections/oauth.json',
  );
  cy.interceptPostApi(
    'get_credentials',
    'connections/get_credentials_success.json',
  );
});

When('I want to open popup modal for oauth2 to get error', () => {
  cy.interceptPostApi(
    'oauth2request',
    'connections/oauth_error.json',
  );
});
When('I want to see see success message for oauth2', () => {
  cy.interceptPostApi(
    'get_credentials',
    'connections/get_credentials_success.json',
  );
});

Then('the new connection is saved successfully', () => {
  cy.wait(`@${createConnectionUrl}`).then(({ request }) => {
  const params = {
      // make sure the value should be number
      port: 22, 
      project_id: "1111",
      connection_name: "Connection From Test"
  }
  Object.entries(params)
    .forEach(([key, value]) => expect(request?.body).to.have.property(key, value));
  });
});

Then('connections list is reloaded', () => {
  cy.wait(`@${getConnectionsUrl}`);
});
