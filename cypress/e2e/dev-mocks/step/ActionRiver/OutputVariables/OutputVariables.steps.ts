import { Given, When } from '@badeball/cypress-cucumber-preprocessor';

let pendingRoutes = [];

function mockData(withInputVars = false) {
  cy.interceptPostApi('rivers/list*', 'action-rivers.list.json');
  cy.interceptPostApi(
    'actions/list*',
    `action-river-variables-${withInputVars ? 'with' : 'without'}-inputs.json`,
  );
  cy.interceptApi('connections*', 'custom-connections.json');
}

Given('I will select an action river with inputs', () => {
  mockData(true);
  pendingRoutes = ['@rivers/list*', '@actions/list*', '@connections*'];
});

When('I wait for action river data', () => {
  pendingRoutes.map(route => cy.wait(route));
});
