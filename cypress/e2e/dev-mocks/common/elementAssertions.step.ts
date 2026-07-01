import { Then, When } from '@badeball/cypress-cucumber-preprocessor';
import { findLabelsInDataTables } from './utils';

Then('I see element {string}', (query: string) => {
  cy.get(query).should('exist');
});

Then('I see text {string}', (text: string) => {
  cy.findByText(new RegExp(text, 'i')).should('exist');
});

Then('I see {string}', (text: string) => {
  cy.findByText(new RegExp(text, 'i')).should('be.visible');
});

Then('I see {string} exact', (text: string) => {
  cy.findByText(text).should('be.visible');
});

Then('I see text {string} is visible', (text: string) => {
  cy.findByText(text).should('exist');
});

Then('I see {string} is visible', (text: string) => {
  cy.findByText(text).should('be.visible');
});

Then('I see heading {string}', (text: string) => {
  cy.findByRole('heading', { name: new RegExp(text, 'i') }).should('exist');
});

Then('I see text {string} within {string}', (text: string, parent: string) => {
  cy.findByLabelText(parent).within(() => {
    cy.findByText(new RegExp(text, 'i')).should('exist');
  });
});

Then('I see exact text {string}', (text: string) => {
  cy.findByText(new RegExp('^' + text + '$', 'i')).should('exist');
});

Then('I see text {string} within {string} widget', (text: string, widgetLabel: string) => {
  cy.findByRole('widget', { name: widgetLabel }).within(() => {
    cy.findByText(text).should('exist');
  });
});

Then('I see texts {string} in dialog', (text: string) => {
  findAllTexts(text).then(subject => {
    expect(subject.parentsUntil('[role=dialog]')).to.exist
  });
});

const findAllTexts = (text: string, assertion = 'exist', flags = 'i') => {
  return cy.get('body').findAllByText(new RegExp(text, flags)).should(assertion);
};
const findAllLabels = (text: string) => {
  return cy.findAllByText(new RegExp(text, 'i')).should('exist');
};
Then('I see texts {string} are visible', (text: string) => {
  findAllTexts(text, 'be.visible');
});
Then('I see texts {string}', (text: string) => {
  findAllTexts(text, 'be.visible');
});

Then('I see few {string} inside {string}', (text: string, container: string) => {
  cy.findByLabelText(container).within(() =>
    cy.findAllByText(new RegExp(`^${text}$`, 'i')).should('exist'),
  );
});

Then('I see texts {string} {int} times', (text: string, total) => {
  findAllTexts(text, 'be.visible').should('have.length', total);
});

Then("I don't see text {string}", (text: string) => {
  cy.findByText(new RegExp(text, 'i')).should('not.exist');
});

Then("I don't see {string}", (text: string) => {
  cy.get(text).should('not.exist');
});

Then("I don't see text {string} within {string}", (text: string, parent: string) => {
  cy.findByLabelText(parent).within(() => {
    cy.findByText(new RegExp(text, 'i')).should('not.exist');
  });
});

Then('I see role {string}', (role: string) => {
  cy.findByRole(new RegExp(role, 'i') as any).should('exist');
});

Then('I see label {string}', ariaLabel => {
  cy.findByLabelText(new RegExp(`^${ariaLabel}$`, 'i')).should('exist');
});
Then('I see label {string} is visible', ariaLabel => {
  cy.findByLabelText(new RegExp(`^${ariaLabel}$`, 'i')).should('be.visible');
});
Then('I see labels {string} {int} times', (label: string, total) => {
  findAllLabels(label).should('have.length', total);
});

Then('I see labels:', findLabelsInDataTables('be.visible'));
Then('I see not exact labels:', findLabelsInDataTables('exist'));

Then("I don't see label {string}", ariaLabel => {
  cy.findByLabelText(new RegExp(`^${ariaLabel}$`, 'i')).should('not.exist');
});

Then("I don't see labels:", findLabelsInDataTables('not.exist'));

Then('I see placeholder {string}', placeholder => {
  cy.findByPlaceholderText(new RegExp(`^${placeholder}$`, 'i')).should('exist');
});

