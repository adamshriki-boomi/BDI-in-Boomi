import { Given, Then, When } from '@badeball/cypress-cucumber-preprocessor';
import { assertContent } from '../../common/utils/logic';

let pendingRoutes = [];

function mockData(withoutAutoMapping = false) {
  cy.interceptPutApi('mapping', 'step-mapping-put.json');
  cy.interceptPostApiAs(
    'mapping',
    `step-mapping-post${withoutAutoMapping ? '-fail' : ''}.json`,
    'mapping-post',
  );
}

Given('I will select a river with auto mapping', () => {
  mockData();
  pendingRoutes = ['@mapping', '@mapping-post'];
});

Given('I will select a river without auto mapping', () => {
  mockData(true);
  pendingRoutes = ['@mapping', '@mapping-post'];
});

When('I wait for mapping data', () => {
  pendingRoutes.map(route => cy.wait(route));
});

Given('I want to set variables in column mapper', () => {
  cy.interceptApi('rivers/modify', 'rivers-list.edit-simple-river.json');
});
Then('river is saved with selected partitions', () => {
  cy.wait('@rivers/modify').then(({ request }) => {
    assertContent(
      request,
      {
        partition_granularity: 'DAY',
        partition_type: 'TIMESTAMP',
      },
      [0, 0],
    );
  });
});
Then('river is saved with selected bucket and partition', () => {
  cy.wait('@rivers/modify').then(({ request }) => {
    assertContent(
      request,
      {
        buckets_number: 23,
        partition_granularity: 'DAY',
        partition_type: 'TIMESTAMP',
      },
      [0, 0],
    );
  });
});
