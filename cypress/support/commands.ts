/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-undef */
import '@testing-library/cypress/add-commands';
// import { addMatchImageSnapshotCommand } from 'cypress-image-snapshot/command';
// to emulate a real css "hover" in cypress, this plugin makes sure to make it right for this
// ref: https://filiphric.com/hover-in-cypress
import './login.commands';

export * as rtl from '@testing-library/cypress/add-commands';

// addMatchImageSnapshotCommand();

export type PositionType =
  | 'topLeft'
  | 'top'
  | 'topRight'
  | 'left'
  | 'center'
  | 'right'
  | 'bottomLeft'
  | 'bottom'
  | 'bottomRight';

// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
declare global {
  namespace Cypress {
    interface Chainable {
      
      /**
       * Custom command to login with a user.
       * @example cy.login(user)
       */
      login(
        credentials: {
          email: string;
          password: string;
        },
        assert?: boolean,
      ): Chainable<Element>;

      rivery(path?: string): Chainable<Element>;
      // select(id: string, value: string): Chainable<Element>;
      /**
       * click a value within a non-form react-select element
       */
      dropdown(id: string, value: string): Chainable<Element>;
      sidebar(item: string | RegExp): Chainable<Element>;
      disabledSidebar(item: string | RegExp): Chainable<Element>;
      view(): Chainable<Element>;
      column(column: number): Chainable<Element>;
      cell(row: number, column: number): Chainable<JQuery>;
      // matchImageSnapshot(name?, options?): Chainable<any>;
      listbox: typeof listbox;
      listboxOpen: typeof listboxOpen;
      findDataAttribute: typeof findDataAttribute;
      visitFakeRiver: typeof visitFakeRiver;
    }
  }
}
//
// -- This is a parent command --
Cypress.Commands.add('login', ({ email, password }, assert = true) => {
  cy.session([email, password], () => {
    cy.location('pathname').should('not.include', 'auth');
  },{ cacheAcrossSpecs: true})
});

Cypress.Commands.add('rivery', (path = '') => {
  const sanitizedPath = !path.startsWith('/') ? `/${path}` : path;
  cy.visit(`${sanitizedPath}`);
});

const findListBox = (
  name: string,
  position: PositionType | undefined = undefined,
  listboxIndex: number | undefined = undefined,
) => {
  const listBox =
    listboxIndex === undefined
      ? cy.findByRole('listbox', { name }).should('exist')
      : cy.findAllByRole('listbox', { name }).eq(listboxIndex).should('exist');

  if (position) {
    return listBox.click(position, { scrollBehavior: 'center' });
  } else {
    return listBox.click({ scrollBehavior: 'center' });
  }
};

const listboxOpen = (name: string) => {
  return findListBox(name);
};
Cypress.Commands.add('listboxOpen', listboxOpen);

const listBoxSelectionTimeout = 100;
const listbox = (
  name: string,
  value: string,
  position: PositionType | undefined = undefined,
  listboxIndex: number | undefined = undefined,
) => {
  findListBox(name, position, listboxIndex)
    .then(() => {
      cy.wait(100);
      cy.findByLabelText(`${name} options list`);
    })
    .within(() => {
      if (!isNaN(Number(value)) && parseInt(value) === parseFloat(value)) {
        cy.findAllByRole('option')
        .eq(parseInt(value))
        .click({ scrollBehavior: 'center', force: true }).wait(listBoxSelectionTimeout);
      } else {
        cy.findAllByRole('option').then(() => {
          cy.contains(value).click({ scrollBehavior: 'center', force: true }).wait(listBoxSelectionTimeout)
        })
        // cy.findByRole('option', { name: value }).click({ scrollBehavior: 'center' }).wait(listBoxSelectionTimeout);
      }
    });
};
Cypress.Commands.add('listbox', listbox);

const findDataAttribute = (
  prefix = '',
  attribute,
  value = '',
  negate = false,
) => {
  return cy
    .get(
      `[${['data', prefix, attribute].filter(Boolean).join('-')}="${value}"]`,
    )
    .should(`${negate ? 'not.' : ''}exist`);
};

Cypress.Commands.add('findDataAttribute', findDataAttribute);

const visitFakeRiver = () => {
  cy.rivery(
    'rivers/55bf7c4270fdca16cac18761/563fa39cdf14e54426d464ea/60755555548271001df7a3c4',
  );
};
Cypress.Commands.add('visitFakeRiver', visitFakeRiver);

Cypress.Commands.add('dropdown', (name: string, value: string) => {
  cy.findByRole('list', { name }).within(() => {
    cy.findByText(value).click();
  });
});

Cypress.Commands.add('sidebar', (item: string | RegExp) => {
  cy.findByRole('navigation', { name: 'sidebar' }).findByText(item).click();
});

Cypress.Commands.add('disabledSidebar', (item: string | RegExp) => {
  cy.findByRole('navigation', { name: 'sidebar' }).within(() => {
    cy.findByLabelText(item).should('have.css', 'pointer-events', 'none');
  });
});

Cypress.Commands.add('view', () => {
  cy.findByRole('main');
});
