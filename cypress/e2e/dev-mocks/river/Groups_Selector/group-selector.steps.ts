import { Given, Then } from '@badeball/cypress-cucumber-preprocessor';

const editGroup = 'editGroup';
const createGroup = 'createGroup';
const deleteGroup = 'deleteGroup';

const API = '**/api/river_groups*';
const createFixture = (file: string) => ({
  statusCode: 200,
  fixture: `river_groups/${file}`,
});

const interceptApi = (method, fixture, as) => {
  cy.intercept(method, API, createFixture(fixture)).as(as);
};
Given('I want to save changes to a group', () => {
  interceptApi('PATCH', 'patch.json', editGroup);
});
Given('I want to save a new group in selector', () => {
  interceptApi('PUT', 'put.json', createGroup);
});
// Given('I want to delete a group in selector', () => {
//   interceptApi('DELETE', 'delete.json', deleteGroup);
// });

Then('default group is selected', () => {
  cy.findButton('group ultimate guitars');
});
