import { Given, Then, When } from '@badeball/cypress-cucumber-preprocessor';

const apiUrls = {
  'river_groups*': 'river_groups/get.json',
};
const interceptUrls = () => {
  return cy.interceptMany(apiUrls);
}
const interceptRivers = () => {
  cy.interceptRiverGet('rivers-list.get.json');
  cy.interceptRiver('simple-river.json');
  interceptUrls();
}
Given('app is ready to test river page', interceptRivers);

Given('I navigate to a valid logic river page as admin', () => {
  cy.interceptRiverGet('rivers-list.get.json');
  cy.interceptRiver('simple-river.valid.json');
  interceptUrls()
  cy.visitFakeRiver();
});
Given('I want to display a river with various connections', () => {
  cy.interceptRiver('river-with-different-connections.post.json');
});

When('I wait for river mocks to complete loading', () => {
  cy.wait([
    '@rivers/list',
    '@rivers/variables',
    // '@datasource_types/all*',
    '@river_groups*',
    // '@target_types*',
  ])
  .wait(5000)
    // This triggers the auto-loaded connection bar, sometimes cypress misses the re-render and fails
    .wait(200);
});

const modifyRiver = 'rivers/modify*';
Given('I want to save a new river', () => {
  cy.interceptPutApi(modifyRiver, 'rivers-list/new.default.river.json');
});
Then('the river is saved', () => {
  cy.wait(`@${modifyRiver}`);
});

const uploadFileTo = (
  inputLabel: string,
  status: number,
  { url, fixture, fileFixture },
) => {
  cy.interceptApi(url, fixture, status);
  cy.get(`input[aria-label="${inputLabel}"]`).selectFile(fileFixture, {
    action: 'select',
    force: true
  });
  cy.waitApi(url);
};

const jsonConfig = {
  url: 'connections/create/file',
  fixture: 'connections/create-file.json',
  fileFixture: 'cypress/fixtures/connections/file-upload.example.json',
};
When('I upload a json file to {string}', (inputLabel: string) => {
  uploadFileTo(inputLabel, 200, jsonConfig);
});
When('I upload an invalid json file to {string}', (inputLabel: string) => {
  uploadFileTo(inputLabel, 500, {
    ...jsonConfig,
    fixture: 'empty.response.json',
  });
});

const uploadFiles = {
  pythonConfig: {
    url: 'files/upload_presigned/file',
    fixture: 'connections/logicode/files.upload_presigned.file.json',
    fileFixture: 'fixtures/python/example.py',
  },
};

When('I upload a PY file to {string}', (inputLabel: string) => {
  cy.intercept('/aws-upload-url*', {
    body: {},
  }).as('uploadToS3');
  uploadFileTo(inputLabel, 200, uploadFiles.pythonConfig);
  cy.wait('@uploadToS3');
});

const snowflakeConnections = {
  url: 'connections*_type=snowflake',
  fixture: 'connections/connections.snowflake.json',
};
const silentErrors = () => {
  cy.on('uncaught:exception', () => false);
}
Given('I want to suppress errors', silentErrors);
Given('I want to test errors', silentErrors);
