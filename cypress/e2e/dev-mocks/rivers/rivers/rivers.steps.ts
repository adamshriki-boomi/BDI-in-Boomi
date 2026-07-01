import { Given, Then, When } from '@badeball/cypress-cucumber-preprocessor';

let initValue = '';

const emptyPaginatedRivers = {
  page: 1,
  page_size: 10,
  total_filtered_rivers: 0,
  total_pages: 0,
  total_rivers: 10,
  data: [],
};

const filteredRiversUrls = [
  '60cbad0f1150424c3dc810e3',
  '60cb44cd828be2001d31c9c7',
];


Given('I mock filtered rivers', () => {
  filteredRiversUrls.forEach(groupId => {
    cy.interceptApiBody(`rivers?*group_id=${groupId}*`, {
      statusCode: 200,
      body: emptyPaginatedRivers,
    }).as(groupId);
  });
});

Given('I mock filtered river type', () => {
  cy.interceptApiBody(`rivers?*river_type=logic`, {
    statusCode: 200,
    body: emptyPaginatedRivers,
  })
});

Given('I want to filter by action river', () => {
  cy.interceptApiBody(`rivers?*river_type=actions`, {
    statusCode: 200,
    body: emptyPaginatedRivers,
  })
});

Given('I search a non existing river', () => {
  cy.interceptApiBody('rivers?*', {
    body: emptyPaginatedRivers,
  });
});

When('there are no results', () => {
  cy.wait('@rivers?*');
});

When('rivers of type logic completed loading', () => {
  cy.waitApi('rivers?*river_type=logic');
});

const noRivers = {
  page: 0,
  page_size: 10,
  total_filtered_rivers: 0,
  total_pages: 0,
  total_rivers: 0,
  data: [],
};
Given('there are no rivers in my account', () => {
  cy.interceptApiBody('rivers?*', {
    body: noRivers,
  });
});

When('I click table filter {string} and select {string}', (filter, item: string) => {
  cy.clickButton(`toggle ${filter}`);
  cy.wait(500);
  cy.findByRole('dialog', { timeout: 5000 }).should('be.visible');
  cy.clickButton(item);
})

When('rivers request was sent', () => {
  cy.waitMany(['rivers?*']);
});
