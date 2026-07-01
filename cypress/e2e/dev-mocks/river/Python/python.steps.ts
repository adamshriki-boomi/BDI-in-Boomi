import { Given, When } from '@badeball/cypress-cucumber-preprocessor';

Given('I want to select resources', () => {
  cy.interceptGetApi1(
    'logicode_resources',
    'python/logicode_resources.get.json',
  );
});

When('Resources have loaded', () => {
  cy.wait('@logicode_resources');
});

Given('I want to see an empty python step', () => {
  cy.interceptGetApi1('python_editor_templates', 'python/template.txt')
})

When('python templates have been downloaded', () => {
  cy.waitApi('python_templates')
})
