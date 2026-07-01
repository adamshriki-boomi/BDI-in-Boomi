import { Given, When } from '@badeball/cypress-cucumber-preprocessor';

const TOTALS = '*totals*';
const DELETE = 'environments/delete_variable*';
const ADD = 'environments/variables*';

When('I wait for dialog to load', () => {
  cy.wait(1500);
});

Given('I want to delete an environment', () => {
  cy.interceptGetApi1(
    '*/totals',
    'environments/environments.totals.v1.json',
    200,
    'getTotals',
  );
});

Given('I want to delete a variable', () => {
  cy.interceptDeleteApi(DELETE, 'environments/variable.delete.json');
  cy.interceptGetApi(
    'environments*',
    'environments/environments.deleted-variable.get.json',
  );
});

Given('I want to add a new variable', () => {
  cy.interceptPutApi(ADD, 'environments/variable.add.json');
});

Given('I want to see my deployments and activities', () => {
  cy.interceptGetApi1(TOTALS, 'environments/environments.totals.v1.json');
  cy.interceptGetApi('package/list*', 'environments/packages.get.json');
  cy.interceptGetApi('package*', 'environments/single.package.get.json');
  cy.interceptGetApi('deployment/activities*', 'environments/activities.json');
  cy.interceptGetApi('package/default_settings*', 'environments/settings.json');
  cy.interceptGetApi(
    'package/entities?entity_type=rivers*',
    'environments/entities.rivers.json',
  );
  cy.interceptGetApi(
    'package/entities?entity_type=river_groups*',
    'environments/entities.groups.json',
  );
  cy.interceptGetApi(
    'package/entities?entity_type=variables*',
    'environments/entities.variables.json',
  );
  cy.interceptGetApi(
    'deployment/activities/package*',
    'environments/activities.json',
  );
  cy.interceptPutApi('package/modify', 'environments/modify.json');
  cy.interceptPutApi('deployment/prepare', 'environments/prepare.json');
  cy.interceptGetApi('pull', 'environments/pull.json');
});

When('I wait for source environment to be selected', () => {
  cy.waitApi(TOTALS);
  cy.findByRole('dialog').within(() => {
    cy.findByText('Default');
  });
});

When('adding variable has completed', () => {
  cy.waitApi(ADD);
})

When('list has completed loading', () => {
  cy.waitApi(TOTALS);
  cy.waitApi('package/entities?entity_type=rivers*');
})