Then("I don't see placeholder {string}", placeholder => {
  cy.findByPlaceholderText(new RegExp(`^${placeholder}$`, 'i')).should(
    'not.exist',
  );
});

Then('I see hidden input with value {string}', (value: string) => {
  cy.findByDisplayValue(new RegExp(value, 'i')).should('exist').should('not.visible');
});

Then('I see input with value {string}', (value: string) => {
  cy.findByDisplayValue(new RegExp(value, 'i')).should('exist');
});

Then('I see input {string} with value {string}', (label: string, value: string) => {
  cy.findByLabelText(label).should('have.value', value);
});


Then('I see input {string} with multi value {string}', (label: string, value: string) => {
  cy.get('.select-form-group__multi-value')
  .should('contain.text', value);
});

Then('I scroll to element {string}', (label: string) => {
  cy.get(`[data-cy="${label}"]`).scrollIntoView()
})


Then('I see labelled {string} with value {string}', (label: string, value: string) => {
  cy.findByLabelText(label).should('have.text', value);
});

Then('I see input {string} without value {string}', (label: string, value: string) => {
  cy.findByLabelText(label).should('not.have.value', value);
});

Then('I see input {string} with placeholder {string}', (label: string, value: string) => {
  cy.findByLabelText(label).invoke('attr', 'placeholder').should('eq', value);
});

Then('I see input with placeholder {string}', (value: string) => {
  cy.findByPlaceholderText(value).should('be.visible');
});

Then('I see radio input with label {string} is checked', (label:string) => {
  cy.get(`[aria-label="${label}"`).should('have.attr', 'data-checked');
})

Then('I see step content {string}', stepName => {
  cy.get(`[aria-label="${stepName} content"]`).should('exist');
});

Then('I see button {string}', (label: string) => {
  cy.findButton(label);
});

// Temporary solution, need to think of a better one
Then('I click radio option number {string}', (optionNumber: string) => {
  cy.get(`:nth-child(${optionNumber}) > .chakra-radio > .chakra-radio__label`).click()
})

Then('I see buttons {string}', (label: string) => {
  const buttons = label.split(',');
  cy.wrap(buttons).each((button: string) => {
    cy.findButton(button.trim()).should('be.visible');
  })
});

Then('I see button {string} within {string}', (label: string, parent: string) => {
  cy.findByLabelText(parent).within(() => {
    cy.findButton(label);
  });
});

Then('I see button {string} is visible', (label: string) => {
  cy.findButton(label).should('be.visible');
});
Then('I see button {string} in place {int}', (label: string, place: number) => {
  cy.findAllByRole('button', { name: label }).eq(place - 1);
});

Then('I see iframe {string}', (label: string) => {
  cy.get(`iframe[aria-label="${label}"]`).should('exist');
});

Then('I see iframe with id {string}', id => {
  cy.get(`iframe[id="${id}"]`).should('exist');
});

Then("I don't see iframe {string}", (label: string) => {
  cy.get(`iframe[aria-label="${label}"]`).should('not.exist');
});

Then('I see button {string} is disabled', (label: string) => {
  cy.findButton(label).should('be.disabled');
});

Then('I see dropdown indicator {string} is disabled', (label:string) => {
  cy.get("select-form-group__indicator").within(() => {
    cy.findButton(label).should('be.disabled');
  })
})

 Then('I see input {string} is disabled', (label: string) => {
  cy.findByLabelText(label).should('be.disabled');
});

Then('I see tab is disabled', (label: string) => {
  cy.findByRole('tab').should('be.disabled');
});


Then('I see input {string} is enabled', (label: string) => {
  cy.findByLabelText(label).should('be.enabled');
});

Then('I see button {string} is enabled', (label: string) => {
  cy.findButton(label).should('not.be.disabled');
});

Then("I don't see button {string}", (label: string) => {
  cy.findButton(label).should('not.exist');
});

Then('I see checkbox {string} is checked', (label: string) => {
  cy.findCheckedCheckbox(label);
});

Then('I see checkbox with label {string} is checked', (name: string) => {
  cy
    .get('label[role="checkbox"][data-checked]').contains(`${name}`)
});

Then('I see checkbox {string} is unchecked', (label: string) => {
  cy.findUncheckedCheckbox(label);
});

