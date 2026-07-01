import { Given, Then } from '@badeball/cypress-cucumber-preprocessor';

Given('I want to verify step data is saved properly', () => {
  cy.interceptApi('rivers/modify', 'rivers-list/simple-river.json');
});

Then('I see data I added has been saved properly', () => {
  cy.wait('@rivers/modify').then(({ request }) => {
    const content =
      request.body.tasks_definitions[0].task_config.logic_steps[0].content;
    Object.entries({
      target_table: 'RiseUp',
      drop_after: true,
      target_loading: 'merge',
    }).forEach(([key, value]) => expect(content).to.have.property(key, value));
  });
});

Then('river is saved without fzConnection', () => {
  cy.wait('@rivers/modify').then(({ request }) => {
    const content =
      request.body.tasks_definitions[0].task_config.logic_steps[0].nodes[0].content?.fzConnection;
   expect(content).to.not.have.property("$oid");
  });
});
