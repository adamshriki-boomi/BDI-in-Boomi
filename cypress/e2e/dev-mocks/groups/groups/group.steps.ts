import { Given, Then, When } from '@badeball/cypress-cucumber-preprocessor';

const editGroup = 'editGroup';
const createGroup = 'createGroup';
const deleteGroup = 'deleteGroup';
const getGroups = 'getGroups';

const API = 'river_groups*';
const createFixture = (file: string) => ({
  statusCode: 200,
  fixture: `groups/${file}`,
});

Given('I want to save changes to group', () => {
  cy.interceptPatchApiAs(API, 'groups/patch.json', editGroup);
  cy.interceptGetApiAs(API, 'groups/updated.json', getGroups);
});

Given('I want to save a new group', () => {
  cy.interceptPutApiAs(API, 'groups/put.json', createGroup);
});

Given('I want to delete a group', () => {
  cy.interceptDeleteApiAs(API, 'groups/delete.json', deleteGroup);
  cy.interceptGetApiAs(API, 'groups/get.json');
});

const actions = {
  refreshed: [getGroups],
  saved: [editGroup],
  created: [createGroup],
  removed: [deleteGroup],
};

Then('group is {string} successfully', (action: string) => {
  actions[action].map(action => cy.wait(`@${action}`));
});

When('I wait for groups', () => {
  cy.wait('@river_groups*');
});
