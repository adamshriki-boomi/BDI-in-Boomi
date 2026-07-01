import { Given } from "@badeball/cypress-cucumber-preprocessor";

const environmentsUpdateVariable = 'environments/update_variable*';
const environmentsBulkUpdateVariable = 'environments/variables'
const environmentsFetchUpdated = 'environments'

Given('I want to save update a variable', () => {
  cy.interceptPatchApi(environmentsUpdateVariable, 'environments/update_variable.PATCH.json');
});

Given('I want to update a variable in dedicated drawer', () => {
  cy.interceptPutApi(environmentsBulkUpdateVariable, 'environments/update_variable.PUT.json')
})

Given('I want to see my updated variable', () => {
  cy.interceptGetApi(environmentsFetchUpdated, 'environments/updated_variable.json')
})