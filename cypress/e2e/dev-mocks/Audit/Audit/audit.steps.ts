import { Given, When } from '@badeball/cypress-cucumber-preprocessor';

const API = 'audit_events*';
const USERS = 'users_management*';

Given('I want to get audit logs', () => {
  cy.interceptGetApiAs(USERS, 'audit/users.json', 'users', 200);
  cy.interceptGetApi1(API, 'audit/audit_full_response.json');
});

When('I see all event types inside {string}', (list: string) => {
  cy.findByLabelText(list).within(() => {
    ['updated', 'created', 'deleted'].forEach(event => cy.contains(event));
  });
});

When('I see all entity types inside {string}', (list: string) => {
  cy.findByLabelText(list).within(() => {
    ['river', 'user', 'connection'].forEach(entity => cy.contains(entity));
  });
});

When('I filter only {string} from {string}', (option: string, list: string) => {
  cy.interceptGetApi1(API, `audit/audit_filter_${option}.json`);
  cy.listbox(list, option);
});

When('I want to clear filters', () => {
  cy.interceptGetApi1(API, 'audit/audit_full_response.json');
});
