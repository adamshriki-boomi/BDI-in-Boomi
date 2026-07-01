export * as rtl from '@testing-library/cypress/add-commands';
declare global {
  namespace Cypress {
    interface Chainable {
    seeCreateRiverButton: typeof seeCreateRiverButton;
    collapse: typeof api.collapse;
    findStep: typeof api.findStep;
    findEditor: typeof api.findEditor;
    clickAccountEnvSidebarItem: typeof api.clickAccountEnvSidebarItem;
    clickChangeAccount: typeof api.clickChangeAccount;
    }
  }
}
const Durations = {
  COLLAPSE: 500,
};
const seeCreateRiverButton = () => cy.findButton(/New Data Flow/i);
Cypress.Commands.add('seeCreateRiverButton', seeCreateRiverButton);

const api = {
  collapse: (header, stepName) => {
    cy.clickButton(`collapse ${header} ${stepName}`).wait(Durations.COLLAPSE);
  },
  findStep: (name: string | RegExp, options = {}) => {
    return cy.findByLabelText(`${name} content`, options);
  },
  findEditor: () => {
    return cy.findByRole('code', { timeout: 5000 });
  },
  clickAccountEnvSidebarItem: () => {
    return cy.findByLabelText('environment account selector').click();
  },
  clickChangeAccount: () => {
    cy.clickAccountEnvSidebarItem()
    return cy.findByLabelText('change account').click();
  }
};
Object.entries(api).forEach(([name, func]) => Cypress.Commands.add(name as any, func));
