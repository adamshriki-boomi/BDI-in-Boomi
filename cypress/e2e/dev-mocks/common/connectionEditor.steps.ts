import { Given, Then, When } from '@badeball/cypress-cucumber-preprocessor';

const interceptDataSources = (fixture: string, type = '*') => {
  return cy.interceptDataSources(`datasources_types/${fixture}`, type);
}

export const interceptSnowflake = () => {
  cy.interceptDataSourcesTypes('snowflake.get');
  cy.interceptConnection('snowflake', 'connections.snowflake')
}
const azureConnectionsUrl = 'connections?*type=azure_sql_dwh';
const azureConfig = {
  azure: {
    [azureConnectionsUrl]: 'connections/connections.type.azure.sql.get.json',
  },
  azureConnection: {
    'connections*&_id=*': 'connections/connections._id=azure_sql.get.json',
  }
};
const keypairsUrl = 'connections/key_pair?*';

const patchConnectionUrl = 'connections?*_id=*';

type StepSource = 'Azure Synapse Analytics' | 'Snowflake';
const selectSourceForStep1 = (source: StepSource) => {
  cy.listbox('block-type-Logic-step-1', 'SQL / DB Transformations');
  cy.listbox('data-target-type-Logic-step-1', source);
  cy.collapse('Source', 'Logic step 1');
}
Given('I want to mock data sources', () => {
  interceptDataSources('googlebq.get')
});

Given('I want to mock Google BigQuery sources', () => {
  interceptDataSources('googlebq.get', 'gcloud')
});

When('I open new connection for Google BigQuery', () => {
  // IMPORTANT - Given('I want to mock Google BigQuery sources') 
  // might be needed to run before signin, if you need to interact with the form in connection modal
  // .i.e "Test Connection Google BigQuery.feature"
  cy.interceptApi('connections*', 'connections/connections.bq.json');
  cy.interceptPostApi(
    'connections/key_pair',
    'connections/connections.empty.json',
  );
  cy.listbox('block-type-Logic-step-1', 'SQL / DB Transformations');
  cy.listbox(`data-target-type-Logic-step-1`, 'Google BigQuery');
  cy.collapse('Source', 'Logic step 1');
  cy.clickButton('New Connection');
  // cy.waitApi(dataSourceUrl);
  cy.findByRole('dialog');
});
When('I want to send connection creation link to external user', () => {
  cy.interceptApi(
    'connections/share_creation_link/bq*',
    'connections/share_external_link.json',
  );
  cy.interceptApi(
    'connections/share_creation_by_email/bq*',
    'connections/share_external_link.json',
  );
});

When('connection data is ready', () => {
  cy.waitApi('connections/key_pair')
});

Given('I want to create a new s3 connection', () => {
  interceptDataSources('aws.get');
  cy.interceptGetApi(
    'connections/externalId/s3*',
    'connections/external_id.s3',
  );
});

When('Data Sources have loaded', () => {
  cy.waitDataSources();
})
When('I click on new connection For S3', () => {
  cy.findAllByRole('button', { name: new RegExp('New Connection', 'ig') })
    .eq(1)
    .click();
  cy.findByRole('dialog');
});

Given('I want to test Snowflake connections', () => {
  interceptSnowflake();
})
Given('I want to test Azure Synapse Analytics connections', () => {
  cy.interceptDataSourcesTypes('azuresql.get');
  cy.interceptConnection('azure_sql_dwh', 'connections.type.azure.sql.get')
})
When('I open new connection for Snowflake', () => {
  interceptSnowflake();
  selectSourceForStep1('Snowflake')
  cy.clickButton('New Connection');
  cy.waitDataSources();
  cy.waitConnection('snowflake');
  cy.findByRole('dialog');
});

When('I open new connection for Azure Synapse Analytics', () => {
  cy.interceptApi(
    azureConnectionsUrl,
    'connections/connections.type.azure.sql.get.json',
  );
  cy.interceptConnectionId('azure_sql')
  cy.interceptApi(keypairsUrl, 'connections/key_pairs.get.json');
  interceptDataSources('azuresql.get');
  selectSourceForStep1('Azure Synapse Analytics')
  cy.waitMany(azureConfig.azure);
  cy.listbox('Connection Name', 'alice_in_chains');
  // cy.findByText('alice_in_chains');
  cy.findButton('Edit').should('not.be.disabled');
  cy.clickButton('Edit');
  cy.findByRole('dialog');
});

When('I see connection form', () => {
  cy.waitApi('connections/key_pair');
})
const fileZone = {
  api: 'target_ids/fz/snowflake*',
  interceptSnowflake: () =>
    cy.interceptApi(fileZone.api, 'connections/connections.fz.snowflake.json'),
  waitSnowflake: () => cy.wait(`@${fileZone.api}`),
};
When('I edit a snowflake connection', () => {
  interceptSnowflake();
  cy.interceptConnectionId('snowflake')
  cy.interceptRelatedConnections('connections/related_rivers.json');
  cy.interceptPatchApi(patchConnectionUrl, 'connections/edit._id.patch.json');
  selectSourceForStep1('Snowflake')
  cy.listbox('Connection Name', '🛕The Temples Of Syrnix 🎸');
  fileZone.interceptSnowflake();
  cy.clickButton('Edit');
  cy.findByRole('dialog');
  cy.waitConnectionId();
  fileZone.waitSnowflake();
});

Given('I want to save a protected connection', () => {
  cy.interceptRelatedConnections('connections/related_rivers_exists.json');
  cy.interceptPatchApi(patchConnectionUrl, 'connections/edit.error.patch.json');
});

Then('connection has been edited successfully', () => {
  cy.wait(`@${patchConnectionUrl}`);
});
Then('the list of connections should be refreshed', () => {
  cy.waitConnection('snowflake')
});

Given('I want to set a connection as a source', () => {
  cy.interceptApi('connections*', 'connections/connections.bq.json');
});

Given('I want to set a connection for Action step', () => {
  cy.interceptApi('rivers/list', 'rivers-list/action.rivers.Rivery.json');
  cy.interceptApi(
    'connections*type=custom',
    'connections/connections.type.custom.json',
  );
  cy.interceptApi('actions/list', 'actions/list.post.json');
});

Given('I have added a new Google BQ connection', () => {
  cy.interceptApi(
    'connections?*connection_type=gcloud',
    'connections/connections.bq.json',
  );
});

Then('I expect google bq connection list to refresh', () => {
  cy.wait('@connections?*connection_type=gcloud').then(
    ({ request, response }) => {
      expect(request?.url).to.contain('connections');
      expect(response.body).to.have.length.gt(1);
    },
  );
});
