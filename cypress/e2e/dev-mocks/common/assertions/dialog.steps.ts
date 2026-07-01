import { Then } from "@badeball/cypress-cucumber-preprocessor";

Then('I see dialog', () => {
  cy.findAllByRole('dialog').should('be.visible');
});

Then("I don't see dialog", () => {
  cy.findByRole('dialog').should('not.exist');
});

Then('I see confirmation dialog with title {string}', (title: string) => {
  cy.findByRole('alertdialog').should('be.visible').within(() => {
    cy.findByText(title)
  });
});

Then('I see confirmation dialog with label {string}', ariaLabel => {
  cy.findByRole('alertdialog').should('be.visible').within(() => {
  cy.findByLabelText(new RegExp(`^${ariaLabel}$`, 'i')).should('exist')
  })
});

Then("I don't see confirmation dialog", () => {
  cy.findByRole('alertdialog').should('not.exist');
});

Then('I see text {string} in modal', (text: string) => {
  cy.findByRole('dialog').within(() => {
    cy.findByText(text);
  });
});

Then('I see text {string} in dialog', (text: string) => {
  cy.findByText(text).then(subject => {
    expect(subject.parentsUntil('[role=dialog]')).to.exist
  });
});

Then('I see {string} in dialog', (text: string) => {
  cy.findByText(text).should('be.visible').then(subject => {
    expect(subject.parentsUntil('[role=dialog]')).to.exist
  });
});

Then('I see text {string} in {string} dialog', (text: string, dialog: string) => {
  cy.findByRole('dialog', { name: dialog }).within(() => {
    cy.findByText(text);
  })
});

Then('I see tabs {string} within dialog', (tabsList:string) => {
  cy.findByRole('dialog').within(() => {
    cy.findByRole('tablist').then($el => {
      const text = $el.text();
      tabsList.split(',').forEach(tabName => text.includes(tabName.trim()));
    });
  })
})

Then("I don't see text {string} in dialog", (text: string) => {
  cy.findByRole('dialog').within(() => {
    cy.findByText(new RegExp(text, 'ig')).should('not.exist');
  });
});

Then('I see button {string} is disabled in dialog', (label: string) => {
  cy.findByRole('dialog').within(() => {
    cy.findButton(label).should('be.disabled');
  });
});
