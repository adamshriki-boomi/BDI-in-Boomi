import { Given } from "@badeball/cypress-cucumber-preprocessor";

Given('I navigate to users page', () => {
    cy.rivery('/users/account1/faked-env-2');
    cy.findByText('Users Management').should('be.visible');
  });

  Given('I want to edit user environments', () => {
    cy.interceptPatchApi('*/update_user', 'users/update_user.json');
  })

  Given('I want to add a new user', () => {
      cy.interceptPostApi('*/invite_user','users/invite_user.json' )
  })

  Given('I want to delete a user', () => {
    cy.interceptPostApi('*/delete_user','users/delete_user.json' )
})

Given('I want to view user', () => {
  cy.interceptGetApi1('*users/*', 'users/get_user.json');
})

Given('I want to view user permissions', () => {
  cy.interceptGetApi1('*permissions', 'users/permissions.json');
})