Then('I see switch {string} is on', (label: string) => {
  cy.findCheckedCheckbox(label);
});

Then('I see switch {string} is off', (label: string) => {
  cy.findUncheckedCheckbox(label);
});

Then('I see link {string}', (link: string) => {
  cy.findLink(link);
});

Then('I see {string} inside {string}', (item: string, container: string) => {
  cy.findByLabelText(container).within(() =>
    // cy.findByLabelText(item).should('exist'),
    cy.findByText(new RegExp(`^${item}$`, 'i')).should('exist'),
  );
});

Then('I see label {string} inside {string}', (item: string, container: string) => {
  cy.findByLabelText(container).within(() => {
    cy.findByLabelText(item).should('exist');
  });
});

Then("I don't see {string} inside {string}", (item: string, container: string) => {
  cy.findByLabelText(container).within(() =>
    // cy.findByLabelText(item).should('not.exist'),
    cy.findByText(new RegExp(`^${item}$`, 'i')).should('not.exist'),
  );
});

Then('I see {string} {int} times inside {string}', (item: string, total, container: string) => {
  cy.findByLabelText(container).within(() =>
    cy
      .findAllByText(new RegExp(`^${item}$`, 'i'))
      .should('have.length', total)
      .should('exist'),
  );
});

When('I type {string} inside {string}', (text: string, container: string) => {
  cy.findByLabelText(container).wait(0).type(text);
});

When('I force type {string} inside {string}', (text: string, container: string) => {
  cy.findByLabelText(container).wait(0).type(text, {force: true});
});

When('I type {string} in select {string}', (text: string, name: string) => {
  cy.findByRole('listbox', { name }).type(text);
});

When('I clear input {string}', (label: string) => {
  cy.findByLabelText(label).type(`{selectall}{backspace}`);
});

Then('I see title {string} inside {string}', (title: string, label: string) => {
  cy.findByLabelText(label).within(() => {
    cy.findByTitle(title).should('exist');
  });
});

Then("I don't see title {string} inside {string}", (title: string, label: string) => {
  cy.findByLabelText(label).within(() => {
    cy.findByTitle(title).should('not.exist');
  });
});

Then('I see placeholder {string} in list {string}', (placeholder: string, name: string) => {
  cy.findByRole('listbox', { name })
    .find('.select-form-group__placeholder')
    .should('have.text', placeholder);
});

Then('I see list {string} has no selection', (name: string) => {
  cy.findByRole('listbox', { name })
    .find('.select-form-group__placeholder')
    .should('exist');
});

Then('I see list {string} has selection', (name: string) => {
  cy.findByRole('listbox', { name })
    .find('.select-form-group__placeholder')
    .should('not.exist');
});

Then('I see item {string} selected in list {string}', (item: string, name: string) => {
  cy.findByRole('listbox', { name })
    .find('.select-form-group__single-value')
    .should('have.text', item);
});

Then('I see value {string} is selected in list {string}', (item: string, name: string) => {
  cy.findByRole('listbox', { name })
    .find('.select-form-group__value-container')
    .should('have.text', item);
});

Then('I see default value {string} selected in list {string}', (item: string, name: string) => {
  cy.findByRole('listbox', { name })
    .find('.select-form-group__input-container')
    .should('have.attr', 'data-value', item);
});

Then('I don"t see default value {string} selected in list {string}', (item: string, name: string) => {
  cy.findByRole('listbox', { name })
    .find('.select-form-group__input-container')
    .should('not.have.attr', 'data-value', item);
});


Then('I see option {string} of {string} is selected', (radio: string, radioGroup: string) => {
  cy.findByRole('radiogroup', {
    name: new RegExp(radioGroup, 'gi'),
    timeout: 500,
  }).within(() => {
    cy.findByText(radio).should('have.data', 'checked');
  });
});


Then('I see tab {string} is selected', (text: string) => {
  cy.findAllByRole('tab')
    .contains(text)
    .filter('[aria-selected="true"]')
    .should('exist');
});

Then('I see tab {string} is not selected', (text: string) => {
  cy.findAllByRole('tab')
    .contains(text)
    .filter('[aria-selected="true"]')
    .should('not.exist');
});

