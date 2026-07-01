 export * as rtl from '@testing-library/cypress/add-commands';
Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from
  // failing the test
  return false
})
declare global {
  namespace Cypress {
    interface Chainable {
    signInTest(): Chainable<Element>;
    signInAdmin(): Chainable<Element>;
    signInFake: typeof signInFake;
    signInRealWithSuperAdmin: typeof signInRealWithSuperAdmin;
    signInRealWithAdmin: typeof signInRealWithAdmin;
    signInRealWithDifferentRoles: typeof signInRealWithDifferentRoles;
    signOut(): Chainable<Element>;
    selectAdminAccount: typeof selectAdminAccount;
    }
  }
}

const signInFake = (assert = true) => {
  cy.login(
    {
      email: 'faked@user.com',
      password: 'faked-password',
    },
    assert,
  );
};
Cypress.Commands.add('signInFake', signInFake);

/**
 * selects the admin email related account
 */
const selectAdminAccount = () => {
  cy.findByText('Select an account').should('be.visible');
  cy.clickButton(Cypress.env('account_name'))
};
Cypress.Commands.add('selectAdminAccount', selectAdminAccount);

Cypress.Commands.add('signOut', () => {
  cy.clearCookies();
});


const signInRealWithSuperAdmin = () => {
  cy.session(`superAdminSession-${Cypress.env('ENVIRONMENT')}`, () => {
    cy.visit('/login');
    cy.get('input[aria-label="Password"]').should('exist').should('be.visible').type(Cypress.env('PASSWORD'), {force: true});
    cy.get('input[aria-label="Email"]',{ timeout: 10000 }).should('be.visible').then(($input) => cy.wrap($input).type(Cypress.env('EMAIL')));
    cy.get('form').submit();
    cy.location('pathname').should('not.include', 'auth');
    cy.location('pathname').should('include', 'accounts');
    cy.get('button[aria-label="Rivery"]').click();
    cy.location('pathname').then(path => {
      const account = path.split('/')[2]
      cy.window().then((win) => {
        win.sessionStorage.setItem('selectedAccountId', account);
      });
    })
    

  },{ cacheAcrossSpecs: true})
};
Cypress.Commands.add('signInRealWithSuperAdmin', signInRealWithSuperAdmin);

const signInRealWithAdmin = () => {
  // cy.session(`adminSession-${Cypress.env('ENVIRONMENT')}`, () => {
    cy.visit('/login');
    cy.get('input[aria-label="Password"]').should('exist').should('be.visible').type(Cypress.env('PASSWORD'),{force:true});
    cy.get('input[aria-label="Email"]',{ timeout: 10000 }).should('be.visible').then(($input) => cy.wrap($input).type(Cypress.env('EMAIL')));
    cy.intercept('GET', '*environments*').as('getEnvironments');
    cy.get('form').submit();
    cy.wait('@getEnvironments');
    cy.sidebar('Dashboard')
    cy.location('pathname').then(path => {
      const account = path.split('/')[2]
      cy.window().then((win) => {
        win.sessionStorage.setItem('selectedAccountId', account);
      });
    })
  // },{ cacheAcrossSpecs: true})
};
Cypress.Commands.add('signInRealWithAdmin', signInRealWithAdmin);


const signInRealWithDifferentRoles = () => {
  cy.session(`userSession-${Cypress.env('ENVIRONMENT')}`, () => {
    cy.visit('/login');
    cy.get('input[aria-label="Password"]').should('exist').should('be.visible').type(Cypress.env('PASSWORD'),{force:true});
    cy.get('input[aria-label="Email"]',{ timeout: 10000 }).should('be.visible').then(($input) => cy.wrap($input).type(Cypress.env('EMAIL')));
    cy.intercept('GET', '*environments*').as('getEnvironments');
    cy.get('form').submit();
    cy.wait('@getEnvironments');
    cy.sidebar('Dashboard')
    cy.location('pathname').then(path => {
      const account = path.split('/')[2]
      cy.window().then((win) => {
        win.sessionStorage.setItem('selectedAccountId', account);
      });
    })
  },{ cacheAcrossSpecs: true})
};
Cypress.Commands.add('signInRealWithDifferentRoles', signInRealWithDifferentRoles);