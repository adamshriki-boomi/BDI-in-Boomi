import { Then, When } from '@badeball/cypress-cucumber-preprocessor';

/**
 * River Logic DSL Actions
 * a higher level of river logic specific actions
 * the purpose is make river logic actions DRY
 */
When('I edit {string} description', riverName => {
  cy.listbox(`river ${riverName} actions`, 'Description');
});
When('I double click on Step Title {string}', (stepName: string) => {
  cy.findByText(stepName).dblclick();
  cy.get('body').click();
});
// Step type
When('I select Step Type {string} of {string}', (stepType: string, stepName) => {
  try {
    cy.wait(200);
    cy.listbox(`block-type-${stepName}`, stepType);
  } catch (e) {
    cy.wait(200);
    cy.listbox(`block-type-${stepName}`, stepType);
  }
});

When('I delete Step {string}', stepName => {
  cy.clickButton(`step ${stepName} actions`);
  cy.findByRole('menu').within(() => {
    cy.findByRole('menuitem', { name: 'Delete Step' }).click();
  });
  // cy.listbox(`${stepName}`, 'Delete Step');
});

When('I select target {string} of {string}', (targetType: string, stepName) => {
  cy.listbox(`data-target-type-${stepName}`, targetType);
});

// Target
When('I click Target of {string}', stepName => cy.collapse('Target', stepName));

//select target type
When('I select Target Type {string} of {string}', (targetType, stepName) =>
  cy.selectRadio(new RegExp(`Target Type ${stepName}`, 'gi'), targetType, {
    timeout: 500,
  }),
);

// Source
When('I click Source of {string}', stepName => cy.collapse('Source', stepName));

When('I click Advanced Options of {string}', stepName =>
  cy.collapse('Advanced Options', `${stepName}`),
);

When('I select connection {string}', (connectionName: string) =>
  cy.listbox(`Connection Name`, connectionName),
);
enum SqlEditorToggle {
  STEP_ICON,
  SOURCE_PANEL,
}
const clickSourceSqlEditor = (editor: SqlEditorToggle) => stepName => {
  cy.findByLabelText(RegExp(`^${stepName} content$`, 'i')).within(() => {
    cy.findAllByLabelText(`expand SQL Query - ${stepName}`).eq(editor).click();
  });
};
When(
  'I click the Source SQL zoom icon of {string}',
  clickSourceSqlEditor(SqlEditorToggle.SOURCE_PANEL),
);
When(
  'I click Step {string} sql icon',
  clickSourceSqlEditor(SqlEditorToggle.STEP_ICON),
);
const hoverSourceSqlEditor = (editor: SqlEditorToggle) => stepName => {
  cy.findByLabelText(RegExp(`^${stepName} content$`, 'i')).within(() => {
    cy.findAllByLabelText(`expand SQL Query - ${stepName}`)
      .eq(editor)
      .trigger('mouseover', 'center');
  });
};
When(
  'I hover Step {string} SQL Expand Icon',
  hoverSourceSqlEditor(SqlEditorToggle.SOURCE_PANEL),
);

// Footer
When('I click Save', () => cy.clickButton('Save'));
When('I click Save Anyway', () => cy.clickButton('Save Anyway'));

// Action Step Commands
When(
  'I select {string} in Select action river of {string}',
  (stepType: string, stepName) => {
    cy.listbox(`Select REST Action for ${stepName}`, stepType);
  },
);

When('I select variable {string}', radio => {
  cy.selectRadioList('variable-type', radio);
});
When('I select {string} in Variable Name', (optionName: string) => {
  cy.listbox('Variable Name', optionName);
});

When(
  'I add variable {string} to Variable Name of {string}',
  (varName: string, stepName: string) => {
    cy.findStep(stepName).within(() => {
      cy.listboxOpen(`Variable Name`).within(() => {
        cy.get('input').type(varName).wait(500).type(`{enter}`);
      });
    });
  },
);

When('I see Create page', () =>
  cy
    .findByText('Create Data Pipelines & Workflows', {
      timeout: 6000,
    })
    .should('exist'),
);

When('I scroll Logic Steps to top', () => {
  cy.findByLabelText('Logic Steps').scrollTo(0, 0);
})
When('I scroll Logic Steps to bottom', () => {
  cy.findByLabelText('Logic Steps').scrollTo(0, 10000);
})
When('I scroll to {string}', (text:string) => {
  cy.findByText(text).scrollIntoView();
})

// Validations
Then('I see the invalid message', () => {
  cy.get('body').within(() => {
    cy.findByText('Something is not right')
    cy.findByText('Some steps are not valid. Are you sure you want to save this data flow?')
  })
})