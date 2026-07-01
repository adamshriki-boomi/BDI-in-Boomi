import { Step, When } from '@badeball/cypress-cucumber-preprocessor';
import { PositionType } from '../../../support/commands';
import "cypress-real-events/support";

When('I click label {string}', (query: string) =>
  cy.findByLabelText(query).click({ force: true }),
);
When('I click visible label {string}', (query: string) =>
  cy.findByLabelText(query).should('be.visible').click(),
);
When('I click text {string}', (query: string) => cy.findByText(query).click());
When('I click force text {string}', (query: string) => cy.findByText(query).click({force: true}));
When('I click cell text {string}', (query: string) => {
  cy.findAllByRole('cell').contains(query).click()
});
When('I click body', () => cy.get('body').click());

When('I click label {string} on {string}', (query: string, position: PositionType) =>
  cy.findByLabelText(query).click(position),
);

When('I click label {string} at index {int}', (query: string, index: number) => {
  cy.findAllByLabelText(query).eq(index).click();
});

When(
  'I click label {string} at index {int} on {string}',
  (query: string, index: number, position: PositionType) => {
    cy.findAllByLabelText(query).eq(index).click(position);
  },
);

When('I see tab {string}', (text: string) => {
  cy.findAllByRole('tab').contains(text).should('be.visible');
});

When('I select tab {string}', (text: string) => {
  cy.findAllByRole('tab').contains(text).click();
});

When('I click button {string}', (label: string) => {
  cy.clickButton(label);
});

When('I click force button {string}', (label: string) => {
  cy.findByRole('button', { name: label }).click({ force: true });
});

When('I click button {string} in place {int}', (label: string, place: number) => {
  cy.findAllByRole('button', { name: new RegExp(label, 'ig') })
    .eq(place - 1)
    .click();
});

When('I select option {string} of {string}', (radio, radioGroup: string) => {
  cy.selectRadio(new RegExp(radioGroup, 'gi'), radio, { timeout: 500 });
  cy.wait(200);
});

When('I check {string}', (checkbox: string) => {
  cy.checkCheckbox(checkbox);
});

When('I uncheck {string}', (checkbox: string) => {
  cy.uncheckCheckbox(checkbox);
});

When('I switch {string}', (switchLabel: string) => {
  cy.checkCheckbox(switchLabel);
  // WHY? because the switch animates
  cy.wait(200);
});
When('I toggle switch with label {string}', (switchLabel: string) => {
  cy.toggleSwitch(switchLabel);
  // WHY? because the switch animates
  cy.wait(200);
});

When('I switch invisible label {string}', (switchLabel: string) => {
  cy.toggleRealSwitch(switchLabel);
  // WHY? because the switch animates
  cy.wait(200);
});

When('I open select {string}', (list: string) => {
  cy.listboxOpen(list);
});

When('I select item {string} in list {string}', (option: string, list: string) => {
  cy.listbox(list, option);
});

When(
  'I select item {string} in list {string} at index {int}',
  (option: string, list: string, listPosition: number) => {
    cy.listbox(list, option, undefined, listPosition);
  },
);

When(
  'I select item {string} in list {string} on {string}',
  (option: string, list: string, position: PositionType) => {
    cy.listbox(list, option, position);
  },
);

When(
  'I click {string} at index {int} inside {string}',
  (item, index: number, container) => {
    cy.findByLabelText(RegExp(`^${container}$`, 'i')).within(() =>
      cy
        .findAllByLabelText(RegExp(`^${item}$`, 'i'))
        .eq(index)
        .click(),
    );
  },
);

When('I click {string} inside {string}', (item, container) => {
  cy.findByLabelText(RegExp(`^${container}$`, 'i')).within(() =>
    cy.findByLabelText(RegExp(`^${item}$`, 'i')).click(),
  );
});

When('I sign in as a fake user', () => {
  cy.signInFake();
  cy.wait(['@postLogin', '@token*', '@getEnvironments']);
});

When('I click sidebar {string}', (item: string) => {
  cy.sidebar(item);
});

When('I see disabled sidebar item {string}', (item: string) => {
  cy.disabledSidebar(item);
});

When('I hover button {string}', (button: string) => {
  cy.findButton(button).realHover();
});

When('I hover text {string}', (text: string) => {
  cy.findByText(text).realHover();
});

