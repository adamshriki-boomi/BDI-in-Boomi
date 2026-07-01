import { Given, When } from '@badeball/cypress-cucumber-preprocessor';
import { modifyRiver } from '../river-footer.steps';

export const riverUrls = {
  modify: modifyRiver,
};
Given('I want to save Simple River', () => {
  cy.interceptApi(riverUrls.modify, 'rivers-list/simple-river.json');
});

export const enviromentUrls = {
  add_variable: 'environments/add_variable*',
};
Given('I want to create an environment variable', () => {
  cy.interceptApi(
    enviromentUrls.add_variable,
    'environments/add_variable.POST.json',
  );
});

When('dataframe is completed', () => {
  cy.wait('@dataframe');
});
