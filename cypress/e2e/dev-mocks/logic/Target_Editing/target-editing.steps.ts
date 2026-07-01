import { Given, Then, When } from '@badeball/cypress-cucumber-preprocessor';

const DATAFRAMES_POST = '**/dataframes';
When('I clear variable name in {string}', stepName => {
  cy.get('[aria-label="Variable Name-clear-indicator"]').click({
    multiple: true,
    force: true,
  });
});

Given('I add new dataframe', () => {
  cy.interceptPostApi1(DATAFRAMES_POST, 'dataframes/new.json');
});

Given('I want to add new dataframe to the list', () => {
  cy.interceptDataframesGet(
    'list.new.json',
  );
});

When('new dataframe is ready', () => {
  cy.wait('@dataframes');
});
When('I select {string} in DataFrame', (optionName: string) => {
  cy.listbox('DataFrame', optionName);
});

Then('I see the new data frame has been added', () => {
  cy.waitApi(DATAFRAMES_POST)
  cy.waitDataframesGet();
});

Then('I see text my-new-dataframe', () => {
  cy.findAllByText(new RegExp('my-new-dataframe', 'ig')).should('exist');
});

Then('I click outside to let the input render the value', () => {
  cy.get('[aria-label="Target Type DataFrame"]').click();
});