Then('I see option {string} of {string} is unselected', (radio: string, radioGroup: string) => {
  cy.findByRole('radiogroup', {
    name: new RegExp(radioGroup, 'gi'),
    timeout: 500,
  }).within(() => {
    cy.findByText(radio).should('not.have.data', 'checked');
  });
});

Then('I see in url {string}', (path: string) => {
  cy.seeInUrl(path);
});

Then("I don't see in url {string}", (path: string) => {
  cy.dontSeeInUrl(path);
});

const getToast = () => {
  return cy.get("*[role=status][aria-atomic=true]");
}
Then('I see toast with {string}', (text: string) => {
  getToast().first().should('be.visible').within(() => {
    cy.contains(text);
  })
});

Then('I see toast', () => {
  getToast().should('be.visible');
});

Then('I see alert with {string}', (text: string) => {
  cy.findByRole('alert').should('be.visible').contains(text)
});

Then('I see sign in page', () => {
  cy.findAllByText('Log In');
});

Then(
  'I see data attribute {string} with value {string}',
  (attribute, value: string) => {
    cy.findDataAttribute('', attribute, value);
  },
);

Then('I see tracking {string} with value {string}', (attribute, value: string) => {
  cy.findDataAttribute('pendo-id', attribute, value);
});

Then(
  "I don't see data attribute {string} with value {string}",
  (attribute, value: string) => {
    cy.findDataAttribute('', attribute, value, true);
  },
);

Then(
  "I don't see tracking {string} with value {string}",
  (attribute, value: string) => {
    cy.findDataAttribute('pendo-id', attribute, value, true);
  },
);

Then(
  'I see data attribute {string} with value {string} inside {string}',
  (attribute, value: string, container: string) => {
    cy.findByLabelText(container).within(() =>
      cy.findDataAttribute('', attribute, value),
    );
  },
);

Then(
  'I see tracking {string} with value {string} inside {string}',
  (attribute, value: string, container: string) => {
    cy.findByLabelText(container).within(() =>
      cy.findDataAttribute('pendo-id', attribute, value),
    );
  },
);

Then(
  "I don't see data attribute {string} with value {string} inside {string}",
  (attribute, value: string, container: string) => {
    cy.findByLabelText(container).within(() =>
      cy.findDataAttribute('', attribute, value, true),
    );
  },
);

Then(
  "I don't see tracking {string} with value {string} inside {string}",
  (attribute, value: string, container: string) => {
    cy.findByLabelText(container).within(() =>
      cy.findDataAttribute('pendo-id', attribute, value, true),
    );
  },
);

Then('I see tabs {string}', (tabsList: string) => {
  cy.findByRole('tablist').then($el => {
    const text = $el.text();
    tabsList.split(',').forEach(tabName => text.includes(tabName.trim()));
  });
});

Then('I see bar charts {string}', (label: string) => {
  cy.findAllByLabelText(label).first().within(() => {
    cy.findAllByRole('figure').should('be.visible')
  });
});

const assertTextInTable = (text: string, exist = true) => {
  const assertion = exist ? 'exist' : 'not.exist';
  return cy.findByRole('table').should('be.visible').within(() => {
    cy.findByText(text).should(assertion);
  });
}
Then('I see text {string} in table', (text: string) => {
  assertTextInTable(text);
});



Then("I don't see text {string} in table", assertTextInTable);

Then('I see select with {string}', (value: string) => {
  cy.findByDisplayValue(value).should('be.visible');
});

Then('I see select {string} with {string}', (select: string, value: string) => {
  cy.findByLabelText(select).should('be.visible').within(() => {
    cy.findByDisplayValue(value).should('be.visible');
  })
});

Then("I don't see river with name {string}", (riverName: string) => {
  cy.get('[role="table"]').then($table => {
    const tableText = $table.text();
    const containsRiver = tableText.includes(riverName);

    if (containsRiver) {
      throw new Error(`Found river "${riverName}" in the table when it should not exist`);
    }

    expect(containsRiver).to.be.false;
  });
});

Then("I see river with name {string}", (riverName: string) => {
  // Directly check for a cell containing the river name
  cy.get('[role="table"] [role="row"] [role="cell"]:first-child')
    .contains(riverName)
    .should('exist');
});
