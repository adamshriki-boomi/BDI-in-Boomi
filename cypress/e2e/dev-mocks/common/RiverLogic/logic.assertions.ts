import { Then } from '@badeball/cypress-cucumber-preprocessor';
import { enviromentUrls } from '../interceptions/logic.rivers';
import { modifyRiver } from '../river-footer.steps';

/**
 * River Logic DSL Assertions
 * a higher level of river logic specific assertions
 * the purpose is make river logic assertions DRY
 */

Then('I see Container {string} is Disabled', (containerName: string) => {
  cy.findByRole('group', { name: containerName }).should(
    'have.attr',
    'aria-disabled',
    'true',
  );
});

// SQL Script
Then('I see {string} in Target Select of {string}', (targetType: string, stepName: string) => {
  cy.get(`[aria-label="${stepName} content"]`).within(() => {
    cy.findByRole('listbox', {
      name: `data-target-type-${stepName.replace(/\s+/g, '-')}`,
    }).within(() => {
      cy.findByText(targetType).should('be.visible');
    });
  });
});

// Action Step
Then('I see {string} in Select data flow of {string}', (optionName: string, stepName: string) => {
  cy.get(`[aria-label="${stepName} content"]`).within(() => {
    cy.findByRole('listbox', {
      name: `Select REST Action for ${stepName}`,
    }).within(() => {
      cy.findByText(optionName);
    });
  });
});

Then(
  "I don't see {string} in Select data flow of {string}",
  (optionName: string, stepName: string) => {
    cy.get(`[aria-label="${stepName} content"]`).within(() => {
      cy.findByRole('listbox', { name: `Select REST Action for ${stepName}` })
        .click({ scrollBehavior: 'center' })
        .then(() => {
          cy.findByText(optionName).should('not.exist');
        });
    });
  },
);

Then('I see Variable Name with {string}', optionName => {
  cy.findByRole('listbox', { name: 'Variable Name' })
    .find('.select-form-group__single-value')
    .should('have.text', optionName);
});

// Node Header
Then('I see Disabled Errors Icon in {string}', (stepName: string) => {
  cy.get(`[aria-label="${stepName} content"]`).within(() => {
    cy.findByRole('button', { name: 'tooltip icon ignore errors' }).should('be.visible');
  });
});

Then('I see Logic Icon', () => {
  cy.findByRole('figure', { name: 'logic' });
});

Then('I see Loading Animation', () => {
  cy.findByRole('figure', { name: 'loading animation' }).should('be.visible');
});

/**
 * @property stepIndex {string} - a dot separated index (zero based) that points to a step
 * i.e logic_steps[0].nodes[0] -> "0.0"
 */
Then(
  'I see {string} has been saved properly for step index {string}',
  (propValue: string, stepIndex: string) => {
    cy.wait(`@${modifyRiver}`).then(({ request }) => {
      const logicSteps = {
        nodes: request.body.tasks_definitions[0].task_config.logic_steps,
      };
      const step = stepIndex.split('.').reduce((result, nextIndex) => {
        return result.nodes[nextIndex];
      }, logicSteps);
      expect(Object.values(step.content)).to.have.contain(propValue);
    });
  },
);

/**
 * @property stepIndex {string} - a dot separated index (zero based) that points to a step
 * i.e logic_steps[0].nodes[0] -> "0.0"
 */
Then(
  'I see step in index {string} has been saved with {string}',
  (stepIndex: string, propKey: string) => {
    cy.wait(`@${modifyRiver}`).then(({ request }) => {
      const logicSteps = {
        nodes: request.body.tasks_definitions[0].task_config.logic_steps,
      };
      const step = stepIndex.split('.').reduce((result, nextIndex) => {
        return result.nodes[nextIndex];
      }, logicSteps);
      expect(Object.keys(step)).to.have.contain(propKey);
    });
  },
);

Then(
  'I see environment variable {string} has been saved',
  (varName: string) => {
    cy.wait(`@${enviromentUrls.add_variable}`).then(({ request }) => {
      expect(request.body.variable).to.contain(varName);
    });
  },
);
