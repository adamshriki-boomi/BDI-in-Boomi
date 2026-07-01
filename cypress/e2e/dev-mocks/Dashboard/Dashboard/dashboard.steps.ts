import { Given, When } from '@badeball/cypress-cucumber-preprocessor';

const SOURCES_LIST = '**/sources_list';
const HAS_RIVERS = '**/has_rivers*';
const ACTIVITIES = '**/activities?*';
const ACTIVITIES_GRAPH = '**/activities_graph';

Given('I want to see the dashboard', () => {
  cy.clock(new Date('2024-01-15').getTime(), ['Date']);
  cy.intercept('POST', '**/dashboard', (req) => {
    const { metric = 'executions', view = 'general', sources, start_time, end_time } = req.body;
    const source = sources?.length === 1 ? `.${sources[0]}` : '';
    const span = (end_time - start_time) / 86400000;
    const range = span > 14 ? '.30d' : span < 7 ? '.custom' : '';
    const fixturePath = `dashboard/dashboard.${view}.${metric}${source}${range}.json`;
    req.reply({ fixture: fixturePath });
  }).as('dashboard');
  cy.interceptGetApi1(SOURCES_LIST, 'dashboard/sources_list.json');
  cy.interceptGetApi1(HAS_RIVERS, 'dashboard/has_rivers.json');
  cy.interceptGetApi1(ACTIVITIES, 'dashboard/activities.json');
  cy.interceptPostApi1(ACTIVITIES_GRAPH, 'dashboard/activities_graph.json');
});

When('I pick custom date range from day {string} to day {string}', (startDay: string, endDay: string) => {
  cy.listbox('date picker', 'Custom');
  cy.get('.rmdp-day-picker').should('be.visible');
  cy.get('.rmdp-day-picker > div').first()
    .find('.rmdp-day:not(.rmdp-deactive)')
    .contains(new RegExp(`^${startDay}$`))
    .click();
  cy.get('.rmdp-day-picker > div').first()
    .find('.rmdp-day:not(.rmdp-deactive)')
    .contains(new RegExp(`^${endDay}$`))
    .click();
  cy.findByText('Apply').click();
});

When('I switch to source view', () => {
  cy.get('[aria-label="source-view-toggle"]').realClick();
});

When('I switch to general view', () => {
  cy.get('[aria-label="general-view-toggle"]').realClick();
});