When('I type {string} to {string}', (text: string, label: string) => {
  cy.findByLabelText(label).wait(0).focus().type(text);
});

// why { force: true } ? https://github.com/cypress-io/cypress/issues/3817
When('I type {string} to label {string}', (text: string, label: string) => {
  cy.findByLabelText(label).wait(0).focus().type(text, { force: true });
});

When('I write {string} to {string}', (text: string, label: string) => {
  cy.findByLabelText(label).wait(0).focus().type(text);
});

When('I type {string} to {string} at {int}', (text: string, label: string, index: number) => {
  cy.findAllByLabelText(label)
    .eq(index)
    .should('be.visible')
    .type(text, { force: true });
});

When('I click link {string}', (link: string) => {
  cy.clickLink(link);
});

When('I click link with aria-label {string}', (label: string) => {
  cy.get(`[role=link][aria-label='${label}']`).click();
});


When('I force click link {string}', (link: string) => {
  cy.forceClickLink(link);
});

When('I click {string}', (text: string) => {
  cy.findByText(text).click();
});

When('I click {string} menu item in {string} menu', (item: string, menu: string) => {
  Step(this, `I see button "${menu}"`)
  Step(this, `I click button "${menu}"`)
  cy.findByRole('menuitem', { name: item }).click()
});

// for RiveryDropdown
When('I click menu {string} and select {string}', (text: string, item: string) => {
  cy.findByLabelText(text, { expanded: false } as any).should('be.visible').click()
  cy.wait(300);
  cy.findByLabelText(text, { expanded: true } as any).should('be.visible');
  cy.findByRole('menuitem', { name: item, hidden: false } as any).should('be.visible').click()
});

When('I click menu button {string}', (text: string) =>
  cy.findByRole('menuitem', { name: text, hidden: false }).should('be.visible').click()
);

When('I see menu {string} item {string} is disabled', (menu: string, item: string) => {
  cy.findByLabelText(menu).click({force:true}).wait(500);
  cy.findByText(item).should('have.css', 'pointer-events');
});

When('I clear {string}', (label: string) => {
  cy.findByLabelText(label).type(`{selectall}{backspace}`, {
    scrollBehavior: false,
  });
});

When('I clear type {string} to {string}', (text: string, label: string) => {
  cy.findByLabelText(label).should('be.visible').type(`{selectall}${text}`, {
    scrollBehavior: false,
  });
});

When('I blur active input', () => cy.focused().blur().wait(500));

When('I debug button {string}', (name: string) => {
  cy.findButton(name).debug();
});

When('I debug element {string}', (name: string) => {
  cy.log('BEFORE');
  cy.get(`[role=checkbox][aria-labelledby='${name}'][aria-checked=false]`).as(
    'switcher',
  );
  // cy.wait('@switcher');
  cy.get('@switcher').within(res => {
    cy.log('BEFORE scroll', res.length.toString());
    return res;
  });

  cy.get('@switcher')
    .scrollIntoView()
    .within(res => {
      cy.log('AFTER', res.length.toString());
    });
});

When('I reload the page', () => {
  cy.reload(true);
});

When('I select account', () => {
  cy.selectAdminAccount();
});

When('I click collapse {string} of {string}', (header, stepName) =>
  cy.collapse(header, `${stepName}`),
);


When('I click Account Environment on sidebar', () => {
  cy.clickAccountEnvSidebarItem();
})
When('I switch Environment to {string}', (envName: string) => {
  cy.clickAccountEnvSidebarItem();
  cy.findButton(envName).should('be.visible').click();
  cy.waitEnvironments();
});

When('I click {string} in sidebar', (text: string) => {
  cy.findByLabelText('sidebar').within(() => {
    cy.findByText(text).should('be.visible').click();
  })
})
When('I click submit inside form {string}', (form: string) => {
  cy.findByRole('form', { name: form }).submit();
});

When('I see tooltip {string} for label {string}', (tooltip: string, label: string) => {
  cy.findByLabelText(label).should('exist').trigger('mouseover').wait(1000);
  cy.findByText(tooltip).should('be.visible')
});

When('I force click menu {string} and select {string}', (text: string, item: string) => {
  cy.findByLabelText(text, { expanded: false } as any).should('be.visible').click()
  cy.wait(300);
  cy.findByRole('menuitem', { name: item, hidden: false } as any).click({force: true})
});
